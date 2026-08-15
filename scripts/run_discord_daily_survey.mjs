import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const LOG_DIR = path.join(ROOT, 'work', 'discord-daily-survey', 'logs');
const LOCK_PATH = path.join(ROOT, 'work', 'discord-readonly', 'discord-daily-survey.lock');
const UI_NATIVE_MODE = 'ui_native_navigation_verified';
const EXACT_CHANNEL_URL = /^https:\/\/discord(?:app)?\.com\/channels\/(\d+)\/(\d+)$/i;
const V1_PROFILE_SOURCE_IDS = new Set([
  'src-discord-mtg-oc-community',
  'src-lcc-discord-2026-07-28',
  'src-collectors-discord-2026-07-14'
]);
const RESULT_TO_WATCHLIST = {
  accepted_signal: 'useful',
  event_candidate: 'useful',
  quiet_coverage: 'quiet',
  blocked_repair: 'needs_deeper_replay',
  stale_useful_context: 'stale'
};

function parseArgs(argv) {
  const args = {
    dryRun: false,
    planOnly: false,
    writeWatchlist: false,
    noSignalWrites: false,
    jsonLog: false,
    limit: null,
    surface: null,
    maxVisibleMessages: 5,
    maxReadWindows: 1
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--plan-only') args.planOnly = true;
    else if (arg === '--write-watchlist') args.writeWatchlist = true;
    else if (arg === '--no-signal-writes') args.noSignalWrites = true;
    else if (arg === '--json-log') args.jsonLog = true;
    else if (arg === '--limit') args.limit = Number.parseInt(argv[++i] || '', 10);
    else if (arg === '--surface') args.surface = argv[++i] || null;
    else if (arg === '--max-visible-messages') args.maxVisibleMessages = Number.parseInt(argv[++i] || '', 10);
    else if (arg === '--max-read-windows') args.maxReadWindows = Number.parseInt(argv[++i] || '', 10);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (args.limit !== null && (!Number.isInteger(args.limit) || args.limit < 0)) {
    throw new Error('--limit must be a non-negative integer');
  }
  if (!Number.isInteger(args.maxVisibleMessages) || args.maxVisibleMessages < 1 || args.maxVisibleMessages > 5) {
    throw new Error('--max-visible-messages must be 1 through 5');
  }
  if (!Number.isInteger(args.maxReadWindows) || args.maxReadWindows < 1 || args.maxReadWindows > 10) {
    throw new Error('--max-read-windows must be 1 through 10');
  }
  if (args.writeWatchlist && !args.dryRun) args.noSignalWrites = true;
  return args;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 25 * 1024 * 1024,
    ...options
  });
  return result;
}

function assertOk(result, label) {
  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    throw new Error(`${label} failed${output ? `:\n${output}` : ''}`);
  }
}

function sqlLiteral(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replaceAll("'", "''")}'`;
}

function pgTextArrayToList(value) {
  if (Array.isArray(value)) return value;
  if (!value || value === '{}') return [];
  return String(value).replace(/^\{|\}$/g, '').split(',').map((part) => part.trim()).filter(Boolean);
}

function fetchWatchlistRows() {
  const sql = `
select
  w.id,
  w.profile_source_id,
  p.server_name,
  w.channel_source_id,
  w.channel_name,
  w.channel_url,
  w.channel_type,
  w.priority,
  w.cadence,
  w.monitoring_status,
  w.safe_access_mode,
  w.expected_signal_types,
  w.latest_run_result,
  w.last_checked_at,
  w.last_seen_message_id,
  w.last_seen_message_at,
  w.notes
from public.discord_channel_watchlist w
join public.discord_access_profiles p on p.source_id = w.profile_source_id
where w.monitoring_status = 'active'
order by
  case w.priority when 'high' then 1 when 'medium' then 2 else 3 end,
  case w.cadence when 'daily' then 1 when 'weekly' then 2 when 'occasional' then 3 else 4 end,
  p.server_name,
  w.channel_name;`;
  const result = run('python.exe', ['scripts/supabase_query.py', '--sql', sql]);
  assertOk(result, 'watchlist query');
  return JSON.parse(result.stdout).rows.map((row) => ({
    ...row,
    expected_signal_types: pgTextArrayToList(row.expected_signal_types)
  }));
}

