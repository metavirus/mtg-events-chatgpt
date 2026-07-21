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
const networkBlocks = [];
const context = await chromium.launchPersistentContext(profileDir, {
  headless: true,
  executablePath: browserExecutable,
  args: ['--no-proxy-server']
});

const result = {
  test: 'discord-real-shell-safety',
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
  shell: null
};

try {
  await installDiscordReadOnlyGuards(context, {
    guardVersion: 'discord-readonly-v1',
    networkBlocks
  });

  const page = await context.newPage();
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  const safety = await readDiscordShellSafetyState(page, { expectedRoute });
  result.shell = {
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

  await page.evaluate(async () => {
    await fetch('https://discord.com/api/v10/channels/0/messages', { method: 'POST', body: '{}' }).catch(() => {});
  });
  result.blockedMutationCount = networkBlocks.length;

  assertDiscordReadOnlyState(safety, {
    guardVersion: 'discord-readonly-v1'
  });

  if (!safety.routeIdentity?.matches) {
    throw new Error('expected Discord route identity was not preserved');
  }

  if (!safety.shellMarkers?.appMount) {
    throw new Error('Discord app shell mount was not detected');
  }

  if (networkBlocks.length !== 1) throw new Error(`expected one blocked mutation proof request, saw ${networkBlocks.length}`);

  result.status = 'passed_shell_safety';
} catch (error) {
  result.status = 'failed_closed';
  result.failureReason = error.message;
  result.blockedMutationCount = networkBlocks.length;
} finally {
  await context.close();
  const logPath = path.join(logDir, `real-shell-test-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  await fs.writeFile(logPath, `${JSON.stringify({ ...result, networkBlocks }, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ ...result, logPath, networkBlocks }, null, 2));
  if (result.status !== 'passed_shell_safety') process.exitCode = 2;
}
