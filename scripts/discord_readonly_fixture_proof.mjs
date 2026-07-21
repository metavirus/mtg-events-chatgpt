import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const nodeModules = process.env.CODEX_NODE_MODULES;
if (!nodeModules) throw new Error('CODEX_NODE_MODULES is required');
const { chromium } = require(path.join(nodeModules, 'playwright'));

const fixturePath = path.resolve('research/fixtures/discord-readonly/fixture.html');
const mutationMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const mutationSelector = [
  '[data-message-composer]',
  '[data-mutation-control]',
  '[contenteditable="true"]',
  'textarea',
  'input',
  'button'
].join(',');

const safetyBootstrap = ({ selector }) => {
  const isMutationTarget = (target) => target instanceof Element && Boolean(target.closest(selector));
  const block = (event) => {
    if (!isMutationTarget(event.target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  ['beforeinput', 'input', 'paste', 'drop', 'keydown', 'keyup', 'keypress', 'submit', 'click', 'pointerdown']
    .forEach((name) => document.addEventListener(name, block, true));

  const disable = () => {
    document.querySelectorAll(selector).forEach((element) => {
      if (element.getAttribute('aria-disabled') !== 'true') element.setAttribute('aria-disabled', 'true');
      if ('disabled' in element && !element.disabled) element.disabled = true;
      if (element.getAttribute('contenteditable') === 'true') element.setAttribute('contenteditable', 'false');
      if ('value' in element && element.value !== '') element.value = '';
      if (element.matches('[data-message-composer]') && element.textContent !== '') element.textContent = '';
      if (element.tabIndex !== -1) element.tabIndex = -1;
    });
  };
  new MutationObserver(disable).observe(document, { subtree: true, childList: true, attributes: true });
  document.addEventListener('DOMContentLoaded', disable, { once: true });
  window.__discordReadonlyGuard = Object.freeze({ version: 'fixture-v1', active: true });
};

async function safetyCheck(page) {
  return page.evaluate((selector) => {
    const root = document.documentElement;
    const active = document.activeElement;
    const activeEditable = active instanceof Element && (
      active.matches('input, textarea, [contenteditable="true"], [role="textbox"]')
    );
    const enabledMutators = [...document.querySelectorAll(selector)].filter((element) => {
      const editable = element.getAttribute('contenteditable') === 'true';
      const disabled = 'disabled' in element ? element.disabled : element.getAttribute('aria-disabled') === 'true';
      return editable || !disabled;
    });
    return {
      signature: root.dataset.readonlyFixture,
      accessState: root.dataset.accessState,
      heartbeat: window.__discordReadonlyGuard || null,
      activeEditable,
      enabledMutatorCount: enabledMutators.length
    };
  }, mutationSelector);
}

function assertSafeState(state) {
  if (state.signature !== 'discord-safety-v1') throw new Error('unexpected page state');
  if (state.accessState !== 'ready') throw new Error(`blocked/gated state: ${state.accessState}`);
  if (!state.heartbeat?.active || state.heartbeat.version !== 'fixture-v1') throw new Error('missing guard heartbeat');
  if (state.activeEditable) throw new Error('editable element has focus');
  if (state.enabledMutatorCount !== 0) throw new Error(`enabled mutating controls: ${state.enabledMutatorCount}`);
  return state;
}

async function assertSafe(page) {
  return assertSafeState(await safetyCheck(page));
}

function createReadOnlySurvey(context, networkBlocks) {
  const survey = async (url) => {
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await assertSafe(page);
      return await page.evaluate((blockedCount) => ({
        server: document.querySelector('[data-server-name]')?.textContent?.trim(),
        channel: document.querySelector('[data-channel-name]')?.textContent?.trim(),
        channelId: document.querySelector('[data-channel-id]')?.textContent?.trim(),
        messages: [...document.querySelectorAll('[data-message-id]')].map((message) => ({
          id: message.dataset.messageId,
          timestamp: message.dataset.timestamp,
          author: message.querySelector('[data-author]')?.textContent?.trim(),
          text: message.querySelector('[data-message-text]')?.textContent?.trim()
        })),
        networkBlocks: blockedCount
      }), networkBlocks.length);
    } finally {
      await page.close();
    }
  };
  return Object.freeze({ survey });
}

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

const fixtureUrl = pathToFileURL(fixturePath).href;
const browserExecutable = process.env.DISCORD_PROOF_BROWSER || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = await chromium.launch({
  headless: true,
  executablePath: browserExecutable,
  args: ['--no-proxy-server']
});
const networkBlocks = [];
const context = await browser.newContext();
await context.addInitScript(safetyBootstrap, { selector: mutationSelector });
await context.route('**/mock-api/**', async (route) => {
  const request = route.request();
  const method = request.method().toUpperCase();
  if (mutationMethods.has(method) && request.url().includes('/mock-api/')) {
    networkBlocks.push({ method, url: request.url() });
    await route.abort('blockedbyclient');
    return;
  }
  await route.continue();
});

try {
  const reader = createReadOnlySurvey(context, networkBlocks);
  const apiKeys = Object.keys(reader);
  record('capability surface is read-only', apiKeys.length === 1 && apiKeys[0] === 'survey', apiKeys.join(', '));

  const extraction = await reader.survey(fixtureUrl);
  record('visible messages and route metadata extracted',
    extraction.server === 'Fixture Games' && extraction.channelId === 'fixture-channel-1001' && extraction.messages.length === 2,
    JSON.stringify(extraction));

  const adversary = await context.newPage();
  await adversary.goto(fixtureUrl, { waitUntil: 'domcontentloaded' });
  await adversary.evaluate(async () => {
    const composer = document.querySelector('[data-message-composer]');
    composer?.focus();
    composer?.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, cancelable: true, data: 'unsafe' }));
    composer?.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true }));
    composer?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    document.querySelectorAll('[data-mutation-control]').forEach((control) => control.click());
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      await fetch('https://discord-safety.invalid/mock-api/messages', { method, body: '{}' }).catch(() => {});
    }
  });
  const adversaryState = await adversary.evaluate(() => ({
    log: window.__fixtureMutationLog,
    composers: [...document.querySelectorAll('[data-message-composer]')].map((element) => element.value || element.textContent || ''),
    activeTag: document.activeElement?.tagName
  }));
  record('typing paste enter and mutating controls disabled',
    adversaryState.log.length === 0 && adversaryState.composers.every((value) => value === ''),
    JSON.stringify(adversaryState));
  record('mutation requests blocked and logged', networkBlocks.length === 4,
    JSON.stringify(networkBlocks));
  await adversary.close();

  const noGuardContext = await browser.newContext();
  const noGuardPage = await noGuardContext.newPage();
  await noGuardPage.goto(fixtureUrl, { waitUntil: 'domcontentloaded' });
  await expectFailure('missing guard fails closed', () => assertSafe(noGuardPage), 'missing guard heartbeat');
  await expectFailure('editable focus fails closed', async () => assertSafeState({
    signature: 'discord-safety-v1',
    accessState: 'ready',
    heartbeat: { active: true, version: 'fixture-v1' },
    activeEditable: true,
    enabledMutatorCount: 0
  }), 'editable element has focus');
  await noGuardContext.close();

  await expectFailure('unexpected page state fails closed', () => reader.survey(`${fixtureUrl}?state=unexpected`), 'unexpected page state');
  await expectFailure('blocked or gated state fails closed', () => reader.survey(`${fixtureUrl}?state=gated`), 'blocked/gated state');

  const failed = results.filter((result) => !result.pass);
  console.log(JSON.stringify({ passed: results.length - failed.length, failed: failed.length, results }, null, 2));
  if (failed.length) process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
}
