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
