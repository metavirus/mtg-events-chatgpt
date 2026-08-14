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
const allowedReadinessRequests = [];
const result = {
  test: 'discord-readonly-channel-inventory',
  targetUrl,
  profileDir,
  externalDiscordStateChanged: false,
  status: 'unknown',
  failureReason: null,
  blockedMutationCount: 0,
  allowedReadinessTransitionCount: 0,
  shell: null,
  guildId: expectedRoute.guildId,
  channels: []
};

const context = await chromium.launchPersistentContext(profileDir, {
  headless: true,
  executablePath: browserExecutable,
  args: ['--no-proxy-server']
});

await installDiscordReadOnlyGuards(context, {
  guardVersion: 'discord-readonly-v1',
  networkBlocks,
  allowedReadinessRequests,
  expectedRoute
});

try {
  const page = await context.newPage();
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  const safety = await readDiscordShellSafetyState(page, { expectedRoute });
  result.shell = {
    url: safety.url,
    host: safety.host,
    title: safety.title,
    heartbeat: safety.heartbeat,
    activeEditable: safety.activeEditable,
    enabledMutatorCount: safety.enabledMutatorCount,
    hasLoginGate: safety.hasLoginGate,
    hasInviteGate: safety.hasInviteGate,
    gateLabels: safety.gateLabels,
    shellMarkers: safety.shellMarkers,
    routeIdentity: safety.routeIdentity
  };
  assertDiscordReadOnlyState(safety, { guardVersion: 'discord-readonly-v1' });
  if (!safety.routeIdentity?.matches) throw new Error('expected Discord route identity was not preserved');

  result.channels = await page.evaluate(({ guildId }) => {
    const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
    const isVisible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };

    const anchors = [...document.querySelectorAll(`a[href^="/channels/${guildId}/"], a[href^="https://discord.com/channels/${guildId}/"]`)]
      .filter(isVisible);
    const seen = new Map();
    for (const anchor of anchors) {
      const href = anchor.getAttribute('href') || '';
      const match = href.match(new RegExp(`/channels/${guildId}/(\\d+)`));
      if (!match) continue;
      const channelId = match[1];
      const label = normalize(
        anchor.getAttribute('aria-label') ||
        anchor.querySelector('[class*="name"]')?.textContent ||
        anchor.textContent ||
        ''
      );
      const parent = anchor.closest('[role="treeitem"], li, [class*="container"]');
      const contextText = normalize(parent?.innerText || anchor.innerText || label);
      if (!seen.has(channelId)) {
        seen.set(channelId, {
          channelId,
          href: `https://discord.com/channels/${guildId}/${channelId}`,
          label,
          contextText: contextText.slice(0, 300)
        });
      }
    }
    return [...seen.values()];
  }, { guildId: expectedRoute.guildId });

  result.status = 'inventory_succeeded';
} catch (error) {
  result.status = 'failed_closed';
  result.failureReason = error.message;
} finally {
  result.blockedMutationCount = networkBlocks.length;
  result.allowedReadinessTransitionCount = allowedReadinessRequests.length;
  result.externalDiscordStateChanged = allowedReadinessRequests.length ? 'allowed_discord_lurker_readiness_ack' : false;
  await context.close();
  const logPath = path.join(logDir, `channel-inventory-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  await fs.writeFile(logPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ ...result, logPath }, null, 2));
  if (result.status === 'failed_closed') process.exitCode = 2;
}