function isV1Eligible(row) {
  return (
    V1_PROFILE_SOURCE_IDS.has(row.profile_source_id) &&
    row.monitoring_status === 'active' &&
    row.safe_access_mode === UI_NATIVE_MODE &&
    row.latest_run_result !== 'needs_deeper_replay' &&
    EXACT_CHANNEL_URL.test(row.channel_url || '')
  );
}

function applySurfaceFilter(rows, surface) {
  if (!surface) return rows;
  const needle = surface.toLowerCase();
  return rows.filter((row) => (
    row.id.toLowerCase().includes(needle) ||
    row.server_name.toLowerCase().includes(needle) ||
    row.channel_name.toLowerCase().includes(needle) ||
    row.profile_source_id.toLowerCase().includes(needle)
  ));
}

function folderNameFor(row) {
  if (row.server_name.includes('Collectors Lounge')) return 'Stores/Local';
  return '';
}

function preflight(rows) {
  if (rows.length === 0) return { skipped: true, stdout: 'No rows selected.' };
  const args = ['scripts/discord_route_preflight.py', '--method', 'ui_native'];
  for (const row of rows) args.push('--channel-url', row.channel_url);
  const result = run('python.exe', args);
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr
  };
}

function parseHarnessJson(stdout) {
  const start = stdout.indexOf('{');
  const end = stdout.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('Discord harness did not print JSON');
  return JSON.parse(stdout.slice(start, end + 1));
}

function runHarness(row, args) {
  const env = { ...process.env };
  if (!env.CODEX_NODE_MODULES) {
    env.CODEX_NODE_MODULES = 'C:\\Users\\kavig\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules';
  }
  const result = run('node', [
    'scripts/discord_readonly_ui_native_test.mjs',
    row.channel_url,
    'content',
    row.server_name,
    folderNameFor(row),
    row.channel_name,
    String(args.maxVisibleMessages),
    'routine_survey',
    String(args.maxReadWindows)
  ], { env });
  if (result.status !== 0) {
    let harness = null;
    try {
      harness = parseHarnessJson(result.stdout);
    } catch {
      harness = null;
    }
    return {
      rowId: row.id,
      channelName: row.channel_name,
      serverName: row.server_name,
      status: harness?.status || 'harness_failed',
      outcome: 'blocked_repair',
      watchlistResult: RESULT_TO_WATCHLIST.blocked_repair,
      routeState: harness?.routeState || 'blocked_for_this_run',
      failureStage: harness?.failureStage || null,
      failureReason: harness?.failureReason || null,
      externalDiscordStateChanged: harness?.externalDiscordStateChanged ?? null,
      prohibitedSuccessfulResponses: harness?.prohibitedSuccessfulResponses || [],
      logPath: harness?.logPath || null,
      error: harness
        ? null
        : [result.stdout, result.stderr].filter(Boolean).join('\n').slice(0, 4000)
    };
  }
  const harness = parseHarnessJson(result.stdout);
  return classifyHarness(row, harness);
}

