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
    } else if (scenario === 'hours-responsive') {
      await page.goto(target, {waitUntil:'domcontentloaded'});
      await page.waitForFunction(() => typeof DATA !== 'undefined' && DATA.stores.length > 0);
      await page.evaluate(() => { state.selectedPlaceId = 'collectors-lounge-cypress'; navigate('places'); });
      for (const width of [1400, 1200, 1050, 900, 390]) {
        await page.setViewportSize({width, height:900});
        const layout = await page.locator('#placeDetail .hours-popover summary').evaluate(node => {
          const label = node.querySelector('span:nth-child(2)');
          const range = document.createRange(); range.selectNodeContents(label);
          return {lines: range.getClientRects().length, width:document.documentElement.clientWidth, content:document.documentElement.scrollWidth};
        });
        if (layout.lines !== 1 || layout.content > layout.width + 1) throw new Error(`Hours wrap/overflow at ${width}: ${JSON.stringify(layout)}`);
        await page.locator('#placeDetail .hours-popover summary').click();
        await page.locator('#placeDetail .hours-week').waitFor({state:'visible'});
        await page.locator('#placeDetail .hours-popover summary').click();
        await page.screenshot({path:`work/hours-responsive-${width}.png`, animations:'disabled'});
        pass(`Hours readable and expandable at ${width}px`);
      }
    } else if (scenario === 'focused-today') {
      await page.clock.setFixedTime(new Date('2026-09-06T17:30:00'));
      await page.goto(target, {waitUntil: 'domcontentloaded'});
      await page.waitForFunction(() => typeof DATA !== 'undefined' && DATA.events.length > 0);
      await page.evaluate(() => { state.personal.favorites[`place:${DATA.stores[0].id}`] = true; });
      await page.locator('.nav-item[data-route="today"]').click();
      await page.locator('.today-quick-event').first().waitFor();
      const todayText = await page.locator('#route-today').innerText();
      if (/861 opportunities|945 opportunities|Everything still visible|Show four more weeks/.test(todayText)) throw new Error('Future catalog leaked into Today');
      const dates = await page.locator('#calendarContent [data-date]').evaluateAll(nodes => [...new Set(nodes.map(n => n.dataset.date))]);
      if (dates.some(date => date !== '2026-09-06')) throw new Error(`Non-today dates: ${dates}`);
      const earlier = page.locator('.today-earlier');
      if (await earlier.count() && await earlier.getAttribute('open') !== null) throw new Error('Earlier starts expanded by default');
      const topTitles = await page.locator('.today-focus-section').first().innerText();
      if (await page.locator('.today-quick-event').filter({hasText:'Lucky 7'}).count() !== 1) throw new Error('Same-time Lucky Seven listings not grouped');
      if (topTitles.includes('Precon Level Commander Tournament')) throw new Error('Morning tournament recommended at 5:30 PM');
      await page.screenshot({path:'work/focused-today-desktop.png', animations:'disabled'});
      await page.locator('.today-quick-event [data-place-mode="drawer"]').first().click();
      if (!await page.locator('#detailDrawer .hours-popover').count()) throw new Error('Store drawer missing hours');
      pass('same-day only; past tournament excluded; store drawer has hours', dates.join(', '));
      await page.keyboard.press('Escape');
      await page.setViewportSize({width:390,height:844});
      await page.screenshot({path:'work/focused-today-mobile.png', animations:'disabled'});
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      if (overflow) throw new Error('Mobile horizontal overflow');
      await page.locator('.mobile-nav [data-route="signals"]').click();
      await page.locator('.favorite-quick-section').waitFor();
      await page.screenshot({path:'work/focused-briefing-mobile.png', animations:'disabled'});
      await page.locator('.favorite-quick-section').scrollIntoViewIfNeeded();
      await page.screenshot({path:'work/focused-favorites-mobile.png', animations:'disabled'});
      await page.locator('.mobile-nav [data-route="places"]').click();
      await page.locator('#openPlacePicker').click();
      if (!await page.locator('#placeListMobile [data-place-id]').count()) throw new Error('Mobile picker empty after resize');
      await page.locator('#closePlacePicker').click();
      await page.locator('.mobile-nav [data-route="events"]').click();
      await page.locator('#eventCatalog [data-event-id]').first().waitFor();
      pass('mobile width and favorite-store shortcuts');
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
      await page.locator('.briefing-attention-card [data-action="mark-signal-read"]').first().waitFor({ state: 'visible', timeout: 15000 });
      const beforeCount = await page.locator('.briefing-attention-card').count();
      const firstCard = page.locator('.briefing-attention-card').filter({ has: page.locator('[data-action="mark-signal-read"]') }).first();
      const signalId = await firstCard.getByRole('button', { name: 'Dismiss' }).getAttribute('data-signal-id');
      await firstCard.getByRole('button', { name: 'Dismiss' }).click({ timeout: 5000 });
      await page.waitForFunction((id) => !document.querySelector(`.briefing-attention-card [data-action="mark-signal-read"][data-signal-id="${CSS.escape(id)}"]`), signalId, { timeout: 5000 });
      const afterCount = await page.locator('.briefing-attention-card').count();
      pass('Briefing Dismiss removes the handled attention item', `${signalId} removed; visible attention ${beforeCount} -> ${afterCount}`);
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
        rawSignalCards: document.querySelectorAll('.signal-card').length,
        briefingTitle: document.querySelector('#route-signals h1')?.textContent?.trim(),
        heroPresent: !!document.querySelector('.briefing-hero'),
        weekPresent: !!document.querySelector('.briefing-week'),
        digestPresent: !!document.querySelector('.briefing-digest'),
        agentsPresent: !!document.querySelector('.briefing-agent-strip')
      }));
      if (currentAttention.introPresent) throw new Error('Analyst/debug Signals explanation is still visible');
      if (currentAttention.emptyDiscoveryPresent) throw new Error('Empty discovery restore panel is still visible');
      if (currentAttention.discoveryResearchPresent) throw new Error('Discovery research leads are still occupying the Signals home');
      if (currentAttention.stalePersonalPresent) throw new Error('Past-event personal follow-up is still visible');
      if (currentAttention.staleSignalPresent) throw new Error('Past-event Signal is still visible');
      if (currentAttention.pastArrivalPreviewDates.length) throw new Error(`Past occurrence is still previewed in current arrivals: ${currentAttention.pastArrivalPreviewDates.join(', ')}`);
      if (currentAttention.rawSignalCards) throw new Error(`Briefing leaked ${currentAttention.rawSignalCards} raw Signal cards`);
      if (currentAttention.briefingTitle !== 'Briefing' || !currentAttention.heroPresent || !currentAttention.weekPresent || !currentAttention.digestPresent || !currentAttention.agentsPresent) throw new Error(`Briefing structure incomplete: ${JSON.stringify(currentAttention)}`);
      pass('Briefing synthesizes current attention without raw log cards', 'recommendation, week, digest, attention, and surveyor status rendered');
    } else if (scenario === 'hours-review-proposal') {
      await page.route('**/rest/v1/signals?*', (route) => route.fulfill({
        contentType: 'application/json', body: JSON.stringify([{
          id: 'test:hours-review-ui', category: 'operational', priority: 'high', status: 'needs_followup',
          captured_at: new Date().toISOString(), related_entity_type: 'venue', related_entity_id: 'collectors-lounge-cypress',
          summary: 'Collectors Lounge - Cypress posted changed store hours.', promotion_target: 'venue_hours',
          evidence_url: 'https://www.instagram.com/collectors.lounge/p/Dcoh9lcvaXH/',
          details: 'Sources disagree about the Monday closure.',
          proposed_change: {type: 'venue_hours', effective_date: '2026-08-29', weekly_hours: {'6': [{open:'12:00',close:'22:00'}], '0': [{open:'12:00',close:'22:00'}], '1': [{closed:true}]}}
        }])
      }));
      await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.evaluate(() => localStorage.removeItem('mana-radar-personal'));
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
      const card = page.locator('.briefing-attention-card').filter({ hasText: 'Collectors Lounge - Cypress posted changed store hours.' }).first();
      await card.waitFor({ state: 'visible', timeout: 15000 });
      const proposal = await card.locator('.hours-change-proposal').innerText();
      assertText(proposal, 'Saturday', 'structured hours proposal');
      assertText(proposal, '12 PM-10 PM', '12-hour display');
      assertText(proposal, 'Monday: Closed', 'closed day without a rendering failure');
      assertText(proposal, 'Sources disagree about the Monday closure.', 'visible reason for review');
      assertText(proposal, 'View hours source', 'structured hours source link');
      const original = card.getByRole('link', {name: 'View hours source'});
      if (await original.getAttribute('href') !== 'https://www.instagram.com/collectors.lounge/p/Dcoh9lcvaXH/') throw new Error('Hours source link missing or incorrect');
      await card.getByRole('button', { name: 'Yes, update hours' }).waitFor({ state: 'visible' });
      await card.getByRole('button', { name: 'No, not correct' }).waitFor({ state: 'visible' });
      if (await card.getByRole('button', { name: 'Dismiss' }).count()) throw new Error('Structured hours proposal still uses generic Dismiss');
      pass('Ambiguous operational finding renders as a concrete yes/no hours decision', proposal.replace(/\s+/g, ' '));
    } else if (scenario === 'hours-conflict-review') {
      await page.route('**/rest/v1/signals?*', (route) => route.fulfill({
        contentType: 'application/json', body: JSON.stringify([{
          id: 'test:hours-conflict-ui', category: 'operational', priority: 'normal', status: 'needs_followup',
          captured_at: new Date().toISOString(), related_entity_type: 'venue', related_entity_id: 'next-gen-games',
          summary: "Confirm Next-Gen Games' Saturday closing time.", promotion_target: 'venue_hours',
          proposed_change: {
            type: 'venue_hours', weekly_hours: {'6': [{open:'11:00', close:'21:00'}]},
            review_reason: 'Both are current official pages. The dedicated events FAQ is recommended because it is more specific.',
            review_options: [
              {id: 'events_faq_9pm', label: 'Use 9 PM', summary: 'Saturday 11 AM-9 PM', source_label: 'Dedicated events FAQ', source_url: 'https://www.nextgengames.la/service/events-at-next-gen/', recommended: true},
              {id: 'contact_faq_6pm', label: 'Use 6 PM', summary: 'Saturday 11 AM-6 PM', source_label: 'Contact-page FAQ', source_url: 'https://www.nextgengames.la/service/', recommended: false}
            ]
          }
        }])
      }));
      await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.evaluate(() => localStorage.removeItem('mana-radar-personal'));
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
      const card = page.locator('.briefing-attention-card').filter({ hasText: "Confirm Next-Gen Games' Saturday closing time." }).first();
      await card.waitFor({ state: 'visible', timeout: 15000 });
      const proposal = await card.locator('.hours-change-proposal').innerText();
      assertText(proposal, 'Dedicated events FAQ', 'recommended source label');
      assertText(proposal, 'Saturday 11 AM-9 PM', 'recommended Saturday hours');
      assertText(proposal, 'Contact-page FAQ', 'alternate source label');
      assertText(proposal, 'Saturday 11 AM-6 PM', 'alternate Saturday hours');
      if (!/recommended/i.test(proposal)) throw new Error(`Missing recommendation marker; rendered: ${proposal.replace(/\s+/g, ' ')}`);
      if (await card.getByRole('link', {name: 'Open source'}).count() !== 2) throw new Error('Both official hours sources are not linked');
      await card.getByRole('button', { name: 'Use 9 PM' }).waitFor({ state: 'visible' });
      await card.getByRole('button', { name: 'Use 6 PM' }).waitFor({ state: 'visible' });
      if (await card.getByRole('button', { name: 'Yes, update hours' }).count()) throw new Error('Conflict still uses a vague yes/no decision');
      pass('Hours conflict names both sources and both concrete choices', proposal.replace(/\s+/g, ' '));
    } else if (scenario === 'route-click-perf') {
      await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.evaluate(() => localStorage.removeItem('mana-radar-personal'));
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
      await page.locator('.briefing-hero').waitFor({ state: 'visible', timeout: 20000 });
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
          ['.briefing-attention-card button[data-action=mark-signal-read]', 'mark read'],
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
    } else if (scenario === 'event-dislike-suppression') {
      await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.evaluate(() => localStorage.removeItem('mana-radar-personal'));
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
      await page.locator('.nav-item[data-route="today"]').click({ timeout: 10000 });
      const dislike = page.locator('[data-action="toggle-event-dislike"]:visible').first();
      await dislike.waitFor({ state: 'visible', timeout: 20000 });
      const eventId = await dislike.getAttribute('data-event-id');
      const eventTitle = await dislike.locator('xpath=ancestor::*[@data-event-id][1]').locator('h3').innerText();
      await dislike.click({ timeout: 5000 });
      if (await page.locator(`#route-today [data-event-id="${eventId}"]:visible`).count()) throw new Error(`Disliked event remained visible in the ordinary Today catalog: ${eventTitle}`);
      await page.locator('.nav-item[data-route="signals"]').click({ timeout: 5000 });
      await page.waitForTimeout(100);
      const briefingLeak = page.locator(`#route-signals [data-event-id="${eventId}"]:visible`).first();
      if (await briefingLeak.count()) throw new Error(`Disliked event leaked into Briefing: ${eventTitle}. ${await briefingLeak.evaluate((node) => node.outerHTML.slice(0, 1000))}`);
      await page.locator('.nav-item[data-route="today"]').click({ timeout: 5000 });
      await page.locator('#openFilters').click({ timeout: 5000 });
      await page.locator('input[name="planningGroup"][value="hidden"]').check();
      await page.locator('#applyFilters').click({ timeout: 5000 });
      const restore = page.locator('#route-today [data-event-id]').filter({ hasText: eventTitle }).locator('[data-action="toggle-event-dislike"]').first();
      await restore.waitFor({ state: 'visible', timeout: 5000 });
      await restore.click({ timeout: 5000 });
      const storedDislikes = await page.evaluate(() => {
        const personal = JSON.parse(localStorage.getItem('mana-radar-personal') || '{}');
        return Object.values(personal.ratings || {}).filter((rating) => Number(rating) === 1).length;
      });
      if (storedDislikes) throw new Error(`Removing the event dislike did not restore its preference: ${eventTitle}`);
      pass('Event dislike suppresses ordinary planning surfaces and stays recoverable', `${eventTitle} left Today and Briefing, then restored through the Hidden / poor fit filter`);
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
