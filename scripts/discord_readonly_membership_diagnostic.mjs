import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import {
  installDiscordReadOnlyGuards,
  readDiscordShellSafetyState,
  assertDiscordReadOnlyState
} from './discord_readonly_guard.mjs';

const require = createRequire(import.meta.url);
const nodeModules = process.env.CODEX_NODE_MODULES;
if (!nodeModules) throw new Error('CODEX_NODE_MODULES is required');
const { chromium } = require(path.join(nodeModules, 'playwright'));

const targetUrl = process.argv[2];
const targetRoute = targetUrl?.match(/^https:\/\/discord(app)?\.com\/channels\/(\d+)\/(\d+)$/i);
if (!targetRoute) throw new Error('Pass one exact Discord channel URL as the only argument');

const expectedRoute = { guildId: targetRoute[2], channelId: targetRoute[3] };
const workspaceRoot = path.resolve('work/discord-readonly');
const profileDir = path.join(workspaceRoot, 'profile');
const logDir = path.join(workspaceRoot, 'logs');
await fs.mkdir(logDir, { recursive: true });

const browserExecutable = process.env.DISCORD_PROOF_BROWSER ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const networkBlocks = [];
const apiObservations = [];
const startedAt = Date.now();

const isRelevantMembershipPath = (pathname) => (
  pathname === '/api/v9/users/@me/guilds' ||
  pathname === `/api/v9/guilds/${expectedRoute.guildId}/members/@me` ||
  pathname === `/api/v9/guilds/${expectedRoute.guildId}/preview` ||
  pathname === `/api/v9/guilds/${expectedRoute.guildId}/member-verification`
);

const result = {
  test: 'discord-readonly-membership-diagnostic',
  targetUrl,
  expectedRoute,
  dedicatedProfileUsed: true,
  directNavigationOnly: true,
  messageContentInspected: false,
  externalDiscordStateChanged: false,
  status: 'unknown',
  failureReason: null,
  shell: null,
  nonMessageMarkers: null,
  lurkerRequest: null,
  relevantApiObservations: []
};

const context = await chromium.launchPersistentContext(profileDir, {
  headless: true,
  executablePath: browserExecutable,
  args: ['--no-proxy-server']
});

await installDiscordReadOnlyGuards(context, {
  guardVersion: 'discord-readonly-v1',
  networkBlocks
});

context.on('request', (request) => {
  let parsed;
  try {
    parsed = new URL(request.url());
  } catch {
    return;
  }
  if (!/(^|\.)discord(app)?\.com$/i.test(parsed.hostname)) return;
  if (!isRelevantMembershipPath(parsed.pathname)) return;
  apiObservations.push({
    phase: 'request',
    elapsedMs: Date.now() - startedAt,
    method: request.method().toUpperCase(),
    path: parsed.pathname,
    query: parsed.pathname.endsWith('/members/@me') ? parsed.search : ''
  });
});

context.on('response', (response) => {
  const request = response.request();
  let parsed;
  try {
    parsed = new URL(response.url());
  } catch {
    return;
  }
  if (!/(^|\.)discord(app)?\.com$/i.test(parsed.hostname)) return;
  if (!isRelevantMembershipPath(parsed.pathname)) return;
  apiObservations.push({
    phase: 'response',
    elapsedMs: Date.now() - startedAt,
    method: request.method().toUpperCase(),
    path: parsed.pathname,
    query: parsed.pathname.endsWith('/members/@me') ? parsed.search : '',
    status: response.status()
  });
});

try {
  const page = await context.newPage();
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  const safety = await readDiscordShellSafetyState(page, { expectedRoute });
  result.shell = {
    url: safety.url,
    title: safety.title,
    heartbeat: safety.heartbeat,
    activeEditable: safety.activeEditable,
    enabledMutatorCount: safety.enabledMutatorCount,
    hasLoginGate: safety.hasLoginGate,
    hasInviteGate: safety.hasInviteGate,
    shellMarkers: safety.shellMarkers,
    routeIdentity: safety.routeIdentity
  };

  assertDiscordReadOnlyState(safety, {
    guardVersion: 'discord-readonly-v1',
    failOnGate: false
  });
  if (!safety.routeIdentity?.matches) throw new Error('expected route identity was not preserved');
  if (!safety.shellMarkers?.appMount) throw new Error('Discord app shell mount was not detected');

  result.nonMessageMarkers = await page.evaluate(({ guildId, channelId }) => {
    const exactGuildPath = `/channels/${guildId}`;
    const exactChannelPath = `/channels/${guildId}/${channelId}`;
    const anchors = [...document.querySelectorAll('a[href]')];
    const labels = [...document.querySelectorAll('button, [role="button"]')]
      .map((element) => element.getAttribute('aria-label') || element.getAttribute('title') || '')
      .map((value) => value.trim())
      .filter((value) => /^(join|accept|verify|complete|continue|rules|roles?)(\b|$)/i.test(value))
      .slice(0, 20);
    return {
      authenticatedShell: !document.querySelector('[name="email"], [name="password"], form[action*="login" i]'),
      targetGuildAnchorCount: anchors.filter((anchor) => anchor.getAttribute('href')?.startsWith(exactGuildPath)).length,
      exactChannelAnchorCount: anchors.filter((anchor) => anchor.getAttribute('href') === exactChannelPath).length,
      gateControlLabels: [...new Set(labels)],
      hasMemberListShell: Boolean(document.querySelector('[aria-label*="Members" i], [data-list-id*="members" i]')),
      hasChannelNavigationShell: Boolean(document.querySelector('[aria-label*="Channels" i], [data-list-id*="channels" i]'))
    };
  }, expectedRoute);

  const lurkerBlock = networkBlocks.find((block) => {
    if (block.method !== 'PUT') return false;
    try {
      const parsed = new URL(block.url);
      return parsed.pathname === `/api/v9/guilds/${expectedRoute.guildId}/members/@me` &&
        parsed.searchParams.get('lurker') === 'true';
    } catch {
      return false;
    }
  });
  result.lurkerRequest = lurkerBlock ? {
    observed: true,
    method: lurkerBlock.method,
    path: new URL(lurkerBlock.url).pathname,
    query: new URL(lurkerBlock.url).search,
    blocked: true
  } : { observed: false, blocked: false };
  result.status = lurkerBlock ? 'membership_or_hydration_request_blocked' : 'shell_clean_without_lurker_request';
} catch (error) {
  result.status = 'failed_closed';
  result.failureReason = error.message;
} finally {
  result.relevantApiObservations = apiObservations;
  await context.close();
  const logPath = path.join(logDir, `membership-diagnostic-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  await fs.writeFile(logPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ ...result, logPath }, null, 2));
  if (result.status === 'failed_closed') process.exitCode = 2;
}