function classifyHarness(row, harness) {
  const safe = harness.status === 'content_read_succeeded_safely' &&
    harness.routeState === 'ui_native_read_verified' &&
    harness.externalDiscordStateChanged === false &&
    (!harness.prohibitedSuccessfulResponses || harness.prohibitedSuccessfulResponses.length === 0);
  if (!safe) {
    return {
      rowId: row.id,
      status: harness.status || 'unsafe_or_unverified',
      outcome: 'blocked_repair',
      watchlistResult: RESULT_TO_WATCHLIST.blocked_repair,
      harness
    };
  }

  const latestAt = harness.messageWindow?.lastSeenMessageAt || null;
  const latestMs = latestAt ? Date.parse(latestAt) : NaN;
  const ageDays = Number.isFinite(latestMs) ? ((Date.now() - latestMs) / 86400000) : null;
  const useful = harness.usefulFindingPresent === true;
  const categories = harness.usefulCategories || [];
  let outcome = 'quiet_coverage';
  if (useful && ageDays !== null && ageDays > 30) outcome = 'stale_useful_context';
  else if (useful && categories.some((category) => ['event', 'cancellation_or_change', 'direct_question_or_request'].includes(category))) {
    outcome = 'event_candidate';
  } else if (useful) {
    outcome = 'accepted_signal';
  }
  return {
    rowId: row.id,
    channelName: row.channel_name,
    serverName: row.server_name,
    status: harness.status,
    outcome,
    watchlistResult: RESULT_TO_WATCHLIST[outcome],
    latestRunResult: harness.latestRunResult,
    routeState: harness.routeState,
    messageWindow: harness.messageWindow,
    usefulFindingPresent: harness.usefulFindingPresent,
    usefulCategories: categories,
    findingCandidates: harness.findingCandidates || [],
    externalDiscordStateChanged: harness.externalDiscordStateChanged,
    prohibitedSuccessfulResponses: harness.prohibitedSuccessfulResponses || [],
    logPath: harness.logPath
  };
}

async function writeWatchlist(results) {
  const writable = results.filter((result) => result.messageWindow && result.watchlistResult);
  if (writable.length === 0) return { skipped: true, reason: 'no writable results' };
  const values = writable.map((result) => {
    const note = `Daily Discord survey: ${result.outcome}; exact guarded UI-native route ${result.routeState}; ${result.messageWindow.messageCount || 0} visible messages; no external Discord state changed.`;
    return `(${[
      sqlLiteral(result.rowId),
      sqlLiteral(new Date().toISOString()),
      sqlLiteral(result.messageWindow.lastSeenMessageId || null),
      sqlLiteral(result.messageWindow.lastSeenMessageAt || null),
      sqlLiteral(result.watchlistResult),
      sqlLiteral(note)
    ].join(', ')})`;
  }).join(',\n');
  const sql = `
update public.discord_channel_watchlist as w
set
  last_checked_at = v.last_checked_at::timestamptz,
  last_seen_message_id = v.last_seen_message_id,
  last_seen_message_at = v.last_seen_message_at::timestamptz,
  latest_run_result = v.latest_run_result,
  notes = v.notes
from (values
${values}
) as v(id, last_checked_at, last_seen_message_id, last_seen_message_at, latest_run_result, notes)
where w.id = v.id
returning w.id, w.channel_name, w.latest_run_result, w.last_seen_message_id, w.last_seen_message_at;`;
  const result = run('python.exe', ['scripts/supabase_query.py', '--sql', sql]);
  assertOk(result, 'watchlist update');
  return JSON.parse(result.stdout).rows;
}

async function acquireRunLock(enabled) {
  if (!enabled) return null;
  await fs.mkdir(path.dirname(LOCK_PATH), { recursive: true });
  try {
    const handle = await fs.open(LOCK_PATH, 'wx');
    await handle.writeFile(JSON.stringify({
      pid: process.pid,
      startedAt: new Date().toISOString(),
      script: 'run_discord_daily_survey'
    }, null, 2));
    return handle;
  } catch (error) {
    if (error && error.code === 'EEXIST') {
      let lockText = '';
      try {
        lockText = await fs.readFile(LOCK_PATH, 'utf8');
      } catch {
        lockText = '(lock file exists but could not be read)';
      }
      throw new Error(`Discord daily survey is already running or the Chrome profile is locked. Lock: ${LOCK_PATH}\n${lockText}`);
    }
    throw error;
  }
}

