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
    page.on('requestfailed', request => {
      const url = new URL(request.url());
      result.checks.push({name:'request failed',status:'note',detail:`${url.origin}${url.pathname}: ${request.failure()?.errorText}`});
    });
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
    } else if (scenario === 'today-decision-cards') {
      await page.clock.setFixedTime(new Date('2026-10-14T14:00:00-07:00'));
      const base = new URL(target); base.hash = '';
      await page.goto(base.href, {waitUntil:'domcontentloaded'});
      await page.waitForFunction(() => typeof DATA !== 'undefined' && DATA.events.length > 0);
      await page.evaluate(() => {
        state.personal.favorites = {'place:finch-sparrow':true,'place:spellhold-games':true,'place:collectors-lounge-cypress':true};
        renderCurrentRoute();
      });
      if (!await page.locator('#route-today').isVisible()) throw new Error('Today is not default home');
      const rows = page.locator('.today-quick-event:visible');
      await rows.first().waitFor();
      if (!await rows.first().locator('.today-card-place .entity-avatar').count()) throw new Error('Store avatar missing');
      for (const row of await rows.all()) {
        if (!await row.locator('.today-card-hours strong').innerText()) throw new Error('Hours missing');
        if (!await row.locator('a[href*="maps/dir"]').count()) throw new Error('Directions missing');
      }
      const remainderTimes = await page.locator('.today-focus-section').filter({hasText:'Other starts today'}).locator('.today-quick-time').allTextContents();
      const asMinutes = label => {const m = label.match(/(\d+)(?::(\d+))?\s*(AM|PM)/);return m ? (Number(m[1])%12+(m[3]==='PM'?12:0))*60+Number(m[2]||0) : 0;};
      if (remainderTimes.some((t,i) => i>0 && asMinutes(t)<asMinutes(remainderTimes[i-1]))) throw new Error('Other starts not chronological');
      for (const width of [1400,1050,390]) {
        await page.setViewportSize({width,height:900});
        await page.waitForFunction(() => [...document.querySelectorAll('.today-card-place img')].filter(img => {const rect=img.getBoundingClientRect();return rect.height>0 && rect.top<innerHeight && rect.bottom>0;}).every(img => img.complete && img.naturalWidth>0), null, {timeout:8000});
        if (await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)) throw new Error(`Overflow ${width}`);
        await page.screenshot({path:`work/today-decision-${width}.png`,animations:'disabled'});
        pass(`Today cards show logos, hours, and directions at ${width}px`);
      }
      await page.locator('.today-card-place[data-place-mode="drawer"]').first().click();
      await page.locator('#drawerTitle').waitFor();
      await page.keyboard.press('Escape');
      await page.locator('.today-card-title').first().click();
      await page.locator('#drawerTitle').waitFor();
      await page.keyboard.press('Escape');
      const ranking = await page.evaluate(() => {
        const day = startOfDay(new Date());
        const base = {occurrenceDate:day,date:dateKey(day),startTime:'19:00',bracket:'2',confidence:'high'};
        const modern = {...base,id:'test-modern',storeId:'spellhold-games',title:'Modern tournament',format:'Modern'};
        const commander = {...base,id:'test-commander',storeId:'joyful-toad-tcg',title:'Casual Commander',format:'Commander'};
        const initial = rankedTodayLeads([modern,commander])[0]?.id;
        state.personal.favorites['event:test-modern']=true;
        const explicit = rankedTodayLeads([modern,commander])[0]?.id;
        delete state.personal.favorites['event:test-modern'];
        state.personal.ratings['event:test-commander']=1;
        const excluded = rankedTodayLeads([commander]).length===0;
        return {initial,explicit,excluded};
      });
      if (ranking.initial !== 'test-commander' || ranking.explicit !== 'test-modern' || !ranking.excluded) throw new Error(`Ranking/preferences regression ${JSON.stringify(ranking)}`);
      pass('Commander fit beats host favorite; explicit event choice wins; disliked event excluded; card links work');
    } else if (scenario === 'compact-briefing') {
      page.setDefaultTimeout(15000);
      page.setDefaultNavigationTimeout(15000);
      await page.clock.setFixedTime(new Date('2026-09-19T09:00:00-07:00'));
      await page.goto(target, {waitUntil:'domcontentloaded'});
      await page.waitForFunction(() => typeof DATA !== 'undefined' && DATA.events.length > 0);
      // Representative morning with live-loaded records and the user's known
      // favorite trio, in this isolated browser only. No account state is saved.
      await page.evaluate(() => {
        const ids = ['finch-sparrow', 'collectors-lounge-cypress', 'spellhold-games'];
        if (ids.some(id => !store(id))) throw new Error('Representative favorite store ID not found');
        state.personal.favorites = Object.fromEntries(ids.map(id => [`place:${id}`,true]));
        navigate('signals');
      });
      for (const width of [1400, 390]) {
        await page.setViewportSize({width,height:844});
        await page.evaluate(() => window.scrollTo({top:0,behavior:'instant'}));
        await page.screenshot({path:`work/compact-live-top-${width}.png`,animations:'disabled'});
        const lower = page.locator('#signalsContent .briefing-secondary');
        if (await lower.count()) await lower.scrollIntoViewIfNeeded();
        await page.screenshot({path:`work/compact-live-lower-${width}.png`,animations:'disabled'});
      }
      const fixture = await page.evaluate(() => {
        // This browser context is disposable. All fixtures stay in memory; no
        // preference actions or canonical writes are issued by this scenario.
        const places = DATA.stores.filter(place => !isPlaceLowFit(place)).slice(0, 7);
        if (places.length < 7) throw new Error('Need seven eligible stores for compact layout fixtures');
        state.personal.favorites = Object.fromEntries(places.slice(0, 6).map(place => [`place:${place.id}`, true]));
        state.personal.hidden = {[`place:${places[5].id}`]:true};
        state.personal.ratings = {};
        state.personal.interested = {};
        DATA.events = Array.from({length:8}, (_, index) => ({
          id:`compact-test-${index}`, seriesId:`compact-test-${index}`, title:`Casual Commander test ${index}`,
          storeId:places[index === 6 ? 5 : index % 5].id, status:'active', format:'Commander',
          date:dateKey(addDays(new Date(), index < 3 ? 0 : index - 2)), startTime:'18:00',
          confidence:'high', bracket:'2', details:'Casual Commander open play', occurrenceStatus:'confirmed',
        }));
        state.personal.ratings['event:compact-test-7'] = 1;
        const digests = places.slice(0, 5).map((place, index) => ({
          owner:{type:'venue', id:place.id, name:place.name}, latest:new Date().toISOString(),
          events:[DATA.events[index]], changeIds:[`compact-change-${index}`],
        }));
        const conversations = [0, 1].map(index => ({
          id:`conversation:compact-${index}`, relatedEntityType:'venue', relatedEntityId:places[index].id,
          summary:`Anyone joining Commander ${index}?`, details:'Looking for one more player tonight.',
          category:'community_activity', status:'new', observedAt:new Date().toISOString(),
          evidenceUrl:`https://discord.com/channels/compact-test/${index}`,
        }));
        window.compactFixture = {digests, conversations};
        briefingChangeDigests = () => window.compactFixture.digests;
        communityDigestSignals = () => window.compactFixture.conversations;
        briefingAttentionSignals = () => [];
        personalTodoItems = () => [];
        briefingAgentStatuses = () => [{id:'wpn',label:'WPN',status:'stale',route:'changes',lastRunAt:'2026-09-01T00:00:00Z'}];
        navigate('signals');
        return {hiddenPlace:places[5].id, visibleFavorites:5};
      });
      const selectorChecks = await page.evaluate(hiddenPlace => {
        const favorites = window.compactFixture.digests;
        const otherPlace = DATA.stores.find(place => !state.personal.favorites[`place:${place.id}`] && !isPlaceHidden(place.id));
        const other = {...favorites[0], owner:{type:'venue',id:otherPlace.id,name:otherPlace.name}, events:[{...DATA.events[0],id:'compact-other',seriesId:'compact-other',storeId:otherPlace.id}], latest:'2026-09-19T16:01:00Z'};
        const hidden = {...favorites[0], owner:{type:'venue',id:hiddenPlace,name:'Hidden host'},events:[DATA.events[6]]};
        const hiddenConversation = {...window.compactFixture.conversations[0],id:'conversation:hidden-host',relatedEntityId:hiddenPlace};
        const selected = briefingWorthKnowingItems([other, ...favorites, hidden], [...window.compactFixture.conversations, hiddenConversation]);
        state.personal.favorites['event:compact-other'] = true;
        const favoriteEventFirst = briefingWorthKnowingItems([other, ...favorites],window.compactFixture.conversations)[0]?.value.owner?.id === otherPlace.id;
        delete state.personal.favorites['event:compact-other'];
        const attentionDuplicate = briefingWorthKnowingItems(favorites,window.compactFixture.conversations,[window.compactFixture.conversations[0]])
          .some(item => item.kind === 'conversation' && item.value.id === window.compactFixture.conversations[0].id);
        const ordinaryFavoriteCount = (favoritePlacesQuickAccess().match(/class="favorite-quick-card"/g) || []).length;
        return {
          hiddenLeak:selected.some(item => item.value.owner?.id === hiddenPlace || item.value.relatedEntityId === hiddenPlace),
          favoritesFirst:selected.every(item => item.value.owner?.id !== otherPlace.id),
          favoriteEventFirst, attentionDuplicate,
          ordinaryFavoriteCount,
        };
      }, fixture.hiddenPlace);
      if (selectorChecks.hiddenLeak || !selectorChecks.favoritesFirst || !selectorChecks.favoriteEventFirst || selectorChecks.attentionDuplicate) throw new Error(`Merged-feed preference regression: ${JSON.stringify(selectorChecks)}`);
      if (selectorChecks.ordinaryFavoriteCount !== fixture.visibleFavorites) throw new Error('Today default favorite list was compacted');
      pass('Merged selection prioritizes favorites and excludes hidden hosts; Today retains its full favorite list');
      if ((await page.locator('#signalsSummary').innerText()).trim()) throw new Error('Redundant summary strip remains');
      if (await page.locator('#signalsContent .briefing-attention').count()) throw new Error('Empty attention section remains');
      if (await page.locator('#signalsContent .briefing-digest, #signalsContent .people-and-plans').count()) throw new Error('Duplicate standalone lower feeds remain');
      const upcoming = page.locator('#signalsContent .briefing-event-card');
      if (await upcoming.count() > 3) throw new Error('More than three coming-up cards');
      const heroId = await page.locator('#signalsContent .briefing-hero [data-event-id]').first().getAttribute('data-event-id');
      if (await upcoming.filter({has:page.locator(`[data-event-id="${heroId}"]`)}).count()
        || await page.locator(`#signalsContent .briefing-event-card[data-event-id="${heroId}"]`).count()) throw new Error('Hero repeated in coming-up');
      if (await page.locator('#signalsContent [data-event-id="compact-test-6"], #signalsContent [data-event-id="compact-test-7"]').count()) throw new Error('Hidden place or disliked event leaked into Briefing');
      const feed = page.locator('#signalsContent .briefing-worth-knowing');
      if (await feed.locator('.briefing-digest-card, .people-plan-card').count() > 3) throw new Error('Combined feed exceeds three cards');
      if (!await feed.locator('.people-plan-card').count()) throw new Error('Community conversation crowded out by changes');
      if (!await feed.locator('a[href^="https://discord.com/"]').count()
        || !await feed.locator('[data-action="mark-signal-read"]').count()) throw new Error('Community source or dismiss action lost');
      const favorites = page.locator('#signalsContent .favorite-quick-section.compact');
      if (await favorites.locator('.favorite-quick-card:visible').count() > 3) throw new Error('Too many favorite cards initially visible');
      if (await favorites.locator(`[data-place-id="${fixture.hiddenPlace}"]`).count()) throw new Error('Hidden favorite is still in quick access');
      const allFavorites = favorites.locator('summary').filter({hasText:`All ${fixture.visibleFavorites} favorites`});
      await allFavorites.click();
      if (await favorites.locator('.favorite-quick-card:visible').count() !== fixture.visibleFavorites) throw new Error('Expanded favorite list incomplete');
      for (const card of await favorites.locator('.favorite-quick-card:visible').all()) {
        if (!await card.locator('a[href]').count() || !await card.locator('.hours-popover').count()) throw new Error('Favorite missing directions or hours access');
      }
      await allFavorites.click();
      assertText(await page.locator('.briefing-agent-strip').innerText(), 'out of date', 'honest stale monitor status');
      pass('Briefing is capped, preserves community actions, excludes hidden/disliked events, expands favorites, and reports stale monitoring');
      for (const width of [1400, 390]) {
        await page.setViewportSize({width,height:844});
        if (await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)) throw new Error(`Briefing overflows at ${width}px`);
        await page.evaluate(() => window.scrollTo({top:0,behavior:'instant'}));
        await page.screenshot({path:`work/compact-briefing-${width}.png`,animations:'disabled'});
        await feed.scrollIntoViewIfNeeded();
        await page.screenshot({path:`work/compact-briefing-feed-${width}.png`,animations:'disabled'});
        const hours = favorites.locator('.hours-popover summary').first();
        await hours.click();
        await favorites.locator('.hours-popover[open]').first().waitFor({state:'visible'});
        await hours.click();
        pass(`Compact Briefing fits ${width}px; favorite hours expand`);
      }
      await page.evaluate(() => {
        briefingAttentionSignals = () => [{
          ...window.compactFixture.conversations[0], id:'compact-attention',
          category:'operational', summary:'Confirm a temporary closure', status:'needs_followup',
        }];
        renderSignals();
      });
      const attentionPlacement = await page.evaluate(() => {
        const attention = document.querySelector('#signalsContent .briefing-attention');
        const feed = document.querySelector('#signalsContent .briefing-worth-knowing');
        return !!attention && !!(attention.compareDocumentPosition(feed) & Node.DOCUMENT_POSITION_FOLLOWING);
      });
      if (!attentionPlacement) throw new Error('Real decision missing or buried below lower feed');
      pass('Real decision remains visible before the lower feed');
      await page.evaluate(() => {
        window.compactFixture.digests = [];
        window.compactFixture.conversations = [];
        DATA.events = [];
        state.personal.favorites = {};
        briefingAttentionSignals = () => [];
        renderSignals();
      });
      if (await page.locator('#signalsContent .briefing-worth-knowing, #signalsContent .briefing-week, #signalsContent .briefing-attention, #signalsContent .favorite-quick-section').count()) throw new Error('Empty sections occupy Briefing');
      assertText(await page.locator('#signalsContent').innerText(), 'No strong same-day option', 'honest empty hero');
      pass('Quiet day keeps honest hero and removes empty lower sections');
    } else if (scenario === 'preliminary-usability') {
      await page.goto(target, {waitUntil:'domcontentloaded'});
      await page.waitForFunction(() => typeof DATA !== 'undefined' && DATA.events.length > 0);
      for (const width of [1400, 390]) {
        await page.setViewportSize({width, height:844});
        for (const route of ['today', 'events', 'places', 'signals']) {
          const scroll = await page.evaluate(route => {
            window.scrollTo({top:600, behavior:'instant'});
            const before = window.scrollY;
            navigate(route);
            return {before, after:window.scrollY};
          }, route);
          if (scroll.after > 1) throw new Error(`${width}px route ${route} retained scroll: ${JSON.stringify(scroll)}`);
        }
        const backScroll = await page.evaluate(() => {
          window.scrollTo({top:600, behavior:'instant'});
          navigateBack();
          return window.scrollY;
        });
        if (backScroll > 1) throw new Error('Back navigation retained scroll');
        pass(`Page changes and Back start at top immediately at ${width}px`);
        await page.evaluate(() => openPlaceDrawer('finch-sparrow'));
        const rows = page.locator('#drawerContent .occurrence-row');
        await rows.first().waitFor();
        const dimensions = await rows.evaluateAll(nodes => nodes.map(row => ({
          row:row.clientWidth, content:row.querySelector('span').getBoundingClientRect().width,
          overflow:row.scrollWidth > row.clientWidth + 1,
        })));
        if (dimensions.some(d => d.content < d.row * .8 || d.overflow)) throw new Error(`Cramped event rows: ${JSON.stringify(dimensions)}`);
        await rows.first().scrollIntoViewIfNeeded();
        await page.screenshot({path:`work/preliminary-store-${width}.png`, animations:'disabled'});
        const title = await rows.first().locator('strong').innerText();
        await rows.first().click();
        await page.locator('#drawerTitle').filter({hasText:title}).waitFor();
        await page.keyboard.press('Escape');
        pass(`Quick-store events use full row width and open event details at ${width}px`);
      }
      await page.evaluate(() => {
        navigate('signals');
        // Local DOM fixture only: no personal or canonical writes.
        document.querySelector('#signalsContent').innerHTML = peopleAndPlansCard({
          id:'conversation:ui-test', relatedEntityType:'venue', relatedEntityId:'finch-sparrow',
          summary:'Players looking for a Commander game', capturedAt:new Date().toISOString(),
          details:"Possible event update from Finch #commander: Player — 5:24 AM Tuesday, September 15, 2026 at 5:24 AM Anyone down for Commander tonight?",
          evidenceUrl:'https://discord.com/',
        });
      });
      const card = page.locator('.people-plan-card');
      assertText(await card.locator('p').innerText(), 'Anyone down for Commander tonight?', 'actual message body');
      if (await card.locator('a').getAttribute('href') !== 'https://discord.com/') throw new Error('Conversation link lost');
      await page.screenshot({path:'work/preliminary-community-mobile.png', animations:'disabled'});
      pass('Community card shows actual message and retains source link');
    } else if (scenario === 'research-sources') {
      await page.goto(target, {waitUntil:'domcontentloaded'});
      await page.waitForFunction(() => typeof DATA !== 'undefined' && DATA.sources.length > 0);
      await page.evaluate(() => navigate('research'));
      const copy = await page.locator('#researchDashboard').innerText();
      assertText(copy, 'Coverage beyond Commander', 'current coverage copy');
      if (copy.includes('have not received comparable normalization')) throw new Error('Stale claim remains');
      const bars = page.locator('.source-mix-button');
      const types = await bars.evaluateAll(nodes => nodes.map(n => n.dataset.sourceType));
      for (const type of types) {
        await page.evaluate(t => document.querySelectorAll('.source-mix-button').forEach(b => {if(b.dataset.sourceType === t) b.click();}), type);
        const expected = await page.evaluate(t => DATA.sources.filter(s => (s.type || 'other') === t).length, type);
        const shown = await page.locator('#drawerContent .source-row').count();
        if (shown !== expected) throw new Error(`${type}: expected ${expected}, shown ${shown}`);
        await page.keyboard.press('Escape');
      }
      await page.setViewportSize({width:390,height:844});
      await bars.first().click();
      await page.screenshot({path:'work/research-sources-mobile.png',animations:'disabled'});
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Mobile overflow');
      pass('Every source bar opens its complete matching list; current copy; mobile fits', `${types.length} source categories`);
    } else if (scenario === 'guidance-rpg-correction') {
      await page.goto(target, {waitUntil:'domcontentloaded'});
      await page.waitForFunction(() => typeof DATA !== 'undefined' && DATA.events.length > 0);
      const checked = await page.evaluate(() => {
        const jjs = store('jjs-collectibles');
        const events = buildOccurrences(startOfDay(new Date(2026,8,1)), endOfDay(new Date(2026,8,30)), false);
        return {jjs: JSON.stringify(jjs), rpgVisible: events.some(e => /Domains of the Alrisen/i.test(e.title))};
      });
      if (checked.rpgVisible) throw new Error('Retired RPG session remains in calendar');
      if (checked.jjs.includes('Do official follow-up posts add times')) throw new Error('Expired question remains');
      assertText(checked.jjs, 'historical activity evidence', 'JJ historical framing');
      pass('Live guidance corrected; RPG excluded from September calendar without deleting evidence');
    } else if (scenario === 'event-time-labels') {
      await page.goto(target, {waitUntil:'domcontentloaded'});
      await page.waitForFunction(() => typeof DATA !== 'undefined' && DATA.events.length > 0);
      await page.evaluate(() => {
        // Isolated in-memory fixture: no canonical or personal writes.
        const event = DATA.events[0];
        event.details = 'Start time estimated; confirm with the store.';
        event.startTime = '12:00';
        if (event.recurrence) event.recurrence.startTime = '12:00';
        openEvent(event.id, dateKey(new Date()));
      });
      assertText(await page.locator('.event-hero-meta').innerText(), 'Time to confirm', 'estimated-time disclosure');
      await page.setViewportSize({width:390,height:844});
      await page.screenshot({path:'work/event-time-labels-mobile.png',animations:'disabled'});
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Mobile horizontal overflow');
      pass('Event drawer discloses estimated time; mobile fits; no data writes');
    } else if (scenario === 'favorite-search') {
      await page.goto(target, {waitUntil:'domcontentloaded'});
      await page.waitForFunction(() => typeof DATA !== 'undefined' && DATA.events.length > 0);
      const favoriteEvent = await page.evaluate(() => {
        state.personal.favorites = {'place:finch-sparrow':true};
        const event = buildOccurrences(startOfDay(new Date()), endOfDay(addDays(new Date(),14)), false).find(e => e.storeId !== 'finch-sparrow' && !isEventHidden(e) && !isCompetitive(e) && eventPlanningGroup(e) !== 'hidden' && dateKey(e.occurrenceDate) !== dateKey(new Date()));
        state.personal.favorites[eventPreferenceKey(event)] = true;
        return event.seriesId || event.id;
      });
      const input = page.locator('#globalSearch');
      await input.focus();
      await page.locator('#quickSearchResults').waitFor({state:'visible'});
      const firstPlace = await page.locator('.search-place-grid [data-place-id]').first().getAttribute('data-place-id');
      if (firstPlace !== 'finch-sparrow') throw new Error('Favorite store not first');
      const firstEvent = await page.locator('.search-event-result').first().getAttribute('data-event-id');
      const firstSeries = await page.evaluate(id => {const e = DATA.events.find(e=>e.id===id); return e.seriesId || e.id;},firstEvent);
      if (firstSeries !== favoriteEvent) throw new Error('Favorite event not first');
      await input.fill('Joyful');
      await page.locator('.search-place-grid [data-place-id="joyful-toad-tcg"]').waitFor();
      if (!await page.locator('.search-place-grid .hours-popover').count()) throw new Error('Search missing store hours');
      await page.screenshot({path:'work/favorite-search-desktop.png',animations:'disabled'});
      await page.locator('.search-place-grid [data-place-id="joyful-toad-tcg"]').click();
      await page.locator('#placeDetail').getByRole('heading',{name:'Joyful Toad TCG',exact:true}).waitFor();
      if (await input.inputValue() !== '') throw new Error('Search filter not cleared on selection');
      assertText(await page.locator('#placeDetail').innerText(), 'Personally validated favorite', 'corrected summary');
      await page.setViewportSize({width:390,height:844});
      await input.fill('Finch');
      await page.screenshot({path:'work/favorite-search-mobile.png',animations:'disabled'});
      if (await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)) throw new Error('Search mobile overflow');
      await page.keyboard.press('Escape');
      if (await page.locator('#quickSearchResults').isVisible()) throw new Error('Escape did not close search');
      pass('Favorite store and event first; direct profile, hours, corrected summary, mobile and Escape');
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
      await page.locator('.nav-item[data-route="events"]').click({ timeout: 10000 });
      const eventCard = page.locator('#route-events .event-card:visible').first();
      await eventCard.waitFor({ state: 'visible', timeout: 20000 });
      const eventId = await eventCard.getAttribute('data-event-id');
      const eventTitle = await eventCard.locator('h3').innerText();
      await eventCard.click({ timeout: 5000, position: { x: 12, y: 12 } });
      const drawerDislike = page.locator('#detailDrawer [data-action="toggle-event-dislike"]');
      await drawerDislike.waitFor({ state: 'visible', timeout: 5000 });
      await drawerDislike.click({ timeout: 5000 });
      if (await page.locator('#detailDrawer.open').count()) throw new Error(`Event detail drawer stayed open after dislike: ${eventTitle}`);
      if (await page.locator(`#route-events [data-event-id="${eventId}"]:visible`).count()) throw new Error(`Disliked event remained visible in the ordinary Events catalog: ${eventTitle}`);
      await page.locator('.nav-item[data-route="signals"]').click({ timeout: 5000 });
      await page.waitForTimeout(100);
      const briefingLeak = page.locator(`#route-signals [data-event-id="${eventId}"]:visible`).first();
      if (await briefingLeak.count()) throw new Error(`Disliked event leaked into Briefing: ${eventTitle}. ${await briefingLeak.evaluate((node) => node.outerHTML.slice(0, 1000))}`);
      await page.locator('.nav-item[data-route="events"]').click({ timeout: 5000 });
      await page.evaluate(() => openFilters());
      await page.locator('input[name="planningGroup"][value="hidden"]').check();
      await page.locator('#applyFilters').click({ timeout: 5000 });
      const restore = page.locator('#route-events [data-event-id]').filter({ hasText: eventTitle }).locator('[data-action="toggle-event-dislike"]').first();
      const hiddenBucketSummary = restore.locator('xpath=ancestor::details[1]/summary');
      if (await hiddenBucketSummary.count()) await hiddenBucketSummary.click({ timeout: 5000 });
      await restore.waitFor({ state: 'visible', timeout: 5000 });
      await restore.click({ timeout: 5000 });
      const storedDislikes = await page.evaluate(() => {
        const personal = JSON.parse(localStorage.getItem('mana-radar-personal') || '{}');
        return Object.values(personal.ratings || {}).filter((rating) => Number(rating) === 1).length;
      });
      if (storedDislikes) throw new Error(`Removing the event dislike did not restore its preference: ${eventTitle}`);
      pass('Event dislike suppresses ordinary planning surfaces and stays recoverable', `${eventTitle} left Events and Briefing, then restored through the Hidden / poor fit filter`);
    } else if (scenario === 'place-dislike-suppression') {
      await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.evaluate(() => localStorage.removeItem('mana-radar-personal'));
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
      await page.locator('.nav-item[data-route="places"]').click({ timeout: 10000 });
      const ordinaryRow = page.locator('#placeList > .entity-list-item, #placeList > .entity-list-favorite-group + .entity-list-item').first();
      await ordinaryRow.waitFor({ state: 'visible', timeout: 20000 });
      const placeId = await ordinaryRow.getAttribute('data-place-id');
      const placeName = (await ordinaryRow.locator('strong').first().innerText()).trim();
      await ordinaryRow.click({ timeout: 5000 });
      await page.locator('#placeDetail [data-action="toggle-place-hidden"]').click({ timeout: 5000 });
      const ordinaryLeak = page.locator(`#placeList > .entity-list-item[data-place-id="${placeId}"], #placeList > .entity-list-favorite-group .entity-list-item[data-place-id="${placeId}"]`);
      if (await ordinaryLeak.count()) throw new Error(`Thumbed-down place remained in the ordinary Places list: ${placeName}`);
      const hiddenGroup = page.locator('#placeList .entity-list-hidden-group');
      await hiddenGroup.waitFor({ state: 'visible', timeout: 5000 });
      await hiddenGroup.locator('summary').click({ timeout: 5000 });
      await hiddenGroup.locator(`[data-place-id="${placeId}"]`).waitFor({ state: 'visible', timeout: 5000 });
      await page.locator('#globalSearch').fill(placeName);
      const searchLeak = page.locator(`#quickSearchResults [data-place-id="${placeId}"]`);
      if (await searchLeak.count()) throw new Error(`Thumbed-down place leaked into global search: ${placeName}`);
      pass('Place dislike is globally suppressed and recoverable', `${placeName} moved from the ordinary Places list into the collapsed Hidden / low-fit group and stayed out of global search`);
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
