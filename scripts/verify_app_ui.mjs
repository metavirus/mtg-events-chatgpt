import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const require = createRequire(import.meta.url);

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = next;
      i += 1;
    }
  }
  return out;
}

function bundledNodeModulesCandidates() {
  const userProfile = process.env.USERPROFILE || process.env.HOME || '';
  return [
    process.env.CODEX_NODE_MODULES,
    process.env.SOCIAL_PLAYWRIGHT_NODE_MODULES,
    path.join(userProfile, '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node', 'node_modules'),
  ].filter(Boolean);
}

function resolvePlaywright() {
  const errors = [];
  for (const nodeModules of bundledNodeModulesCandidates()) {
    try {
      const candidate = path.join(nodeModules, 'playwright');
      if (fs.existsSync(candidate)) {
        return { playwright: require(candidate), source: candidate };
      }
    } catch (error) {
      errors.push(`${nodeModules}: ${error.message}`);
    }
  }
  try {
    return { playwright: require('playwright'), source: 'node resolution' };
  } catch (error) {
    errors.push(`node resolution: ${error.message}`);
  }
  throw new Error(`Playwright is not available. Checked: ${bundledNodeModulesCandidates().join('; ')}. Errors: ${errors.join(' | ')}`);
}

function assertText(text, needle, label) {
  if (!text.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const args = parseArgs(process.argv.slice(2));
const scenario = args.scenario || 'browser-smoke';
const target = args.url || process.env.APP_URL || `https://metavirus.github.io/mtg-events-chatgpt/?verify=${Date.now()}#signals`;
const { playwright, source } = resolvePlaywright();
const { chromium } = playwright;
const started = Date.now();
const result = {
  status: 'unknown',
  scenario,
  target: scenario === 'browser-smoke' ? '(local synthetic page)' : target,
  playwrightSource: source,
  checks: [],
};

function pass(name, detail = '') {
  result.checks.push({ name, status: 'pass', detail });
}

async function launchBrowser() {
  const common = {
    headless: !args.headed,
  };
  try {
    const browser = await chromium.launch(common);
    result.browser = 'playwright-chromium';
    return browser;
  } catch (error) {
    const chromeCandidates = [
      process.env.UI_VERIFY_BROWSER,
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ].filter(Boolean);
    for (const executablePath of chromeCandidates) {
      if (!fs.existsSync(executablePath)) continue;
      try {
        const browser = await chromium.launch({ ...common, executablePath });
        result.browser = executablePath;
        result.browserFallbackReason = error.message;
        return browser;
      } catch {
        // Try the next installed browser path.
      }
    }
    throw error;
  }
}

async function main() {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
    page.on('console', (message) => {
      if (['error', 'warning'].includes(message.type())) {
        result.checks.push({ name: `browser console ${message.type()}`, status: 'note', detail: message.text().slice(0, 500) });
      }
    });
    page.on('pageerror', (error) => {
      result.checks.push({ name: 'browser page error', status: 'note', detail: error.message.slice(0, 500) });
    });
    if (scenario === 'browser-smoke') {
      await page.setContent('<main><h1>MTG Events UI readiness</h1><button>Open event</button></main>');
      const heading = await page.locator('h1').innerText({ timeout: 5000 });
      assertText(heading, 'MTG Events UI readiness', 'synthetic heading');
      pass('browser launched and DOM readback works', heading);
    } else if (scenario === 'public-signals-smoke') {
      await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
      const body = await page.locator('body').innerText({ timeout: 15000 });
      assertText(body, 'Signals', 'Signals page title');
      pass('public app loaded and visible text was inspected', body.slice(0, 160));
    } else if (scenario === 'signals-mark-read') {
      await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.evaluate(() => localStorage.removeItem('mana-radar-personal'));
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
      await page.locator('.signal-card').first().waitFor({ state: 'visible', timeout: 15000 });
      const beforeCount = await page.locator('.signal-card').count();
      const firstCard = page.locator('.signal-card').first();
      const signalId = await firstCard.getByRole('button', { name: 'Mark read' }).getAttribute('data-signal-id');
      await firstCard.getByRole('button', { name: 'Mark read' }).click({ timeout: 5000 });
      await page.waitForFunction((id) => !document.querySelector(`.signal-card [data-action="mark-signal-read"][data-signal-id="${CSS.escape(id)}"]`), signalId, { timeout: 5000 });
      const afterCount = await page.locator('.signal-card').count();
      if (afterCount >= beforeCount) throw new Error(`Mark read did not remove a visible Signal card: ${beforeCount} -> ${afterCount}`);
      pass('Signal Mark read removes the card from the active homepage list', `${beforeCount} -> ${afterCount}`);
    } else if (scenario === 'signals-current-attention') {
      await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
      await page.locator('#signalsContent').waitFor({ state: 'visible', timeout: 15000 });
      const currentAttention = await page.evaluate(() => ({
        introPresent: document.body.textContent.includes('Signals are not canonical facts by themselves.'),
        emptyDiscoveryPresent: document.body.textContent.includes('Discovery leads are tucked away'),
        discoveryResearchPresent: document.body.textContent.includes('fuzzy community lead'),
        stalePersonalPresent: [...document.querySelectorAll('.personal-todo-card')].some((card) => /Magic The GAYthering/i.test(card.textContent)),
        staleSignalPresent: [...document.querySelectorAll('.signal-card')].some((card) => /Magic The GAYthering/i.test(card.querySelector('h3')?.textContent || '')),
        pastArrivalPreviewDates: [...document.querySelectorAll('.signal-arrival-preview [data-date]')].map((item) => item.getAttribute('data-date')).filter((date) => date < new Date().toISOString().slice(0, 10)),
        arrivalCards: document.querySelectorAll('.arrival-signal-card').length,
        updatesLinkPresent: !!document.querySelector('.signals-overflow-note [data-route="changes"]')
      }));
      if (currentAttention.introPresent) throw new Error('Analyst/debug Signals explanation is still visible');
      if (currentAttention.emptyDiscoveryPresent) throw new Error('Empty discovery restore panel is still visible');
      if (currentAttention.discoveryResearchPresent) throw new Error('Discovery research leads are still occupying the Signals home');
      if (currentAttention.stalePersonalPresent) throw new Error('Past-event personal follow-up is still visible');
      if (currentAttention.staleSignalPresent) throw new Error('Past-event Signal is still visible');
      if (currentAttention.pastArrivalPreviewDates.length) throw new Error(`Past occurrence is still previewed in current arrivals: ${currentAttention.pastArrivalPreviewDates.join(', ')}`);
      if (currentAttention.arrivalCards > 8) throw new Error(`Signals shows ${currentAttention.arrivalCards} arrival cards; expected at most 8`);
      pass('Signals stays focused on current attention', `${currentAttention.arrivalCards} current arrival cards; stale/debug chrome absent; updates overflow=${currentAttention.updatesLinkPresent}`);
    } else if (scenario === 'route-click-perf') {
      await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.evaluate(() => localStorage.removeItem('mana-radar-personal'));
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
      await page.locator('.signal-card').first().waitFor({ state: 'visible', timeout: 20000 });
      const measurements = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const countDom = () => ({
          nodes: document.querySelectorAll('*').length,
          signals: document.querySelectorAll('.signal-card').length,
          events: document.querySelectorAll('.event-card,.compact-event,.occurrence-row,.series-row').length,
          places: document.querySelectorAll('.entity-list-item').length,
          changes: document.querySelectorAll('.change-row').length,
          images: document.images.length
        });
        async function dispatch(selector, label) {
          const element = [...document.querySelectorAll(selector)].find((item) => item.offsetParent !== null) || document.querySelector(selector);
          if (!element) return { label, missing: true };
          const before = performance.now();
          element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          const dispatchMs = performance.now() - before;
          await new Promise(requestAnimationFrame);
          await sleep(50);
          return { label, dispatchMs: Number(dispatchMs.toFixed(1)), hash: location.hash, ...countDom() };
        }
        const rows = [{ label: 'initial', hash: location.hash, ...countDom() }];
        for (const [selector, label] of [
          ['.nav-item[data-route=events]', 'events nav'],
          ['.nav-item[data-route=places]', 'places nav'],
          ['.nav-item[data-route=changes]', 'updates nav'],
          ['.nav-item[data-route=communities]', 'communities nav'],
          ['.nav-item[data-route=signals]', 'signals nav'],
          ['.signal-card button[data-action=mark-signal-read]', 'mark read'],
          ['.nav-item[data-route=places]', 'places nav again'],
          ['.entity-list-item', 'place row']
        ]) {
          rows.push(await dispatch(selector, label));
        }
        return rows;
      });
      const missing = measurements.filter((row) => row.missing);
      if (missing.length) throw new Error(`Missing perf target(s): ${missing.map((row) => row.label).join(', ')}`);
      const slow = measurements.filter((row) => row.dispatchMs > 350);
      if (slow.length) throw new Error(`Slow route/click dispatch: ${slow.map((row) => `${row.label} ${row.dispatchMs}ms`).join(', ')}`);
      const excessDom = measurements.filter((row) => row.nodes > 2600);
      if (excessDom.length) throw new Error(`Route DOM did not stay bounded: ${excessDom.map((row) => `${row.label} ${row.nodes} nodes`).join(', ')}`);
      pass('Route and click dispatch stayed responsive', measurements.map((row) => `${row.label}:${row.dispatchMs ?? 0}ms/${row.nodes} nodes`).join(' | '));
    } else if (scenario === 'updates-daily-agents') {
      await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
      await page.locator('.nav-item[data-route="changes"]').click({ timeout: 5000 });
      await page.waitForTimeout(250);
      const body = await page.locator('body').innerText({ timeout: 15000 });
      result.bodyExcerpt = body.slice(0, 1000);
      assertText(body, 'Updates', 'Updates page title');
      assertText(body, 'DAILY AGENTS', 'daily agent panel');
      assertText(body, 'WPN / EventLink', 'WPN daily agent card');
      assertText(body, 'Instagram', 'Instagram daily agent card');
      assertText(body, 'Facebook', 'Facebook daily agent card');
      assertText(body, 'Discord', 'Discord daily agent card');
      pass('Updates daily-agent panel rendered', body.slice(0, 240));
    } else if (scenario === 'updates-click-perf') {
      await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
      await page.locator('.nav-item[data-route="changes"]').waitFor({ state: 'visible', timeout: 15000 });
      await page.locator('.nav-item[data-route="changes"]').click({ timeout: 10000 });
      await page.waitForTimeout(250);
      const initialRows = await page.locator('.change-row').count();
      const initialNodes = await page.locator('*').count();
      if (initialRows > 60) throw new Error(`Updates rendered too many rows initially: ${initialRows}`);
      if (initialNodes > 1800) throw new Error(`Updates rendered too many DOM nodes initially: ${initialNodes}`);
      const endless = page.getByRole('button', { name: /Endless Entertainment →/ }).first();
      for (let attempt = 0; attempt < 3 && !(await endless.isVisible().catch(() => false)); attempt += 1) {
        const showMore = page.getByRole('button', { name: /Show \d+ more updates/ }).first();
        if (!(await showMore.isVisible().catch(() => false))) break;
        await showMore.click({ timeout: 5000 });
        await page.waitForTimeout(150);
      }
      if (!(await endless.isVisible().catch(() => false))) throw new Error('Endless update row did not appear after bounded expansion');
      const expandedRows = await page.locator('.change-row').count();
      const expandedNodes = await page.locator('*').count();
      if (expandedRows > 160) throw new Error(`Updates expansion rendered too many rows: ${expandedRows}`);
      if (expandedNodes > 3400) throw new Error(`Updates expansion rendered too many DOM nodes: ${expandedNodes}`);
      const start = Date.now();
      await endless.click({ timeout: 5000, force: true });
      const clickMs = Date.now() - start;
      await page.waitForTimeout(250);
      const selectedTitle = await page.locator('#drawerTitle').innerText({ timeout: 5000 });
      assertText(selectedTitle, 'Endless Entertainment', 'selected Endless place');
      if (clickMs > 1800) throw new Error(`Updates Endless click was too slow: ${clickMs}ms`);
      pass('Updates renders a bounded row window', `${initialRows} rows, ${initialNodes} nodes`);
      pass('Updates expands boundedly to older rows', `${expandedRows} rows, ${expandedNodes} nodes`);
      pass('Endless update click opens place promptly', `${clickMs}ms`);
    } else if (scenario === 'lags-signal-event-link') {
      await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
      const body = await page.locator('body').innerText({ timeout: 15000 });
      assertText(body, 'LAGS', 'LAGS signal/event text');
      assertText(body, 'Open event', 'event navigation action');
      pass('LAGS signal exposes an event navigation action');
    } else {
      throw new Error(`Unknown scenario: ${scenario}`);
    }
    result.status = 'pass';
  } catch (error) {
    result.status = 'fail';
    result.error = error.message;
    throw error;
  } finally {
    await browser.close();
    result.elapsedSeconds = Number(((Date.now() - started) / 1000).toFixed(2));
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch(() => {
  process.exitCode = 1;
});
