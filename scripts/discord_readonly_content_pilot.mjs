import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import {
  installDiscordReadOnlyGuards,
  readDiscordShellSafetyState,
  assertDiscordReadOnlyState,
  extractDiscordVisibleMessages
} from './discord_readonly_guard.mjs';

const require = createRequire(import.meta.url);
const nodeModules = process.env.CODEX_NODE_MODULES;
if (!nodeModules) throw new Error('CODEX_NODE_MODULES is required');
const { chromium } = require(path.join(nodeModules, 'playwright'));

const targetUrl = process.argv[2];
if (!targetUrl || !/^https:\/\/discord(app)?\.com\/channels\/\d+\/\d+$/i.test(targetUrl)) {
  throw new Error('Pass one exact Discord channel URL as the only argument');
}

const targetRoute = targetUrl.match(/^https:\/\/discord(app)?\.com\/channels\/(\d+)\/(\d+)$/i);
const expectedRoute = {
  guildId: targetRoute[2],
  channelId: targetRoute[3]
};

const workspaceRoot = path.resolve('work/discord-readonly');
const profileDir = path.join(workspaceRoot, 'profile');
const logDir = path.join(workspaceRoot, 'logs');
await fs.mkdir(profileDir, { recursive: true });
await fs.mkdir(logDir, { recursive: true });

const browserExecutable = process.env.DISCORD_PROOF_BROWSER || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const result = {
  test: 'discord-readonly-content-pilot',
  targetUrl,
  profileDir,
  dedicatedProfileUsed: true,
  directNavigationOnly: true,
  messageContentInspected: false,
  researchArtifactsCreated: false,
  routePromoted: false,
  externalDiscordStateChanged: false,
  blockedMutationCount: 0,
  status: 'unknown',
  failureReason: null,
  retryApplied: false,
  attempts: [],
  shell: null,
  messageCount: 0,
  messages: []
};

const isLurkerInterstitialBlock = (block) => (
  block.method === 'PUT' &&
  /\/api\/v\d+\/guilds\/[^/]+\/members\/@me\?lurker=true/i.test(block.url)
);

async function runAttempt(attemptNumber) {
  const networkBlocks = [];
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: true,
    executablePath: browserExecutable,
    args: ['--no-proxy-server']
  });
  const attempt = {
    attemptNumber,
    status: 'unknown',
    failureReason: null,
    blockedMutationCount: 0,
    lurkerInterstitialBlocked: false,
    shell: null,
    messageCount: 0,
    messages: [],
    networkBlocks
  };

  await installDiscordReadOnlyGuards(context, {
    guardVersion: 'discord-readonly-v1',
    networkBlocks
  });

  try {
    const page = await context.newPage();
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(5000);

    const safety = await readDiscordShellSafetyState(page, { expectedRoute });
    attempt.shell = {
      url: safety.url,
      host: safety.host,
      title: safety.title,
      heartbeat: safety.heartbeat,
      activeEditable: safety.activeEditable,
      enabledMutatorCount: safety.enabledMutatorCount,
      enabledMutatorLabels: safety.enabledMutatorLabels,
      hasLoginGate: safety.hasLoginGate,
      hasInviteGate: safety.hasInviteGate,
      shellMarkers: safety.shellMarkers,
      routeIdentity: safety.routeIdentity
    };

    assertDiscordReadOnlyState(safety, {
      guardVersion: 'discord-readonly-v1'
    });

    if (!safety.routeIdentity?.matches) {
      throw new Error('expected Discord route identity was not preserved');
    }

    if (!safety.shellMarkers?.appMount) {
      throw new Error('Discord app shell mount was not detected');
    }

    attempt.blockedMutationCount = networkBlocks.length;
    attempt.lurkerInterstitialBlocked = networkBlocks.some(isLurkerInterstitialBlock);
    if (attempt.lurkerInterstitialBlocked) {
      throw new Error('known Discord membership/lurker interstitial request blocked');
    }

    const messages = await extractDiscordVisibleMessages(page, {
      limit: 8,
      maxCharactersPerMessage: 1200
    });
    attempt.messages = messages;
    attempt.messageCount = messages.length;
    attempt.blockedMutationCount = networkBlocks.length;
    attempt.status = messages.length === 0 ? 'quiet_or_no_visible_messages' : 'content_read_succeeded';
  } catch (error) {
    attempt.status = 'failed_closed';
    attempt.failureReason = error.message;
    attempt.blockedMutationCount = networkBlocks.length;
    attempt.lurkerInterstitialBlocked = networkBlocks.some(isLurkerInterstitialBlock);
  } finally {
    await context.close();
  }
  return attempt;
}

try {
  const firstAttempt = await runAttempt(1);
  result.attempts.push(firstAttempt);
  let finalAttempt = firstAttempt;

  if (firstAttempt.lurkerInterstitialBlocked) {
    result.retryApplied = true;
    const retryAttempt = await runAttempt(2);
    result.attempts.push(retryAttempt);
    finalAttempt = retryAttempt;
    if (retryAttempt.lurkerInterstitialBlocked) {
      result.status = 'blocked_for_this_run';
      result.failureReason = 'known Discord membership/lurker interstitial recurred after one direct-navigation retry';
    }
  }

  if (result.status === 'unknown') {
    result.status = finalAttempt.status;
    result.failureReason = finalAttempt.failureReason;
  }
  result.shell = finalAttempt.shell;
  result.messages = finalAttempt.messages;
  result.messageCount = finalAttempt.messageCount;
  result.messageContentInspected = finalAttempt.status === 'content_read_succeeded' || finalAttempt.status === 'quiet_or_no_visible_messages';
  result.blockedMutationCount = result.attempts.reduce((count, attempt) => count + attempt.blockedMutationCount, 0);

  if (result.status === 'failed_closed') {
    result.failureReason = result.failureReason || 'content-read attempt failed closed';
  } else {
    result.failureReason = result.failureReason || null;
  }
} catch (error) {
  result.status = 'failed_closed';
  result.failureReason = error.message;
} finally {
  const logPath = path.join(logDir, `content-pilot-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  await fs.writeFile(logPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ ...result, logPath }, null, 2));
  if (result.status === 'failed_closed' || result.status === 'blocked_for_this_run') process.exitCode = 2;
}
