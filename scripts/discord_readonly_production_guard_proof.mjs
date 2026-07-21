import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

import {
  createReadOnlySurveySurface,
  installDiscordReadOnlyGuards,
  readDiscordSafetyState,
  assertDiscordReadOnlyState
} from './discord_readonly_guard.mjs';

const require = createRequire(import.meta.url);
const nodeModules = process.env.CODEX_NODE_MODULES;
if (!nodeModules) throw new Error('CODEX_NODE_MODULES is required');
const { chromium } = require(path.join(nodeModules, 'playwright'));

const fixturePath = path.resolve('research/fixtures/discord-readonly/fixture.html');
const fixtureUrl = pathToFileURL(fixturePath).href;
const browserExecutable = process.env.DISCORD_PROOF_BROWSER || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const results = [];
const record = (name, pass, detail) => results.push({ name, pass, detail });
const expectFailure = async (name, action, expected) => {
  try {
    await action();
    record(name, false, 'did not fail closed');
  } catch (error) {
    record(name, String(error.message).includes(expected), error.message);
  }
};

const browser = await chromium.launch({
  headless: true,
  executablePath: browserExecutable,
  args: ['--no-proxy-server']
});
const networkBlocks = [];
const context = await browser.newContext();
await installDiscordReadOnlyGuards(context, {
  guardVersion: 'discord-readonly-v1',
  networkBlocks
});

try {
  const page = await context.newPage();
  await page.goto(fixtureUrl, { waitUntil: 'domcontentloaded' });
  const state = await readDiscordSafetyState(page);
  assertDiscordReadOnlyState(state, {
    requireDiscordHost: false,
    failOnGate: false
  });
  record('production guard heartbeat and disabled controls present',
    state.heartbeat?.version === 'discord-readonly-v1' && state.enabledMutatorCount === 0,
    JSON.stringify(state));

  const publicSurface = createReadOnlySurveySurface(context);
  record('survey surface exposes only shell navigation',
    Object.keys(publicSurface).join(',') === 'openShell',
    Object.keys(publicSurface).join(','));
  await expectFailure(
    'non-Discord target rejected before navigation',
    () => publicSurface.openShell(fixtureUrl),
    'target must be an exact Discord channel URL'
  );

  await page.evaluate(async () => {
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      await fetch('https://discord.com/api/v10/channels/123/messages', { method, body: '{}' }).catch(() => {});
    }
  });
  record('Discord mutation requests blocked and logged',
    networkBlocks.length === 4,
    JSON.stringify(networkBlocks));

  const noGuardContext = await browser.newContext();
  const noGuardPage = await noGuardContext.newPage();
  await noGuardPage.goto(fixtureUrl, { waitUntil: 'domcontentloaded' });
  await expectFailure(
    'missing guard fails closed',
    async () => assertDiscordReadOnlyState(await readDiscordSafetyState(noGuardPage), {
      requireDiscordHost: false,
      failOnGate: false
    }),
    'missing or mismatched read-only guard heartbeat'
  );
  await noGuardContext.close();

  await expectFailure(
    'editable focus fails closed',
    async () => assertDiscordReadOnlyState({
      host: 'discord.com',
      heartbeat: { active: true, version: 'discord-readonly-v1' },
      activeEditable: true,
      enabledMutatorCount: 0,
      hasLoginGate: false,
      hasInviteGate: false
    }),
    'editable element has focus'
  );

  await expectFailure(
    'gated state fails closed',
    async () => assertDiscordReadOnlyState({
      host: 'discord.com',
      heartbeat: { active: true, version: 'discord-readonly-v1' },
      activeEditable: false,
      enabledMutatorCount: 0,
      hasLoginGate: false,
      hasInviteGate: true
    }),
    'gated state detected'
  );

  const failed = results.filter((result) => !result.pass);
  console.log(JSON.stringify({ passed: results.length - failed.length, failed: failed.length, results }, null, 2));
  if (failed.length) process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
}