async function releaseRunLock(handle) {
  if (!handle) return;
  await handle.close();
  await fs.unlink(LOCK_PATH).catch(() => {});
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  await fs.mkdir(LOG_DIR, { recursive: true });
  const lockHandle = await acquireRunLock(!args.planOnly);

  try {
    const allRows = fetchWatchlistRows();
    const eligible = applySurfaceFilter(allRows.filter(isV1Eligible), args.surface);
    const selected = args.limit === null ? eligible : eligible.slice(0, args.limit);
    const rowsByUrl = new Map();
    for (const row of allRows) {
      if (!row.channel_url) continue;
      const rows = rowsByUrl.get(row.channel_url) || [];
      rows.push(row);
      rowsByUrl.set(row.channel_url, rows);
    }
    const warnings = [];
    for (const row of selected) {
      const duplicates = (rowsByUrl.get(row.channel_url) || []).filter((candidate) => candidate.id !== row.id);
      if (duplicates.length > 0) {
        warnings.push({
          type: 'duplicate_channel_url',
          selectedId: row.id,
          selectedChannelName: row.channel_name,
          channelUrl: row.channel_url,
          duplicateRows: duplicates.map((candidate) => ({
            id: candidate.id,
            serverName: candidate.server_name,
            channelName: candidate.channel_name,
            latestRunResult: candidate.latest_run_result,
            profileSourceId: candidate.profile_source_id
          }))
        });
      }
    }
    const excluded = allRows
      .filter((row) => V1_PROFILE_SOURCE_IDS.has(row.profile_source_id) && !isV1Eligible(row))
      .map((row) => ({
        id: row.id,
        serverName: row.server_name,
        channelName: row.channel_name,
        reason: row.latest_run_result === 'needs_deeper_replay'
          ? 'needs_deeper_replay'
          : !EXACT_CHANNEL_URL.test(row.channel_url || '')
            ? 'not_exact_channel_url'
            : row.safe_access_mode !== UI_NATIVE_MODE
              ? `safe_access_mode=${row.safe_access_mode}`
              : `monitoring_status=${row.monitoring_status}`
      }));

    const runLog = {
      script: 'run_discord_daily_survey',
      version: 1,
      startedAt: new Date().toISOString(),
      dryRun: args.dryRun,
      planOnly: args.planOnly,
      writeWatchlist: args.writeWatchlist,
      noSignalWrites: args.noSignalWrites !== false,
      runLock: args.planOnly ? { used: false, reason: 'plan_only' } : { used: true, path: LOCK_PATH },
      allowlist: ['MTG OC', 'Legendary Creature Club eligible channel rows', 'Collectors Lounge'],
      selectedCount: selected.length,
      selected: selected.map((row) => ({
        id: row.id,
        serverName: row.server_name,
        channelName: row.channel_name,
        channelUrl: row.channel_url,
        priority: row.priority,
        cadence: row.cadence,
        expectedSignalTypes: row.expected_signal_types
      })),
      warnings,
      excluded,
      preflight: null,
      results: [],
      watchlistWrite: null,
      finishedAt: null
    };

    runLog.preflight = preflight(selected);
    if (runLog.preflight.status && runLog.preflight.status !== 0) {
      throw new Error(`Preflight denied selected rows:\n${runLog.preflight.stdout || ''}\n${runLog.preflight.stderr || ''}`);
    }

    if (!args.planOnly) {
      for (const row of selected) {
        runLog.results.push(runHarness(row, args));
      }
    }

    if (args.writeWatchlist && !args.dryRun && !args.planOnly) {
      runLog.watchlistWrite = await writeWatchlist(runLog.results);
    } else {
      runLog.watchlistWrite = { skipped: true, reason: args.dryRun ? 'dry_run' : args.planOnly ? 'plan_only' : 'write_watchlist_not_enabled' };
    }

    runLog.finishedAt = new Date().toISOString();
    const logPath = path.join(LOG_DIR, `discord-daily-survey-${runLog.finishedAt.replaceAll(':', '-')}.json`);
    await fs.writeFile(logPath, JSON.stringify(runLog, null, 2) + '\n', 'utf8');
    runLog.logPath = logPath;

    if (args.jsonLog) {
      console.log(JSON.stringify(runLog, null, 2));
    } else {
      console.log(`Discord daily survey v1 ${args.planOnly ? 'plan' : 'run'} complete.`);
      console.log(`Selected rows: ${selected.length}`);
      console.log(`Log: ${logPath}`);
    }
  } finally {
    await releaseRunLock(lockHandle);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exitCode = 1;
});
