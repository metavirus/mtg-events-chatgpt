const DATA = { stores: [], events: [], sources: [], changes: [], signals: [], artifacts: [], dailyAgentStatuses: [] };

const SUPABASE = {
  url: 'https://pyvftzsodzwfqncjbmbc.supabase.co',
  publishableKey: 'sb_publishable_So6NutzmRqZnWIRis9uI1g_E1AT06Wm'
};

const AUTH_REDIRECT_URL = 'https://metavirus.github.io/mtg-events-chatgpt/';
const AUTH_STORAGE_KEY = 'sb-pyvftzsodzwfqncjbmbc-auth-token';
const DATA_FETCH_TIMEOUT_MS = 9000;
const AUTH_STARTUP_SLOW_MS = 5000;
const personalAuth = { client: null, user: null, status: 'checking', message: 'Restoring sign-in…', sendingLink: false, startupComplete: false, refreshInFlight: null };
let appInitialized = false;
let artifactPreviewUrl = null;

const COMMUNITY_SEED = [
  {
    id: 'legendary-creature-club',
    name: 'Legendary Creature Club',
    region: 'Long Beach · South Bay',
    status: 'partial',
    formats: ['Commander', 'Meetups'],
    channel: 'Discord',
    summary: 'A geographically relevant player group with a Long Beach and South Bay center of gravity. Its proximity makes it especially interesting for repeat local relationships.',
    signal: 'Closer regional fit',
    nextQuestion: 'Normalize its current meetup cadence, venue relationships, and newcomer coordination pattern.'
  },
  {
    id: 'infinite-loop-mtg',
    name: 'Infinite Loop MTG',
    region: 'Los Angeles · northern coverage',
    status: 'partial',
    formats: ['Magic', 'Commander'],
    channel: 'Discord',
    summary: 'A strong regional Magic community lead whose events tend to be farther north. Still appealing when the event or group signal is unusually strong.',
    signal: 'High interest, farther travel',
    nextQuestion: 'Map recurring hosts and separate nearby opportunities from the broader LA stream.'
  },
  {
    id: 'mtg-oc',
    name: 'MTG OC',
    region: 'Orange County',
    status: 'discovery',
    formats: ['Magic', 'Community'],
    channel: 'Discord',
    summary: 'An independent Orange County Magic community for cross-store discovery, meetup coordination, and player connections.',
    signal: 'Regional community route',
    nextQuestion: 'Identify the most useful Discord channels for meetups, LFG activity, and actionable Orange County announcements.'
  }
];

const EVENT_CATALOG_PAGE_SIZE = 36;
const WEEKDAY_INDEX = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  tues: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  thurs: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6
};

const state = {
  route: 'signals',
  routeHistory: [],
  view: 'agenda',
  date: startOfDay(new Date()),
  agendaDays: 42,
  preset: 'all',
  eventCatalogView: 'list',
  eventCatalogFilter: 'all',
  eventCatalogDate: startOfDay(new Date()),
  eventCatalogVisible: EVENT_CATALOG_PAGE_SIZE,
  changeFilter: 'all',
  changesUnreadOnOpen: 0,
  favoritesOnly: false,
  showReadSignals: false,
  highlightsCollapsed: false,
  placePickerOpen: false,
  search: '',
  selectedPlaceId: null,
  selectedPlaceWasAuto: true,
  selectedPlaceTab: 'overview',
  selectedCommunityId: null,
  selectedCommunityTab: 'overview',
  communitySurfaceFilter: 'all',
  placeFilter: 'all',
  placeSort: 'best',
  filters: {
    research: ['partial', 'wizards-discovery'],
    confidence: ['high', 'medium', 'low'],
    planningGroups: ['limited', 'best', 'promising', 'verify', 'maybe'],
    distance: 30,
    hideCompetitive: true,
    onlyFree: false
  },
  personal: loadPersonal()
};
state.dataSource = 'loading';

function loadPersonal() {
  try {
    const saved = JSON.parse(localStorage.getItem('mana-radar-personal')) || {};
    return { ...defaultPersonal(), ...saved, hidden: saved.hidden || {}, signalRead: saved.signalRead || {} };
  } catch (_) {
    return defaultPersonal();
  }
}

function defaultPersonal() {
  return { favorites: {}, hidden: {}, ratings: {}, notes: {}, signalRead: {}, interested: {}, activity: [], updatesSeenAt: null };
}

const DISCOVERY_POSSIBILITIES = [
  {
    id: 'mtg-lgbt-commander-oc',
    name: 'Magic The Gathering LGBT Commander Meetup',
    area: 'Orange County',
    why: 'Possible LGBTQ+ Commander/community lead near OC; needs a current public source before it graduates.',
    next: 'Verify whether it is active and distinct from already-known MTG OC / GayMTG routes.',
    query: 'Magic The Gathering LGBT Commander Meetup Orange County'
  },
  {
    id: 'here-clubhouse-queer-mtg',
    name: 'Here Clubhouse queer MTG',
    area: 'Los Angeles',
    why: 'Possible queer social-space MTG lead; current Magic-specific activity is still unclear.',
    next: 'Look for a current event post, calendar row, or recurring meetup reference.',
    query: 'Here Clubhouse queer Magic The Gathering Los Angeles'
  },
  {
    id: 'topdeck-lethal',
    name: 'Topdeck Lethal',
    area: 'SoCal / online-adjacent',
    why: 'Possible community/content lead that may point to real meetups or events.',
    next: 'Confirm whether there is current Southern California in-person activity.',
    query: 'Topdeck Lethal Magic The Gathering Los Angeles meetup'
  },
  {
    id: 'lotus-guild',
    name: 'Lotus Guild',
    area: 'Los Angeles / SoCal',
    why: 'Possible group name from fuzzy discovery; needs identity and current activity confirmation.',
    next: 'Find a current official/social route and decide if it belongs in Communities.',
    query: 'Lotus Guild Magic The Gathering Los Angeles'
  },
  {
    id: 'geeks-out-la',
    name: 'Geeks OUT L.A.',
    area: 'Los Angeles',
    why: 'Relevant queer geek community lead; MTG-specific usefulness is unproven.',
    next: 'Check whether any current tabletop/MTG event exists before promoting.',
    query: 'Geeks OUT Los Angeles Magic The Gathering'
  }
];

function savePersonal(action) {
  localStorage.setItem('mana-radar-personal', JSON.stringify(state.personal));
  if (action) {
    state.personal.activity.unshift({ at: new Date().toISOString(), ...action });
    state.personal.activity = state.personal.activity.slice(0, 100);
    localStorage.setItem('mana-radar-personal', JSON.stringify(state.personal));
  }
}

function latestChangeTimestamp() {
  return DATA.changes.reduce((latest, change) => {
    const at = change?.detectedAt || '';
    return at > latest ? at : latest;
  }, '');
}

function acceptedChanges() {
  return DATA.changes.filter((change) => (change?.reviewStatus || '').toLowerCase() === 'accepted');
}

function latestAcceptedChangeTimestamp() {
  return acceptedChanges().reduce((latest, change) => {
    const at = change?.detectedAt || '';
    return at > latest ? at : latest;
  }, '');
}

function latestDataTimestamp() {
  const values = [
    latestAcceptedChangeTimestamp(),
    latestChangeTimestamp(),
    ...DATA.stores.map((place) => place.lastVerified),
    ...DATA.events.map((event) => event.lastVerified),
    ...DATA.sources.map((item) => item.lastChecked)
  ].filter(Boolean);
  return values.sort().at(-1) || '';
}

function unreadChangesCount() {
  const seenAt = state.personal.updatesSeenAt || '';
  return acceptedChanges().filter((change) => (change?.detectedAt || '') > seenAt).length;
}

function markChangesRead() {
  const latest = latestAcceptedChangeTimestamp();
  if (!latest || state.personal.updatesSeenAt === latest) return;
  state.personal.updatesSeenAt = latest;
  savePersonal();
}

function compareText(a, b, options = { sensitivity: 'base' }) {
  return String(a ?? '').localeCompare(String(b ?? ''), undefined, options);
}

async function load() {
  const dataSource = new URLSearchParams(window.location.search).get('data');
  if (dataSource === 'json') {
    state.dataSource = 'json';
    await loadFromJson();
    state.selectedPlaceId = defaultSelectedPlaceId();
    initialize();
    initializePersonalAuthAfterRender();
    return;
  }

  state.dataSource = 'loading';
  initialize();
  initializePersonalAuthAfterRender();
  loadSupabaseAfterRender();
}

async function loadSupabaseAfterRender() {
  try {
    await loadFromSupabase();
    state.dataSource = 'supabase';
    state.selectedPlaceId = DATA.stores.some((place) => place.id === state.selectedPlaceId)
      ? state.selectedPlaceId
      : defaultSelectedPlaceId();
  } catch (error) {
    console.warn('Supabase read failed; no automatic JSON recovery fallback will be used.', error);
    state.dataSource = 'supabase-error';
  }
  renderAll();
}

function initializePersonalAuthAfterRender() {
  const slowTimer = window.setTimeout(() => {
    if (personalAuth.startupComplete || personalAuth.user || personalAuth.status !== 'checking') return;
    personalAuth.message = 'Still restoring sign-in…';
    updateAuthChrome();
  }, AUTH_STARTUP_SLOW_MS);
  initializePersonalAuth().catch((error) => {
    console.warn('Personal preference startup failed; local state remains active.', error);
    personalAuth.status = 'local';
    personalAuth.message = 'Saved on this device';
    personalAuth.startupComplete = true;
    updateAuthChrome();
  }).finally(() => {
    window.clearTimeout(slowTimer);
  });
}

function authRedirectUrl() {
  if (window.location.origin && window.location.pathname) return `${window.location.origin}${window.location.pathname}`;
  return AUTH_REDIRECT_URL;
}

async function initializePersonalAuth() {
  if (!window.supabase?.createClient) {
    personalAuth.status = 'local';
    personalAuth.message = 'Account service unavailable; preferences remain on this device.';
    personalAuth.startupComplete = true;
    updateAuthChrome();
    return;
  }
  personalAuth.status = 'checking';
  personalAuth.message = 'Restoring sign-in…';
  updateAuthChrome();
  personalAuth.client = window.supabase.createClient(SUPABASE.url, SUPABASE.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'implicit',
      storageKey: AUTH_STORAGE_KEY
    }
  });
  personalAuth.client.auth.onAuthStateChange((event, session) => {
    window.setTimeout(() => {
      if (!personalAuth.startupComplete && event === 'INITIAL_SESSION') return;
      void handleAuthSession(session, event);
    }, 0);
  });
  await recoverAuthSessionFromUrl();
  const { data, error } = await personalAuth.client.auth.getSession();
  if (error) {
    personalAuth.status = 'local';
    personalAuth.message = 'Could not restore sign-in; preferences remain on this device.';
    personalAuth.startupComplete = true;
    updateAuthChrome();
    return;
  }
  personalAuth.startupComplete = true;
  await handleAuthSession(data.session, 'INITIAL_SESSION');
  bindAuthResumeRefresh();
}

async function recoverAuthSessionFromUrl() {
  if (!personalAuth.client) return;
  const url = new URL(window.location.href);
  const authCode = url.searchParams.get('code');
  if (authCode) {
    const { error } = await personalAuth.client.auth.exchangeCodeForSession(authCode);
    if (error) {
      console.warn('Magic-link code exchange failed.', error);
      personalAuth.status = 'error';
      personalAuth.message = 'Sign-in link could not be restored here';
      updateAuthChrome();
      return;
    }
    cleanAuthCallbackUrl();
    return;
  }
  if (!window.location.hash.includes('access_token=')) return;
  const params = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (!accessToken || !refreshToken) return;
  const { error } = await personalAuth.client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  if (error) {
    console.warn('Magic-link session recovery failed.', error);
    return;
  }
  cleanAuthCallbackUrl();
}

function cleanAuthCallbackUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  window.history.replaceState(null, document.title, `${url.pathname}${url.search}${url.hash && !url.hash.includes('access_token=') ? url.hash : ''}`);
}

function hasAuthCallbackInUrl() {
  const url = new URL(window.location.href);
  return url.searchParams.has('code') || /(?:^|[&#])access_token=/.test(window.location.hash);
}

function bindAuthResumeRefresh() {
  if (bindAuthResumeRefresh.bound) return;
  bindAuthResumeRefresh.bound = true;
  const refresh = () => {
    if (document.visibilityState && document.visibilityState !== 'visible') return;
    void refreshPersonalAuthSession();
  };
  window.addEventListener('focus', refresh);
  document.addEventListener('visibilitychange', refresh);
}

async function refreshPersonalAuthSession() {
  if (!personalAuth.client) return;
  if (personalAuth.refreshInFlight) return personalAuth.refreshInFlight;
  personalAuth.refreshInFlight = personalAuth.client.auth.getSession()
    .then(({ data, error }) => {
      if (error) throw error;
      return handleAuthSession(data.session, 'RESUME_SESSION');
    })
    .catch((error) => {
      console.warn('Personal preference session refresh failed.', error);
      if (personalAuth.user) {
        personalAuth.status = 'error';
        personalAuth.message = 'Signed in, but sync needs a refresh';
        updateAuthChrome();
      }
    })
    .finally(() => {
      personalAuth.refreshInFlight = null;
    });
  return personalAuth.refreshInFlight;
}

async function handleAuthSession(session, event) {
  const nextUser = session?.user || null;
  if (!nextUser) {
    personalAuth.user = null;
    DATA.artifacts = [];
    personalAuth.status = 'local';
    personalAuth.message = 'Saved on this device';
    updateAuthChrome();
    return;
  }
  if (personalAuth.user?.id === nextUser.id && personalAuth.status === 'synced' && ['INITIAL_SESSION', 'RESUME_SESSION', 'TOKEN_REFRESHED'].includes(event)) return;
  personalAuth.user = nextUser;
  personalAuth.status = 'syncing';
  personalAuth.message = 'Syncing preferences…';
  updateAuthChrome();
  try {
    await syncPersonalState();
    try {
      await loadSourceArtifacts();
    } catch (artifactError) {
      DATA.artifacts = [];
      console.warn('Optional source-image evidence could not be loaded.', artifactError);
    }
    personalAuth.status = 'synced';
    personalAuth.message = 'Saved to your account';
  } catch (error) {
    console.warn('Personal preference sync failed; local state remains active.', error);
    personalAuth.status = 'error';
    personalAuth.message = 'Saved locally — account sync unavailable';
  }
  updateAuthChrome();
  renderAll();
}

async function loadSourceArtifacts() {
  if (!personalAuth.client || !personalAuth.user) {
    DATA.artifacts = [];
    return;
  }
  const [{ data: artifacts, error: artifactError }, { data: links, error: linkError }] = await Promise.all([
    personalAuth.client
      .from('source_artifacts')
      .select('id,source_id,origin_url,platform,published_at,captured_at,storage_path,original_filename,mime_type,width,height,analysis_status,extracted_text,extracted_facts,analysis_summary,analysis_confidence'),
    personalAuth.client
      .from('source_artifact_links')
      .select('artifact_id,target_type,target_id,relationship')
  ]);
  if (artifactError) throw artifactError;
  if (linkError) throw linkError;
  const linksByArtifact = groupValues(links || [], (item) => item.artifact_id, (item) => ({
    targetType: item.target_type,
    targetId: item.target_id,
    relationship: item.relationship
  }));
  DATA.artifacts = (artifacts || []).map((item) => ({
    id: item.id,
    sourceId: item.source_id,
    originUrl: item.origin_url || '',
    platform: item.platform || '',
    publishedAt: item.published_at || '',
    capturedAt: item.captured_at || '',
    storagePath: item.storage_path,
    originalFilename: item.original_filename || '',
    mimeType: item.mime_type || '',
    width: item.width,
    height: item.height,
    status: item.analysis_status,
    extractedText: item.extracted_text || '',
    facts: item.extracted_facts || {},
    summary: item.analysis_summary || '',
    confidence: item.analysis_confidence || '',
    links: linksByArtifact.get(item.id) || []
  }));
}

async function syncPersonalState() {
  const [{ data: preferences, error: preferenceError }, { data: notes, error: noteError }, { data: signalStates, error: signalStateError }] = await Promise.all([
    personalAuth.client.from('entity_preferences').select('*'),
    personalAuth.client.from('personal_notes').select('*'),
    personalAuth.client.from('signal_user_states').select('*')
  ]);
  if (preferenceError) throw preferenceError;
  if (noteError) throw noteError;
  if (signalStateError) throw signalStateError;
  const remoteIsEmpty = !preferences.length && !notes.length && !signalStates.length;
  if (remoteIsEmpty) {
    await importLocalPersonalState();
    return;
  }
  applyRemotePersonalState(preferences, notes, signalStates);
}

async function importLocalPersonalState() {
  const preferenceRows = personalPreferenceRows();
  const noteRows = personalNoteRows();
  const signalRows = personalSignalStateRows();
  if (preferenceRows.length) {
    const { error } = await personalAuth.client.from('entity_preferences').upsert(preferenceRows, { onConflict: 'user_id,entity_type,entity_id' });
    if (error) throw error;
  }
  if (noteRows.length) {
    const { error } = await personalAuth.client.from('personal_notes').upsert(noteRows, { onConflict: 'user_id,entity_type,entity_id' });
    if (error) throw error;
  }
  if (signalRows.length) {
    const { error } = await personalAuth.client.from('signal_user_states').upsert(signalRows, { onConflict: 'user_id,signal_id' });
    if (error) throw error;
  }
}

function personalPreferenceRows() {
  const keys = new Set([
    ...Object.keys(state.personal.favorites || {}),
    ...Object.keys(state.personal.hidden || {}),
    ...Object.keys(state.personal.ratings || {})
  ]);
  const rows = [...keys].map((key) => {
    const target = personalTarget(key);
    if (!target) return null;
    return {
      user_id: personalAuth.user.id,
      entity_type: target.entityType,
      entity_id: target.entityId,
      is_favorite: !!state.personal.favorites[key],
      visibility_preference: state.personal.hidden[key] ? 'deprioritize' : 'normal',
      rating: state.personal.ratings[key] || null,
      updated_at: new Date().toISOString()
    };
  }).filter(Boolean);
  return [...new Map(rows.map((row) => [`${row.entity_type}:${row.entity_id}`, row])).values()];
}

function personalNoteRows() {
  const rows = Object.entries(state.personal.notes || {}).map(([key, value]) => {
    const target = personalTarget(key);
    if (!target || !String(value).trim()) return null;
    return {
      user_id: personalAuth.user.id,
      entity_type: target.entityType,
      entity_id: target.entityId,
      note_text: String(value).trim(),
      updated_at: new Date().toISOString()
    };
  }).filter(Boolean);
  return [...new Map(rows.map((row) => [`${row.entity_type}:${row.entity_id}`, row])).values()];
}

function personalSignalStateRows() {
  const now = new Date().toISOString();
  return Object.keys(state.personal.signalRead || {}).map((signalId) => ({
    user_id: personalAuth.user.id,
    signal_id: signalId,
    read_at: state.personal.signalRead[signalId] || now,
    updated_at: now
  }));
}

function applyRemotePersonalState(preferences, notes, signalStates = []) {
  for (const collection of ['favorites', 'hidden', 'ratings', 'notes', 'signalRead']) {
    for (const key of Object.keys(state.personal[collection] || {})) {
      if (collection === 'signalRead' || key.startsWith('place:') || key.startsWith('event:')) delete state.personal[collection][key];
    }
  }
  for (const row of preferences) {
    const key = localPersonalKey(row.entity_type, row.entity_id);
    if (!key) continue;
    if (row.is_favorite) state.personal.favorites[key] = true;
    if (row.visibility_preference !== 'normal') state.personal.hidden[key] = true;
    if (row.rating) state.personal.ratings[key] = row.rating;
  }
  for (const row of notes) {
    const key = localPersonalKey(row.entity_type, row.entity_id);
    if (key) state.personal.notes[key] = row.note_text;
  }
  for (const row of signalStates) {
    if (row.signal_id && row.read_at) state.personal.signalRead[row.signal_id] = row.read_at;
  }
  savePersonal();
}

function personalTarget(key) {
  const separator = key.indexOf(':');
  if (separator < 1) return null;
  const prefix = key.slice(0, separator);
  const rawId = key.slice(separator + 1);
  if (prefix === 'place') return { entityType: 'venue', entityId: rawId };
  if (prefix === 'community') return { entityType: 'community', entityId: rawId };
  if (prefix === 'event') {
    const event = DATA.events.find((item) => item.id === rawId || item.seriesId === rawId);
    return { entityType: 'event_series', entityId: event?.seriesId || rawId };
  }
  return null;
}

function localPersonalKey(entityType, entityId) {
  if (entityType === 'venue') return `place:${entityId}`;
  if (entityType === 'community') return `community:${entityId}`;
  if (entityType === 'event_series') return `event:${entityId}`;
  if (entityType === 'event_occurrence') return `event:${entityId}`;
  return null;
}

function eventPreferenceKey(event) {
  return `event:${event?.seriesId || event?.id}`;
}

async function loadFromJson() {
  for (const key of ['stores', 'events', 'sources', 'changes']) {
    const response = await fetch(`${key}.json`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load ${key}.json`);
    DATA[key] = await response.json();
  }
  DATA.stores = DATA.stores.map(normalizeJsonPlace);
  DATA.signals = [];
}

function normalizeJsonPlace(place) {
  return {
    ...place,
    hours: normalizePlaceHours(place.hours || place.assessment?.hours)
  };
}

async function loadFromSupabase() {
  const tables = await Promise.all([
    supabaseRows('venues'),
    supabaseRows('communities'),
    supabaseRows('sources'),
    supabaseRows('entity_sources'),
    supabaseRows('event_series'),
    supabaseRows('event_occurrences'),
    supabaseRows('event_sources'),
    supabaseRows('evaluations'),
    supabaseRows('product_research_changes'),
    supabaseRowsOptional('venue_hours'),
    supabaseRowsOptional('signals'),
    supabaseRowsOptional('daily_agent_status')
  ]);
  const [venues, communities, sources, entitySources, series, occurrences, eventSources, evaluations, changes, venueHours, signals, dailyAgentStatuses] = tables;
  const evaluationByEntity = new Map(evaluations.map((item) => [`${item.entity_type}:${item.entity_id}`, item]));
  const hoursByVenue = new Map(venueHours.map((item) => [item.venue_id, item]));
  const sourceIdsByEntity = groupValues(entitySources, (item) => `${item.entity_type}:${item.entity_id}`, (item) => item.source_id);
  const sourcesBySeries = groupValues(eventSources.filter((item) => item.series_id), (item) => item.series_id, (item) => item);
  const sourcesByOccurrence = groupValues(eventSources.filter((item) => item.occurrence_id), (item) => item.occurrence_id, (item) => item);
  const seriesById = new Map(series.map((item) => [item.id, item]));
  const occurrenceSeriesIds = new Set(occurrences.map((item) => item.series_id));

  DATA.stores = venues.map((item) => mapVenue(item, sourceIdsByEntity, evaluationByEntity, hoursByVenue));
  DATA.sources = sources.map(mapSource);
  DATA.changes = changes.map(mapResearchChange);
  DATA.signals = signals.map(mapSignal);
  DATA.dailyAgentStatuses = dailyAgentStatuses.map(mapDailyAgentStatus);
  const mappedSeries = series.map((item) => mapEventSeries(item, sourcesBySeries));
  DATA.events = [
    ...mappedSeries.filter((item) => item.recurrence?.frequency === 'weekly' || !occurrenceSeriesIds.has(item.id)),
    ...occurrences.map((item) => mapEventOccurrence(item, seriesById.get(item.series_id), sourcesByOccurrence, sourcesBySeries))
  ].filter(Boolean);

  if (communities.length) {
    for (const community of communities.map((item) => mapCommunity(item, sourceIdsByEntity, evaluationByEntity))) {
      const existing = COMMUNITY_SEED.findIndex((item) => item.id === community.id);
      if (existing >= 0) COMMUNITY_SEED[existing] = community;
      else COMMUNITY_SEED.push(community);
    }
  }
}

async function supabaseRows(table) {
  const pageSize = 1000;
  const rows = [];
  const orderBy = {
    entity_sources: 'entity_type.asc,entity_id.asc,source_id.asc',
    venue_hours: 'venue_id.asc'
  }[table] || 'id.asc';
  for (let start = 0; ; start += pageSize) {
    const response = await fetchWithTimeout(`${SUPABASE.url}/rest/v1/${table}?select=*&order=${orderBy}`, {
      headers: {
        apikey: SUPABASE.publishableKey,
        Authorization: `Bearer ${SUPABASE.publishableKey}`,
        Range: `${start}-${start + pageSize - 1}`,
        'Range-Unit': 'items'
      },
      cache: 'no-store'
    }, DATA_FETCH_TIMEOUT_MS);
    if (!response.ok) throw new Error(`Supabase could not load ${table}`);
    const page = await response.json();
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = DATA_FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

async function supabaseRowsOptional(table) {
  try {
    return await supabaseRows(table);
  } catch (error) {
    console.warn(`Optional Supabase table ${table} is not available yet.`, error);
    return [];
  }
}

function groupValues(items, keyFn, valueFn) {
  const grouped = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(valueFn(item));
  }
  return grouped;
}

function mapVenue(item, sourceIdsByEntity, evaluationByEntity, hoursByVenue = new Map()) {
  const assessment = item.assessment || {};
  const hours = hoursByVenue.get(item.id);
  return {
    id: item.id,
    name: item.name,
    city: item.city || '',
    address: item.address || '',
    phone: item.phone || '',
    website: item.website || '',
    eventsUrl: item.events_url || '',
    instagram: item.instagram || '',
    wpnPremium: Boolean(item.wpn_premium),
    distanceMiles: item.distance_miles == null ? null : Number(item.distance_miles),
    status: item.operating_status,
    lastVerified: item.last_verified || '',
    researchStatus: normalizeResearchStatusForUi(item.research_status),
    researchStage: item.research_status,
    lifecycleState: item.lifecycle_state || 'unreviewed',
    evaluation: mapEvaluation(evaluationByEntity.get(`venue:${item.id}`)),
    assessment,
    hours: normalizePlaceHours(hours ? mapVenueHours(hours) : assessment.hours),
    assessmentNotes: item.planning_summary || item.assessment_notes || '',
    assessmentDetail: item.assessment_notes || '',
    sourceIds: sourceIdsByEntity.get(`venue:${item.id}`) || []
  };
}

function mapVenueHours(item) {
  return {
    status: item.status,
    weekly: item.weekly_hours,
    temporary: item.temporary_updates,
    sourceId: item.source_id,
    lastVerified: item.last_verified,
    note: item.notes
  };
}

function normalizePlaceHours(value) {
  const hours = value && typeof value === 'object' ? value : {};
  const status = ['verified', 'variable', 'stale', 'unknown'].includes(hours.status) ? hours.status : 'unknown';
  const weekly = hours.weekly && typeof hours.weekly === 'object' ? hours.weekly : {};
  const temporary = Array.isArray(hours.temporary) ? hours.temporary : [];
  return {
    status,
    weekly,
    temporary,
    sourceId: hours.sourceId || '',
    lastVerified: hours.lastVerified || '',
    note: hours.note || ''
  };
}

function mapCommunity(item, sourceIdsByEntity, evaluationByEntity) {
  return {
    id: item.id,
    name: item.name,
    region: item.region || '',
    status: normalizeResearchStatusForUi(item.research_status),
    researchStage: item.research_status,
    formats: item.formats || [],
    channel: item.primary_channel || '',
    summary: item.summary || '',
    signal: item.signal || '',
    nextQuestion: item.next_question || '',
    evaluation: mapEvaluation(evaluationByEntity.get(`community:${item.id}`)),
    sourceIds: sourceIdsByEntity.get(`community:${item.id}`) || []
  };
}

function normalizeResearchStatusForUi(value) {
  if (value === 'reviewed' || value === 'deepened') return 'partial';
  if (value === 'discovery') return 'wizards-discovery';
  return value;
}

function mapSource(item) {
  return {
    id: item.id,
    label: item.label,
    url: item.url || '',
    type: item.source_type,
    status: item.health_status,
    lastChecked: item.last_checked || ''
  };
}

function mapEvaluation(item) {
  if (!item) return undefined;
  return {
    researchStatus: item.research_status,
    candidateStatus: item.candidate_status,
    fitGrade: item.fit_grade,
    fitScore: item.fit_score == null ? null : Number(item.fit_score),
    confidence: item.confidence,
    positives: item.positives || [],
    cautions: item.cautions || [],
    openQuestions: item.open_questions || []
  };
}

function mapResearchChange(item) {
  return {
    id: item.id,
    detectedAt: item.detected_at,
    changeType: item.change_type,
    entityType: item.entity_type,
    entityId: item.entity_id,
    summary: item.summary,
    details: item.details,
    reviewStatus: item.review_status
  };
}

function mapSignal(item) {
  return {
    id: item.id,
    category: item.category || '',
    priority: item.priority || 'normal',
    status: item.status || 'new',
    sourceId: item.source_id || '',
    capturedAt: item.captured_at || '',
    observedAt: item.observed_at || '',
    expiresAt: item.expires_at || '',
    relatedEntityType: item.related_entity_type || '',
    relatedEntityId: item.related_entity_id || '',
    summary: item.summary || '',
    details: item.details || '',
    evidenceUrl: item.evidence_url || '',
    confidence: item.confidence || '',
    suggestedAction: item.suggested_action || '',
    promotionTarget: item.promotion_target || '',
    dedupeKey: item.dedupe_key || ''
  };
}

function mapDailyAgentStatus(item) {
  return {
    id: item.id,
    label: item.label || '',
    surfaceGroup: item.surface_group || '',
    checkedAt: item.last_checked_at || '',
    primaryCount: Number(item.primary_count || 0),
    usefulCount: Number(item.useful_count || 0),
    quietCount: Number(item.quiet_count || 0),
    staleCount: Number(item.stale_count || 0),
    attentionCount: Number(item.attention_count || 0),
    latestResult: item.latest_result || '',
    summary: item.summary || '',
    route: item.route || '',
    actionLabel: item.action_label || ''
  };
}

function mapEventSeries(item, sourcesBySeries) {
  const sourceLinks = sourcesBySeries.get(item.id) || [];
  const selectedSourceLink = sourceLinks.find((link) => link.source_url) || sourceLinks[0];
  return {
    id: item.id,
    seriesId: item.id,
    storeId: item.venue_id || null,
    communityId: item.community_id || null,
    title: item.title,
    format: item.format || 'Unknown',
    eventType: item.event_type || '',
    bracket: item.bracket || 'unspecified',
    recurrence: normalizeRecurrence(item.recurrence, item.default_start_time),
    startDate: item.start_date || null,
    startTime: normalizeTime(item.default_start_time),
    endDate: item.end_date || null,
    entryFee: item.entry_fee == null ? null : Number(item.entry_fee),
    currency: item.currency || 'USD',
    details: item.details || '',
    sourceIds: sourceLinks.map((link) => link.source_id),
    sourceId: selectedSourceLink?.source_id,
    sourceUrl: selectedSourceLink?.source_url || '',
    sourceLinkScope: selectedSourceLink ? 'series' : '',
    createdAt: item.created_at || '',
    lastVerified: item.last_verified || '',
    confidence: item.confidence,
    status: item.event_status
  };
}

function mapEventOccurrence(item, series, sourcesByOccurrence, sourcesBySeries) {
  if (!series) return null;
  const directSourceLinks = sourcesByOccurrence.get(item.id) || [];
  const seriesSourceLinks = sourcesBySeries.get(item.series_id) || [];
  const sourceLinks = [...new Map([...directSourceLinks, ...seriesSourceLinks].map((link) => [link.source_id, link])).values()];
  const selectedSourceLink = sourceLinks.find((link) => link.source_url) || sourceLinks[0];
  const directSourceIds = new Set(directSourceLinks.map((link) => link.source_id));
  return {
    id: item.id,
    seriesId: item.series_id,
    storeId: series.venue_id || null,
    communityId: series.community_id || null,
    title: series.title,
    format: series.format || 'Unknown',
    eventType: series.event_type || '',
    bracket: series.bracket || 'unspecified',
    recurrence: null,
    date: item.occurrence_date,
    startDate: item.occurrence_date,
    startTime: normalizeTime(item.start_time || series.default_start_time),
    endTime: normalizeTime(item.end_time),
    physicalLocation: item.physical_location_text || '',
    entryFee: item.entry_fee == null ? (series.entry_fee == null ? null : Number(series.entry_fee)) : Number(item.entry_fee),
    capacity: item.capacity,
    currency: series.currency || 'USD',
    details: item.details || series.details || '',
    sourceIds: sourceLinks.map((link) => link.source_id),
    sourceId: selectedSourceLink?.source_id,
    sourceUrl: selectedSourceLink?.source_url || '',
    sourceLinkScope: selectedSourceLink ? (directSourceIds.has(selectedSourceLink.source_id) ? 'occurrence' : 'series') : '',
    createdAt: item.created_at || series.created_at || '',
    lastVerified: series.last_verified || '',
    confidence: occurrenceConfidence(item.evidence_state, series.confidence),
    status: series.event_status,
    occurrenceStatus: item.occurrence_status || null
  };
}

function normalizeRecurrence(value, defaultStartTime) {
  if (!value) return null;
  const recurrence = { ...value };
  if (recurrence.dayOfWeek == null && typeof recurrence.weekday === 'string') {
    const normalizedWeekday = recurrence.weekday.trim().toLowerCase();
    if (Object.hasOwn(WEEKDAY_INDEX, normalizedWeekday)) recurrence.dayOfWeek = WEEKDAY_INDEX[normalizedWeekday];
  }
  if (recurrence.dayOfWeek != null) recurrence.dayOfWeek = Number(recurrence.dayOfWeek);
  if (!recurrence.startTime && defaultStartTime) recurrence.startTime = normalizeTime(defaultStartTime);
  return recurrence;
}

function validWeeklyDayOfWeek(event) {
  const dayOfWeek = event.recurrence?.dayOfWeek;
  if (Number.isInteger(dayOfWeek) && dayOfWeek >= 0 && dayOfWeek <= 6) return dayOfWeek;
  console.warn(`Skipping event series with invalid weekly recurrence: ${event.id} (${event.title})`);
  return null;
}

function normalizeTime(value) {
  if (!value) return null;
  return String(value).slice(0, 5);
}

function occurrenceConfidence(evidenceState, fallback) {
  if (/confirmed|multi|strong|corroborated/i.test(evidenceState || '')) return 'high';
  return fallback || 'medium';
}

function initialize() {
  document.body.dataset.dataSource = state.dataSource;
  if (!appInitialized) {
    bindStaticEvents();
    appInitialized = true;
  }
  routeFromHash();
}

function bindStaticEvents() {
  document.addEventListener('click', handleClick);
  document.addEventListener('keydown', handleKeys);
  document.getElementById('globalSearch').addEventListener('input', (event) => {
    state.search = event.target.value.trim().toLowerCase();
    resetEventCatalogVisible();
    renderCurrentRoute();
  });
  document.getElementById('placeSearch').addEventListener('input', renderPlaces);
  document.getElementById('placeSearchMobile').addEventListener('input', (event) => {
    document.getElementById('placeSearch').value = event.target.value;
    renderPlaces();
  });
  document.getElementById('distanceFilter').addEventListener('input', (event) => {
    document.getElementById('distanceValue').textContent = `${event.target.value} miles`;
  });
  document.getElementById('fileImport').addEventListener('change', importFiles);
  window.addEventListener('hashchange', routeFromHash);
}

function handleClick(event) {
  const backButton = event.target.closest('#appBackButton');
  if (backButton) return navigateBack();

  const routeButton = event.target.closest('[data-route]');
  if (routeButton) return navigate(routeButton.dataset.route);

  const viewButton = event.target.closest('[data-view]');
  if (viewButton) {
    state.view = viewButton.dataset.view;
    document.querySelectorAll('[data-view]').forEach((button) => button.classList.toggle('active', button === viewButton));
    renderCalendar();
    return;
  }

  const presetButton = event.target.closest('[data-preset]');
  if (presetButton) {
    state.preset = toggledFilterValue(presetButton, 'preset', 'all');
    document.querySelectorAll('[data-preset]').forEach((button) => button.classList.toggle('active', button.dataset.preset === state.preset));
    renderCalendar();
    return;
  }

  const catalogViewButton = event.target.closest('[data-event-catalog-view]');
  if (catalogViewButton) {
    state.eventCatalogView = catalogViewButton.dataset.eventCatalogView;
    resetEventCatalogVisible();
    document.querySelectorAll('[data-event-catalog-view]').forEach((button) => button.classList.toggle('active', button === catalogViewButton));
    renderEventCatalog();
    return;
  }

  const catalogFilterButton = event.target.closest('[data-event-catalog-filter]');
  if (catalogFilterButton) {
    state.eventCatalogFilter = toggledFilterValue(catalogFilterButton, 'eventCatalogFilter', 'all');
    resetEventCatalogVisible();
    document.querySelectorAll('[data-event-catalog-filter]').forEach((button) => button.classList.toggle('active', button.dataset.eventCatalogFilter === state.eventCatalogFilter));
    renderEventCatalog();
    return;
  }

  const changeFilterButton = event.target.closest('[data-change-filter]');
  if (changeFilterButton) {
    state.changeFilter = toggledFilterValue(changeFilterButton, 'changeFilter', 'all');
    document.querySelectorAll('[data-change-filter]').forEach((button) => button.classList.toggle('active', button.dataset.changeFilter === state.changeFilter));
    renderChanges();
    return;
  }

  const placeTab = event.target.closest('[data-place-tab]');
  if (placeTab) {
    state.selectedPlaceTab = placeTab.dataset.placeTab;
    renderPlaceDetail(store(state.selectedPlaceId));
    return;
  }

  const communityTab = event.target.closest('[data-community-tab]');
  if (communityTab) {
    state.selectedCommunityTab = communityTab.dataset.communityTab;
    openCommunity(state.selectedCommunityId, true);
    return;
  }

  const communityOpenTab = event.target.closest('[data-community-open-tab]');
  if (communityOpenTab) {
    state.selectedCommunityId = communityOpenTab.dataset.communityId;
    state.selectedCommunityTab = communityOpenTab.dataset.communityOpenTab;
    openCommunity(state.selectedCommunityId, true);
    return;
  }

  const eventTrigger = event.target.closest('[data-event-id]');
  if (eventTrigger && !event.target.closest('[data-favorite]') && !event.target.closest('[data-place-id]') && !event.target.closest('[data-action]')) {
    const occurrenceDate = eventTrigger.dataset.date;
    return openEvent(eventTrigger.dataset.eventId, occurrenceDate);
  }

  const placeTrigger = event.target.closest('[data-place-id]');
  if (placeTrigger && !event.target.closest('[data-favorite]') && !event.target.closest('[data-action]')) {
    if (placeTrigger.dataset.placeMode === 'drawer') return openPlaceDrawer(placeTrigger.dataset.placeId);
    if (state.selectedPlaceId !== placeTrigger.dataset.placeId) state.selectedPlaceTab = 'overview';
    state.selectedPlaceId = placeTrigger.dataset.placeId;
    state.selectedPlaceWasAuto = false;
    closePlacePicker();
    navigate('places');
    renderPlaces();
    return;
  }

  const communityTrigger = event.target.closest('[data-community-id]');
  if (communityTrigger && !event.target.closest('[data-favorite]')) {
    const nestedInteractive = event.target.closest('a, button, input, textarea, select, summary');
    if (!nestedInteractive || nestedInteractive === communityTrigger) return openCommunity(communityTrigger.dataset.communityId);
  }

  const favorite = event.target.closest('[data-favorite]');
  if (favorite) return toggleFavorite(favorite.dataset.favorite);

  const rating = event.target.closest('[data-rating]');
  if (rating) return setRating(rating.dataset.entity, Number(rating.dataset.rating));

  const interested = event.target.closest('[data-interested]');
  if (interested) return toggleInterested(interested.dataset.interested);

  const action = event.target.closest('[data-action]');
  if (action) return handleAction(action.dataset.action, action);

  const placeFilter = event.target.closest('[data-place-filter]');
  if (placeFilter) {
    state.placeFilter = toggledFilterValue(placeFilter, 'placeFilter', 'all');
    document.querySelectorAll('[data-place-filter]').forEach((button) => button.classList.toggle('active', button.dataset.placeFilter === state.placeFilter));
    renderPlaces();
    return;
  }

  const placeSort = event.target.closest('[data-place-sort]');
  if (placeSort) {
    state.placeSort = placeSort.dataset.placeSort;
    document.querySelectorAll('[data-place-sort]').forEach((button) => button.classList.toggle('active', button === placeSort));
    renderPlaces();
    return;
  }

  const communityFilter = event.target.closest('[data-community-filter]');
  if (communityFilter) {
    state.communitySurfaceFilter = communityFilter.dataset.communityFilter;
    renderCommunities();
    return;
  }

  if (event.target.closest('#prevDate')) return moveDate(-1);
  if (event.target.closest('#nextDate')) return moveDate(1);
  if (event.target.closest('#resetToday')) { state.date = startOfDay(new Date()); state.agendaDays = 42; return renderCalendar(); }
  if (event.target.closest('#prevEventCatalogRange')) return moveEventCatalogDate(-1);
  if (event.target.closest('#nextEventCatalogRange')) return moveEventCatalogDate(1);
  if (event.target.closest('#resetEventCatalogRange')) { state.eventCatalogDate = startOfDay(new Date()); resetEventCatalogVisible(); return renderEventCatalog(); }
  if (event.target.closest('#jumpWeekend')) return jumpToWeekend();
  if (event.target.closest('#openFilters') || event.target.closest('[data-action="open-filters"]')) return openFilters();
  if (event.target.closest('[data-close-filters]')) return closeFilters();
  if (event.target.closest('#openPlacePicker')) return openPlacePicker();
  if (event.target.closest('#closePlacePicker')) return closePlacePicker();
  if (event.target.closest('#applyFilters')) return applyFilters();
  if (event.target.closest('#clearFilters')) return resetFilters();
  if (event.target.closest('#favoritesToggle')) return toggleFavoritesOnly();
  if (event.target.closest('#coverageButton')) return navigate('research');
  if (event.target.closest('#toggleHighlights')) return toggleHighlightsRail();
  if (event.target.closest('#drawerClose') || event.target.id === 'drawerScrim') {
    closeDrawer();
    closePlacePicker();
    return;
  }
  if (event.target.closest('#activityLogButton')) return openActivityLog();
  if (event.target.closest('#openQuickNote')) return openQuickNote();
  if (event.target.closest('#mobileMenu') || event.target.closest('#mobileMore')) return document.querySelector('.side-rail').classList.toggle('mobile-open');
}

function toggledFilterValue(button, datasetKey, defaultValue = 'all') {
  const value = button.dataset[datasetKey];
  return value !== defaultValue && button.classList.contains('active') ? defaultValue : value;
}

function resetEventCatalogVisible() {
  state.eventCatalogVisible = EVENT_CATALOG_PAGE_SIZE;
}

function handleKeys(event) {
  if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    event.preventDefault();
    document.getElementById('globalSearch').focus();
  }
  if (event.key === 'Escape') {
    closeDrawer();
    closeFilters();
    closePlacePicker();
    document.querySelector('.side-rail').classList.remove('mobile-open');
  }
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[role="button"][tabindex="0"]')) {
    event.preventDefault();
    event.target.click();
  }
}

function handleAction(action, element) {
  if (action === 'open-filters') return openFilters();
  if (action === 'day-popover') return openDay(element.dataset.dayDate);
  if (action === 'load-more') { state.agendaDays += 28; return renderCalendar(); }
  if (action === 'load-more-event-catalog') { state.eventCatalogVisible += EVENT_CATALOG_PAGE_SIZE; return renderEventCatalog(); }
  if (action === 'explain-scores') return openScoreExplanation(store(state.selectedPlaceId));
  if (action === 'show-highlights-hub') return openHighlightsHub();
  if (action === 'show-fresh-signals') return openFreshSignals();
  if (action === 'show-promising-nearby') return openPromisingNearby();
  if (action === 'show-discovery-queue') return openDiscoveryQueue();
  if (action === 'show-reviewed-places') return openReviewedPlaces();
  if (action === 'show-source-records') return navigate('places');
  if (action === 'show-format-balance') return navigate('events');
  if (action === 'save-note') return saveNote(element.dataset.entity, element.dataset.input);
  if (action === 'send-magic-link') return sendMagicLink(element.dataset.input);
  if (action === 'sign-out') return signOutPersonalAccount();
  if (action === 'show-log') return openActivityLog();
  if (action === 'toggle-read-signals') { state.showReadSignals = !state.showReadSignals; return renderSignals(); }
  if (action === 'open-signal') return openSignalDetail(element.dataset.signalId);
  if (action === 'open-change-events') return openChangeEvents(element.dataset.changeId);
  if (action === 'open-artifact') return openArtifactPreview(element.dataset.artifactId);
  if (action === 'mark-signal-read') return setSignalRead(element.dataset.signalId, true);
  if (action === 'restore-signal') return setSignalRead(element.dataset.signalId, false);
  if (action === 'dismiss-discovery-possibility') return setDiscoveryPossibilityHidden(element.dataset.possibilityId, true);
  if (action === 'restore-discovery-possibilities') return restoreDiscoveryPossibilities();
  if (action === 'dismiss-drawer') return closeDrawer();
  if (action === 'toggle-place-hidden') return toggleHidden(`place:${element.dataset.placeId}`);
  if (action === 'toggle-event-hidden') {
    const event = DATA.events.find((item) => item.id === element.dataset.eventId);
    return toggleHidden(event ? eventPreferenceKey(event) : `event:${element.dataset.eventId}`);
  }
  if (action === 'toggle-event-dislike') {
    const event = DATA.events.find((item) => item.id === element.dataset.eventId);
    return toggleEventDislike(event ? eventPreferenceKey(event) : `event:${element.dataset.eventId}`);
  }
  if (action === 'open-community-events') {
    state.selectedPlaceId = element.dataset.placeId;
    state.selectedPlaceTab = 'events';
    navigate('places');
    return renderPlaces();
  }
}

function navigate(route, options = {}) {
  if (!document.querySelector(`[data-route-panel="${route}"]`)) return;
  const changesUnreadOnOpen = route === 'changes' ? unreadChangesCount() : 0;
  if (!options.skipRouteHistory && state.route && state.route !== route) {
    state.routeHistory.push(state.route);
    state.routeHistory = state.routeHistory.slice(-25);
  }
  state.route = route;
  state.changesUnreadOnOpen = changesUnreadOnOpen;
  history.replaceState(null, '', `#${route}`);
  document.querySelectorAll('[data-route-panel]').forEach((panel) => panel.classList.toggle('active', panel.dataset.routePanel === route));
  document.querySelectorAll('.nav-item[data-route], .mobile-nav [data-route]').forEach((button) => button.classList.toggle('active', button.dataset.route === route));
  document.querySelector('.side-rail').classList.remove('mobile-open');
  closePlacePicker();
  renderCurrentRoute();
  if (route === 'changes') {
    markChangesRead();
    updateChrome();
  }
  document.querySelector('.workspace').scrollTo?.(0, 0);
}

function navigateBack() {
  const previousRoute = state.routeHistory.pop();
  if (previousRoute) return navigate(previousRoute, { skipRouteHistory: true });
  if (state.route !== 'signals') return navigate('signals', { skipRouteHistory: true });
}

function routeFromHash() {
  if (hasAuthCallbackInUrl()) {
    state.route = 'signals';
    history.replaceState(null, '', window.location.href);
    document.querySelectorAll('[data-route-panel]').forEach((panel) => panel.classList.toggle('active', panel.dataset.routePanel === state.route));
    document.querySelectorAll('.nav-item[data-route], .mobile-nav [data-route]').forEach((button) => button.classList.toggle('active', button.dataset.route === state.route));
    renderCurrentRoute();
    return;
  }
  const route = location.hash.replace('#', '') || 'signals';
  navigate(document.querySelector(`[data-route-panel="${route}"]`) ? route : 'signals');
}

function renderAll() {
  renderCurrentRoute();
}

function renderCurrentRoute() {
  if (state.route === 'signals') renderSignals();
  if (state.route === 'today') { renderCalendar(); renderHighlights(); }
  if (state.route === 'events') renderEventCatalog();
  if (state.route === 'places') renderPlaces();
  if (state.route === 'communities') renderCommunities();
  if (state.route === 'changes') renderChanges();
  if (state.route === 'research') renderResearch();
  updateChrome();
}

function updateChrome() {
  const favCount = Object.values(state.personal.favorites).filter(Boolean).length;
  const favoriteButton = document.getElementById('favoritesToggle');
  const highlightsRail = document.querySelector('.highlights-rail');
  const highlightsToggle = document.getElementById('toggleHighlights');
  favoriteButton.classList.toggle('active', state.favoritesOnly);
  favoriteButton.setAttribute('aria-pressed', String(state.favoritesOnly));
  favoriteButton.querySelector('span:first-child').textContent = state.favoritesOnly ? '\u2665' : '\u2661';
  favoriteButton.querySelector('.desktop-label').textContent = state.favoritesOnly ? 'Showing favorites' : 'Favorites';
  favoriteButton.title = state.favoritesOnly
    ? 'Showing only favorited places, events, and communities where this page supports it'
    : favCount ? `Show only ${favCount} favorited items` : 'No favorites yet';
  const favoritesCount = document.getElementById('favoritesCount');
  if (favoritesCount) {
    favoritesCount.textContent = favCount ? String(favCount) : '';
    favoritesCount.classList.toggle('hidden', !favCount || state.favoritesOnly);
  }
  const unreadCount = unreadChangesCount();
  const changeNavCount = document.getElementById('changeNavCount');
  changeNavCount.textContent = unreadCount ? String(unreadCount) : '';
  changeNavCount.hidden = unreadCount === 0;
  const backButton = document.getElementById('appBackButton');
  if (backButton) {
    const canGoBack = state.routeHistory.length > 0 || state.route !== 'signals';
    backButton.disabled = !canGoBack;
    backButton.title = canGoBack ? 'Back' : 'Already at the landing page';
  }
  document.getElementById('todayEyebrow').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  highlightsRail?.classList.toggle('collapsed', state.highlightsCollapsed);
  if (highlightsToggle) {
    highlightsToggle.setAttribute('aria-expanded', String(!state.highlightsCollapsed));
    highlightsToggle.title = state.highlightsCollapsed ? 'Open side panel' : 'Collapse side panel';
    highlightsToggle.textContent = state.highlightsCollapsed ? '←' : '→';
  }
  updateFreshnessMini();
}

function source(id) { return DATA.sources.find((item) => item.id === id); }
function store(id) { return DATA.stores.find((item) => item.id === id); }
function community(id) { return COMMUNITY_SEED.find((item) => item.id === id); }
function eventById(id) { return DATA.events.find((item) => item.id === id); }
function startOfDay(date) { const value = new Date(date); value.setHours(0, 0, 0, 0); return value; }
function endOfDay(date) { const value = new Date(date); value.setHours(23, 59, 59, 999); return value; }
function addDays(date, days) { const value = new Date(date); value.setDate(value.getDate() + days); return value; }
function dateKey(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function parseDate(value) { return new Date(`${value}T12:00:00`); }
function dayName(index) { return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]; }
function formatTime(value) {
  if (!value) return 'Time TBD';
  const [hours, minutes] = value.split(':').map(Number);
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], { hour: 'numeric', minute: minutes ? '2-digit' : undefined });
}
function formatFreshnessDate(value) {
  const text = String(value || '');
  const date = /^\d{4}-\d{2}-\d{2}$/.test(text) ? parseDate(text) : new Date(text);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatFreshnessDateTime(value) {
  const text = String(value || '');
  const hasTime = /T\d{2}:\d{2}/.test(text);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(text) ? parseDate(text) : new Date(text);
  if (Number.isNaN(date.getTime())) return value;
  const dateLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  if (!hasTime) return dateLabel;
  return `${dateLabel}, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}

function meaningfulEventDetails(event) {
  const text = String(event?.details || '').trim();
  if (!text || /^(?:tbd|n\/?a|none|unknown|null|-|--|\.)$/i.test(text)) {
    return 'The source confirms this listing, but does not provide a useful event description yet.';
  }
  return text;
}

function eventSourceDisplay(baseSource, event) {
  if (!baseSource) return null;
  const exactEventUrl = event?.sourceUrl && /locator\.wizards\.com\/event\//i.test(event.sourceUrl);
  const inherited = event?.sourceLinkScope === 'series' && event?.date;
  const typeLabel = exactEventUrl
    ? `${baseSource.type || 'source'} event`
    : inherited
      ? `${baseSource.type || 'source'} series evidence`
      : baseSource.type || 'source';
  const dateLabel = event?.lastVerified
    ? `observed ${formatFreshnessDate(event.lastVerified)}`
    : `checked ${baseSource.lastChecked || 'date unknown'}`;
  return {
    ...baseSource,
    url: event?.sourceUrl || baseSource.url,
    sourceContextLabel: typeLabel,
    sourceDateLabel: dateLabel
  };
}

function resolvedEventSourceContext(event, occurrenceDate) {
  if (!event) return { baseSource: null, eventRef: event };
  const targetDateKey = occurrenceDate ? dateKey(occurrenceDate) : '';
  const siblingEvents = DATA.events.filter((item) => item.seriesId === event.seriesId);
  const candidates = [event, ...siblingEvents.filter((item) => item.id !== event.id)];
  const ranked = candidates
    .map((item) => {
      const candidateDate = item.occurrenceDate || parseDate(item.date || item.startDate || null);
      const candidateSourceId = item.sourceId || (item.sourceIds || []).find((sourceId) => source(sourceId));
      return {
        item,
        baseSource: candidateSourceId ? source(candidateSourceId) : null,
        candidateSourceId,
        sameDate: targetDateKey && candidateDate ? dateKey(candidateDate) === targetDateKey : false,
        directScope: item.sourceLinkScope === 'occurrence',
        datedOccurrence: Boolean(item.date || item.occurrenceDate)
      };
    })
    .sort((a, b) =>
      Number(b.sameDate) - Number(a.sameDate)
      || Number(b.directScope) - Number(a.directScope)
      || Number(b.datedOccurrence) - Number(a.datedOccurrence)
    );
  const selected = ranked.find((entry) => entry.baseSource);
  if (!selected) return { baseSource: null, eventRef: event };
  return {
    baseSource: selected.baseSource,
    eventRef: {
      ...event,
      sourceId: selected.candidateSourceId,
      sourceUrl: selected.item.sourceUrl || event.sourceUrl || '',
      sourceLinkScope: selected.item.sourceLinkScope || event.sourceLinkScope || '',
      lastVerified: selected.item.lastVerified || event.lastVerified || ''
    }
  };
}

function updateFreshnessMini() {
  const container = document.getElementById('freshnessMini');
  if (!container) return;
  const latest = latestDataTimestamp();
  const sourceLabels = {
    supabase: 'Supabase live data',
    json: 'JSON fallback',
    loading: 'Supabase live data',
    'supabase-error': 'Supabase unavailable'
  };
  const sourceLabel = sourceLabels[state.dataSource] || 'Research data';
  const latestLabel = state.dataSource === 'loading'
    ? 'Loading...'
    : latest ? formatFreshnessDateTime(latest) : state.dataSource === 'supabase-error' ? 'Check connection' : 'No dated record';
  container.innerHTML = `<span class="status-dot"></span><span>${sourceLabel}<br><strong>${escapeHtml(latestLabel)}</strong></span>`;
}

function renderSignals() {
  const container = document.getElementById('signalsContent');
  const summaryContainer = document.getElementById('signalsSummary');
  if (!container) return;
  const signals = rankedSignals();
  const readSignals = signals.filter((signal) => isSignalRead(signal.id));
  const activeSignals = signals.filter((signal) => !['dismissed', 'stale'].includes(signal.status) && !isSignalRead(signal.id));
  const arrivalSignals = activeSignals.filter((signal) => !!signal.derivedFromChangeId);
  const coreActiveSignals = activeSignals.filter((signal) => !signal.derivedFromChangeId);
  const urgent = coreActiveSignals.filter(isActFirstSignal);
  const followUp = coreActiveSignals.filter((signal) => !urgent.includes(signal) && (signal.status === 'needs_followup' || ['source_health', 'community_activity'].includes(signal.category)));
  const watch = coreActiveSignals.filter((signal) => !urgent.includes(signal) && !followUp.includes(signal));
  const stale = signals.filter((signal) => ['dismissed', 'stale'].includes(signal.status) && !isSignalRead(signal.id));
  const hiddenSignals = readSignals.filter((signal) => !['dismissed', 'stale'].includes(signal.status));

  if (!signals.length) {
    if (summaryContainer) summaryContainer.innerHTML = '';
    container.innerHTML = emptyState('No signals yet', 'Signals will appear here when a real source, community route, fit caution, or opportunity deserves attention.');
    return;
  }

  const summaryParts = [];
  if (urgent.length) summaryParts.push(`${urgent.length} urgent`);
  if (arrivalSignals.length) {
    const arrivalVenues = new Set(
      arrivalSignals
        .map((signal) => changeById(signal.derivedFromChangeId))
        .filter(Boolean)
        .map((change) => change.entityId)
        .filter(Boolean)
    );
    summaryParts.push(`${arrivalSignals.length} new arrival${arrivalSignals.length === 1 ? '' : 's'} across ${arrivalVenues.size} venue${arrivalVenues.size === 1 ? '' : 's'}`);
  }
  if (activeSignals.length && !summaryParts.length) summaryParts.push(`${activeSignals.length} active`);
  if (readSignals.length) summaryParts.push(`${readSignals.length} read`);

  const orderedGroups = [
    urgent.length ? signalGroup('Act first', 'Actionable cancellations, deadlines, strong opportunities, or judgment calls that should shape near-term planning.', urgent, 'coral') : '',
    arrivalSignals.length ? signalGroup('New arrivals', 'Fresh automated event additions worth skimming so new options do not disappear into the Activity log.', arrivalSignals, 'sky') : '',
    followUp.length ? signalGroup('Follow up', 'Useful routes, source-health issues, or community surfaces that deserve a bounded next look.', followUp, 'amber') : '',
    watch.length ? signalGroup('Watch list', 'Real but lower-pressure signals to keep visible without turning this into an inbox.', watch, 'mint') : '',
    stale.length ? signalGroup('Closed or stale', 'Retained for context, but not currently asking for attention.', stale, 'slate') : '',
    state.showReadSignals && hiddenSignals.length ? signalGroup('Read / hidden', 'You marked these handled. Restore one if it should return to Signals.', hiddenSignals, 'slate') : '',
  ].filter(Boolean).join('');

  if (summaryContainer) {
    summaryContainer.innerHTML = `<div class="signal-toolbar">
      <p>${summaryParts.length ? summaryParts.join(' · ') : 'Signals stay compact here; handled items can be marked read and revisited later.'}</p>
      ${readSignals.length ? `<button class="soft-button" data-action="toggle-read-signals">${state.showReadSignals ? 'Hide read signals' : 'Show read signals'}</button>` : ''}
    </div>`;
  }

  container.innerHTML = `${discoveryPossibilitiesSection()}<div class="signals-board">
      ${orderedGroups}
    </div>`;
}

function rankedSignals() {
  return [...DATA.signals, ...derivedEventIngestSignals()]
    .sort((a, b) => signalRank(b) - signalRank(a) || String(b.observedAt || b.capturedAt).localeCompare(String(a.observedAt || a.capturedAt)));
}

function derivedEventIngestSignals() {
  const recentCutoff = addDays(startOfDay(new Date()), -14);
  return acceptedChanges()
    .filter((change) => change.changeType === 'event_ingest_delta')
    .filter((change) => {
      const detected = new Date(change.detectedAt || '');
      return !Number.isNaN(detected.getTime()) && detected >= recentCutoff;
    })
    .map(eventIngestDigestSignal)
    .filter(Boolean);
}

function eventIngestDigestSignal(change) {
  const events = eventIngestDeltaMatches(change).filter((event) => !isEventHidden(event));
  if (!events.length) return null;
  const owner = eventIngestDisplayOwner(change, events);
  const place = owner.place || events.map((event) => store(event.storeId)).find(Boolean) || null;
  const relatedName = owner.name;
  const eventCount = events.length;
  const specialCount = events.filter(isSpecial).length;
  const commanderCount = events.filter(isCommanderLike).length;
  const favorited = !!(owner.community && state.personal.favorites[`community:${owner.community.id}`])
    || !!(place && state.personal.favorites[`place:${place.id}`])
    || events.some((event) => state.personal.favorites[eventPreferenceKey(event)]);
  const nearby = numericDistance(place) != null && numericDistance(place) <= 10;
  const priority = favorited || (nearby && specialCount) || eventCount >= 8 ? 'high' : 'normal';
  const firstDate = events
    .map((event) => event.occurrenceDate || parseDate(event.date || event.startDate))
    .filter((date) => date instanceof Date && !Number.isNaN(date.getTime()))
    .sort((a, b) => a - b)[0];
  const category = 'event_opportunity';
  const dateCopy = firstDate ? ` Earliest listed date: ${firstDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}.` : '';
  const sourceKinds = [...new Set(events.map((event) => event.sourceIds?.map(source).find(Boolean)?.type || 'source').filter(Boolean))];
  const sourceCopy = sourceKinds.length ? ` Source: ${sourceKinds.slice(0, 2).join(' + ')}.` : '';
  const emphasis = [
    specialCount ? `${specialCount} special/prerelease/limited` : '',
    commanderCount ? `${commanderCount} Commander-related` : '',
    favorited ? 'favorite-linked' : '',
    nearby ? 'nearby' : ''
  ].filter(Boolean).join(' · ');
  return {
    id: `derived:${change.id}`,
    derivedFromChangeId: change.id,
    category,
    priority,
    status: 'new',
    sourceId: '',
    capturedAt: change.detectedAt || '',
    observedAt: change.detectedAt || '',
    relatedEntityType: owner.type,
    relatedEntityId: owner.id,
    summary: `${relatedName} added ${eventCount} new event${eventCount === 1 ? '' : 's'}.`,
    details: `${emphasis ? `${emphasis}. ` : ''}${change.details || 'The daily surveyor promoted newly listed events.'}${dateCopy}${sourceCopy}`,
    confidence: eventCount ? 'high' : 'medium',
    suggestedAction: eventCount === 1 ? 'Open the new event and decide whether it matters for planning.' : 'Open the batch drawer and skim the newly added events.',
    promotionTarget: eventCount === 1 ? 'event' : 'event_digest',
    dedupeKey: `derived-event-ingest:${change.id}`
  };
}

function isActFirstSignal(signal) {
  if (!['urgent', 'high'].includes(signal.priority)) return false;
  if (signal.category === 'venue_fit' && !['needs_followup', 'needs_judgment'].includes(signal.status)) return false;
  return true;
}

function signalRank(signal) {
  const priority = { urgent: 100, high: 85, normal: 55, low: 25 }[signal.priority] || 40;
  const category = {
    operational: 28,
    mention: 27,
    event_opportunity: 26,
    registration: 24,
    source_health: 20,
    community_activity: 18,
    venue_fit: 16,
    needs_judgment: 14,
    product_trust: 12
  }[signal.category] || 10;
  const status = { new: 12, needs_followup: 10, reviewed: 3, promoted: 2, dismissed: -30, stale: -35 }[signal.status] || 0;
  return priority + category + status;
}

function signalGroup(title, copy, signals, tone) {
  return `<section class="signal-group ${tone}">
    <div class="section-title-row">
      <div><p class="eyebrow ${tone === 'coral' ? 'coral' : tone === 'amber' ? 'amber' : tone === 'mint' ? 'mint' : ''}">${signals.length} signal${signals.length === 1 ? '' : 's'}</p><h2>${escapeHtml(title)}</h2></div>
    </div>
    <p class="signal-group-copy">${escapeHtml(copy)}</p>
    <div class="signal-stack">${signals.length ? signals.map(signalCard).join('') : '<p class="muted-copy">Nothing here right now.</p>'}</div>
  </section>`;
}

function signalCard(signal) {
  const related = signalRelatedTarget(signal);
  const relatedEvent = signalRelatedEvent(signal);
  const artifacts = artifactsForSignal(signal);
  const sourceItem = primarySourceForSignal(signal);
  const sourceUrl = signal.evidenceUrl || sourceItem?.url || '';
  const sourceLabel = sourceItem?.label || (sourceUrl ? 'Source link' : 'Source not linked');
  const isExternal = /^https?:\/\//i.test(sourceUrl);
  const read = isSignalRead(signal.id);
  const tone = signalTone(signal);
  return `<article class="signal-card ${tone}">
    <div class="signal-card-main">
      <div class="signal-card-kicker">
        <span class="status-chip ${tone}">${escapeHtml(signalCategoryLabel(signal.category))}</span>
        <span class="status-chip slate">${escapeHtml(signalPriorityLabel(signal.priority))}</span>
        <span class="status-chip ${signal.status === 'needs_followup' ? 'amber' : signal.status === 'new' ? 'mint' : 'slate'}">${escapeHtml(signal.status.replaceAll('_', ' '))}</span>
        ${artifacts.length ? `<span class="status-chip violet">${imageEvidenceIcon()} evidence</span>` : ''}
      </div>
      <h3>${escapeHtml(signal.summary)}</h3>
      ${related ? `<div class="signal-related">${related}</div>` : ''}
      <p>${escapeHtml(signal.details || 'No additional detail recorded yet.')}</p>
      <div class="signal-meta">
        <span>Confidence: <strong>${escapeHtml(signal.confidence || 'unknown')}</strong></span>
        <span>Captured: <strong>${escapeHtml(formatFreshnessDateTime(signal.capturedAt))}</strong></span>
      </div>
    </div>
    <aside class="signal-action">
      <span>Suggested action</span>
      <strong>${escapeHtml(signal.suggestedAction || 'Review when this area comes up again.')}</strong>
      ${sourceUrl ? `<a href="${escapeHtml(sourceUrl)}" ${isExternal ? 'target="_blank" rel="noreferrer"' : ''}>${escapeHtml(sourceLabel)} ↗</a>` : `<small>${escapeHtml(sourceLabel)}</small>`}
      ${relatedEvent ? `<button class="soft-button signal-read-button" data-event-id="${escapeHtml(relatedEvent.id)}">Open event</button>` : signal.derivedFromChangeId ? `<button class="soft-button signal-read-button" data-action="open-change-events" data-change-id="${escapeHtml(signal.derivedFromChangeId)}">${eventIngestDeltaMatches(changeById(signal.derivedFromChangeId)).filter((event) => !isEventHidden(event)).length === 1 ? 'Open new event' : 'Open new events'}</button>` : ''}
      <button class="soft-button signal-read-button" data-action="open-signal" data-signal-id="${escapeHtml(signal.id)}">Open details</button>
      <button class="soft-button signal-read-button" data-action="${read ? 'restore-signal' : 'mark-signal-read'}" data-signal-id="${escapeHtml(signal.id)}">${read ? 'Restore to Signals' : 'Mark read'}</button>
    </aside>
  </article>`;
}

function isSignalRead(signalId) {
  return !!state.personal.signalRead?.[signalId];
}

function discoveryPossibilityKey(id) {
  return `discovery:${id}`;
}

function activeDiscoveryPossibilities() {
  return DISCOVERY_POSSIBILITIES.filter((item) => !state.personal.hidden?.[discoveryPossibilityKey(item.id)]);
}

function discoverySearchUrl(item) {
  return `https://www.google.com/search?q=${encodeURIComponent(item.query || item.name)}`;
}

function setDiscoveryPossibilityHidden(id, hidden) {
  const item = DISCOVERY_POSSIBILITIES.find((possibility) => possibility.id === id);
  if (!item) return;
  const key = discoveryPossibilityKey(id);
  if (hidden) {
    state.personal.hidden[key] = new Date().toISOString();
  } else {
    delete state.personal.hidden[key];
  }
  savePersonal({ type: 'discovery', label: `${hidden ? 'Dismissed' : 'Restored'} discovery possibility: ${item.name}` });
  renderSignals();
  toast(hidden ? 'Possibility tucked away' : 'Possibility restored');
}

function restoreDiscoveryPossibilities() {
  DISCOVERY_POSSIBILITIES.forEach((item) => delete state.personal.hidden[discoveryPossibilityKey(item.id)]);
  savePersonal({ type: 'discovery', label: 'Restored discovery possibilities' });
  renderSignals();
  toast('Discovery possibilities restored');
}

function discoveryPossibilitiesSection() {
  const active = activeDiscoveryPossibilities();
  const hiddenCount = DISCOVERY_POSSIBILITIES.length - active.length;
  if (!active.length && !hiddenCount) return '';
  if (!active.length) {
    return `<section class="discovery-possibilities compact">
      <div>
        <p class="eyebrow">Possibilities</p>
        <h2>Discovery leads are tucked away</h2>
        <p>Nothing questionable is currently asking for attention.</p>
      </div>
      <button class="soft-button" data-action="restore-discovery-possibilities">Restore leads</button>
    </section>`;
  }
  return `<section class="discovery-possibilities">
    <div class="discovery-possibilities-head">
      <div>
        <p class="eyebrow">Possibly worth checking</p>
        <h2>${active.length} fuzzy community lead${active.length === 1 ? '' : 's'}</h2>
        <p>Not canonical yet. These are lightweight breadcrumbs for a later full pass, not urgent Signals.</p>
      </div>
      ${hiddenCount ? `<button class="soft-button" data-action="restore-discovery-possibilities">Restore ${hiddenCount} hidden</button>` : ''}
    </div>
    <div class="discovery-possibility-grid">
      ${active.map((item) => `<article class="discovery-possibility-card">
        <div>
          <span class="status-chip violet">${escapeHtml(item.area)}</span>
          <h3>${escapeHtml(item.name)}</h3>
          <p>${escapeHtml(item.why)}</p>
          <small>${escapeHtml(item.next)}</small>
        </div>
        <div class="discovery-possibility-actions">
          <a class="soft-button" href="${escapeHtml(discoverySearchUrl(item))}" target="_blank" rel="noreferrer">Search ↗</a>
          <button class="soft-button" data-action="dismiss-discovery-possibility" data-possibility-id="${escapeHtml(item.id)}">Hide</button>
        </div>
      </article>`).join('')}
    </div>
  </section>`;
}

function signalRelatedTarget(signal) {
  if (signal.relatedEntityType === 'venue') {
    const place = store(signal.relatedEntityId);
    if (place) return `<button class="change-inline-target" data-place-id="${escapeHtml(place.id)}">${escapeHtml(place.name)}</button>`;
  }
  if (signal.relatedEntityType === 'community') {
    const community = COMMUNITY_SEED.find((item) => item.id === signal.relatedEntityId);
    if (community) return `<button class="change-inline-target" data-community-id="${escapeHtml(community.id)}">${escapeHtml(community.name)}</button>`;
  }
  if (signal.relatedEntityType === 'event_series' || signal.relatedEntityType === 'event_occurrence') {
    const event = eventById(signal.relatedEntityId) || DATA.events.find((item) => item.seriesId === signal.relatedEntityId);
    if (event) return `<button class="change-inline-target" data-event-id="${escapeHtml(event.id)}">${escapeHtml(event.title)}</button>`;
  }
  return signal.relatedEntityId ? `<span class="meta-chip">${escapeHtml(signal.relatedEntityType || 'related')}: ${escapeHtml(signal.relatedEntityId)}</span>` : '';
}

function signalRelatedEvent(signal) {
  if (!['event_series', 'event_occurrence'].includes(signal.relatedEntityType)) return null;
  return eventById(signal.relatedEntityId) || DATA.events.find((item) => item.seriesId === signal.relatedEntityId) || null;
}

function openSignalDetail(signalId) {
  const signal = rankedSignals().find((item) => item.id === signalId);
  if (!signal) return;
  const related = signalRelatedTarget(signal);
  const artifacts = artifactsForSignal(signal);
  const retainedEvidence = artifacts.length
    ? `<section class="drawer-section"><p class="eyebrow">Source evidence</p><h2>Verify the finding</h2>${artifactEvidenceList(artifacts)}</section>`
    : '';
  const sourceItem = primarySourceForSignal(signal);
  const sourceUrl = signal.evidenceUrl || sourceItem?.url || '';
  const sourceLink = sourceUrl
    ? `<a class="soft-button" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(sourceItem?.label || 'Open source')} ↗</a>`
    : '<p class="muted-copy">No source URL is linked yet.</p>';
  const relatedEvent = signalRelatedEvent(signal);
  const derivedEventAction = relatedEvent
    ? `<button class="soft-button" data-event-id="${escapeHtml(relatedEvent.id)}">Open event →</button>`
    : signal.derivedFromChangeId
      ? `<button class="soft-button" data-action="open-change-events" data-change-id="${escapeHtml(signal.derivedFromChangeId)}">Open newly added events →</button>`
      : '';
  const read = isSignalRead(signal.id);
  openDrawer(`<div class="drawer-kicker"><span class="status-chip ${signalTone(signal)}">${escapeHtml(signalCategoryLabel(signal.category))}</span><span class="status-chip slate">${escapeHtml(signalPriorityLabel(signal.priority))}</span><span class="status-chip ${signal.status === 'needs_followup' ? 'amber' : signal.status === 'new' ? 'mint' : 'slate'}">${escapeHtml(signal.status.replaceAll('_', ' '))}</span></div>
    <h1 id="drawerTitle">${escapeHtml(signal.summary)}</h1>
    <p class="drawer-lead">${escapeHtml(signal.details || 'No additional detail recorded yet.')}</p>
    ${retainedEvidence}
    ${related ? `<section class="drawer-section"><p class="eyebrow">Related target</p><h2>Open the linked record</h2><div class="signal-related">${related}</div></section>` : ''}
    <section class="drawer-section"><p class="eyebrow">Suggested action</p><h2>${escapeHtml(signal.suggestedAction || 'Review when this area comes up again.')}</h2><p>Signals are lightweight attention markers. Use this drawer to jump to the source, linked record, or newly added event batch without turning Signals into a static inbox.</p><div class="drawer-action-grid">${derivedEventAction}${sourceLink}<button class="soft-button" data-action="${read ? 'restore-signal' : 'mark-signal-read'}" data-signal-id="${escapeHtml(signal.id)}">${read ? 'Restore to Signals' : 'Mark read'}</button></div></section>
    <section class="drawer-section"><p class="eyebrow">Signal metadata</p><div class="before-grid"><div><span>Confidence</span><strong>${escapeHtml(signal.confidence || 'unknown')}</strong></div><div><span>Captured</span><strong>${escapeHtml(formatFreshnessDateTime(signal.capturedAt))}</strong></div><div><span>Observed</span><strong>${escapeHtml(formatFreshnessDateTime(signal.observedAt || signal.capturedAt))}</strong></div><div><span>Promotion target</span><strong>${escapeHtml(signal.promotionTarget || 'none')}</strong></div></div></section>`);
}

function primarySourceForSignal(signal) {
  const explicit = source(signal.sourceId);
  if (explicit) return explicit;
  if (!signal.derivedFromChangeId) return null;
  const events = eventIngestDeltaMatches(changeById(signal.derivedFromChangeId)).filter((event) => !isEventHidden(event));
  for (const event of events) {
    const linked = (event.sourceIds || []).map(source).find((item) => item?.url);
    if (linked) return linked;
  }
  return null;
}

function signalTone(signal) {
  if (signal.derivedFromChangeId) return 'violet';
  if (signal.priority === 'urgent' || signal.priority === 'high') return 'coral';
  if (signal.category === 'source_health' || signal.status === 'needs_followup') return 'amber';
  if (signal.category === 'community_activity') return 'sky';
  if (signal.category === 'venue_fit') return 'mint';
  return 'slate';
}

function signalCategoryLabel(category = '') {
  const labels = {
    operational: 'Operational',
    mention: 'You were mentioned',
    event_opportunity: 'Opportunity',
    registration: 'Registration',
    source_health: 'Source health',
    community_activity: 'Community route',
    venue_fit: 'Fit caution',
    needs_judgment: 'Needs judgment',
    product_trust: 'Product trust'
  };
  return labels[category] || category.replaceAll('_', ' ') || 'Signal';
}

function signalPriorityLabel(priority = '') {
  if (priority === 'urgent') return 'urgent';
  if (priority === 'high') return 'high priority';
  if (priority === 'low') return 'low priority';
  return 'normal priority';
}

function eventStartTime(event) { return event.recurrence?.startTime || event.startTime; }
function escapeHtml(value = '') { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]); }
function truncate(value = '', length = 150) { return value.length > length ? `${value.slice(0, length).trim()}...` : value; }
function freshnessDays(value) { return Math.max(0, Math.floor((startOfDay(new Date()) - parseDate(value)) / 86400000)); }
function numericDistance(place) {
  const raw = place?.distanceMiles;
  if (raw == null || raw === '') return null;
  return Number.isFinite(Number(raw)) ? Number(raw) : null;
}
function distanceLabel(place, long = false) {
  const distance = numericDistance(place);
  if (distance == null) return long ? 'distance not yet calculated' : 'distance unknown';
  return `${distance.toFixed(1)} ${long ? 'miles' : 'mi'}`;
}
function fitScoreFor(place) {
  if (Number.isFinite(place.evaluation?.fitScore)) return Number(place.evaluation.fitScore);
  const values = Object.values(place.assessment || {}).filter((value) => Number.isFinite(value));
  if (!values.length) return 3;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}
function fitGradeFor(score) {
  if (score >= 4.5) return 'A';
  if (score >= 4.2) return 'A-';
  if (score >= 3.9) return 'B+';
  if (score >= 3.6) return 'B';
  if (score >= 3.3) return 'B-';
  if (score >= 3.0) return 'C+';
  if (score >= 2.7) return 'C';
  if (score >= 2.4) return 'C-';
  if (score >= 2.1) return 'D';
  return 'F';
}
function confidenceFor(place) {
  if (place.evaluation?.confidence) return place.evaluation.confidence;
  const sourceCount = (place.sourceIds || []).length;
  if (place.researchStatus === 'partial') return sourceCount >= 4 ? 'medium' : 'medium';
  return sourceCount >= 3 ? 'medium' : 'low';
}
function candidateStatusFor(place) {
  if (place.evaluation?.candidateStatus) return place.evaluation.candidateStatus;
  if (place.researchStatus === 'partial' && fitScoreFor(place) >= 3.8) return 'promoted';
  return place.researchStatus === 'partial' ? 'working' : 'discovery';
}
function isPlaceLowFit(place) {
  const evaluation = normalizedEvaluation(place);
  if (evaluation.candidateStatus === 'deprioritized') return true;
  if (state.personal.hidden[`place:${place.id}`]) return true;
  return evaluation.fitScore < 2.7 || ['D+', 'D', 'F'].includes(evaluation.fitGrade);
}
function normalizedEvaluation(place) {
  const explicit = place.evaluation || {};
  const fitScore = fitScoreFor(place);
  const positives = explicit.positives ? [...explicit.positives] : [];
  const cautions = explicit.cautions ? [...explicit.cautions] : [];
  const openQuestions = explicit.openQuestions ? [...explicit.openQuestions] : [];
  if (!place.evaluation) {
    if ((place.assessment?.commanderActivity || 0) >= 4) positives.push('Magic opportunity looks meaningfully active for your interests.');
    if ((place.assessment?.communityContinuity || 0) >= 4) positives.push('Signals suggest better repeat-visit potential than a one-off curiosity stop.');
    if ((place.assessment?.newPlayerIntegration || 0) >= 4 || (place.assessment?.meetupAccessibility || 0) >= 4) positives.push('There are above-baseline signs that solo arrival or joining games could be workable.');
    if ((place.sourceIds || []).length >= 4) positives.push('The connected evidence is strong enough to support a real planning judgment now.');
    if ((place.assessment?.meetupAccessibility || 0) <= 2) cautions.push('Pod formation and solo-arrival mechanics are still not strongly described.');
    if ((place.assessment?.scheduleReliability || 0) <= 2) cautions.push('Schedule reliability still needs stronger corroboration before relying on it repeatedly.');
    if ((numericDistance(place) ?? 0) > 15) cautions.push('Distance raises the bar for this place to earn repeat-visit priority.');
    if (!openQuestions.length) openQuestions.push('Treat unstated proxy policy, bracket language, and pod logistics as unknown unless a source says otherwise.');
  }
  return {
    fitScore,
    fitGrade: explicit.fitGrade || fitGradeFor(fitScore),
    confidence: explicit.confidence || confidenceFor(place),
    candidateStatus: explicit.candidateStatus || candidateStatusFor(place),
    positives,
    cautions,
    openQuestions
  };
}
function mapsUrl(place) { return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.address)}`; }
function isCompetitive(event) {
  if (/cedh|competitive|optimized|rcq|championship/i.test(`${event.eventType} ${event.title}`)) return true;
  const details = String(event.details || '');
  if (/(separate from|rather than|not|outside of)[^.]{0,80}cedh/i.test(details)) return false;
  return /cedh|competitive|optimized|rcq|championship/i.test(details);
}
function isCommanderLike(event) {
  return /commander|edh/i.test(`${event.title || ''} ${event.format || ''} ${event.eventType || ''}`);
}
function isHighPowerCommander(event) {
  if (!isCommanderLike(event)) return false;
  const bracket = String(event.bracket || '').toLowerCase();
  if (/^(4|5|4\/5|high[-\s]?power|high[-\s]?powered)$/.test(bracket)) return true;
  const details = String(event.details || '');
  if (/(separate from|rather than|not|outside of)[^.]{0,100}(bracket\s*(4|5|4\/5)|high[-\s]?power|optimized|cedh)/i.test(details)) return false;
  return /bracket\s*(4|5|4\/5)|4\/5\s*(encouraged|recommended)|high[-\s]?powered|high[-\s]?power|no[-\s]?holds[-\s]?barred/i.test(details);
}
function isPrereleaseOrSealed(event) { return /prerelease|sealed|limited/i.test(`${event.eventType} ${event.title} ${event.format}`); }
function isSpecial(event) { return /prerelease|sealed|draft|limited|party|special/i.test(`${event.eventType} ${event.title} ${event.format}`); }
function isWeekend(date) { return [5, 6, 0].includes(date.getDay()); }

function eventHostLabel(event, place = store(event?.storeId)) {
  if (place?.name) return place.name;
  const location = String(event?.physicalLocation || '').trim();
  const communityLocation = event?.communityId
    ? String(event?.details || '').match(/\b(?:at|@)\s+([A-Z][^.;\n]{2,60})(?=[.;\n]|$)/)?.[1]?.trim()
    : '';
  const resolvedLocation = location || communityLocation;
  if (!resolvedLocation) return 'Location provided in source';
  const firstLine = resolvedLocation.split(/\r?\n/)[0].trim();
  const firstSegment = firstLine.split(',')[0].trim();
  return /^\d+\s/.test(firstSegment) ? 'Location provided in source' : firstSegment;
}

function eventMatchesSharedFilters(event, options = {}) {
  const { includePreset = true, includeSearch = true, hideCompetitive = state.filters.hideCompetitive } = options;
  const place = store(event.storeId);
  const organizer = community(event.communityId);
  const hostLabel = eventHostLabel(event, place);
  if (!place && !organizer) return false;
  if (place && isPlaceHidden(place.id)) return false;
  if (place?.lifecycleState === 'identity_blocked' && !(event.sourceIds || []).length) return false;
  if (place && !state.filters.research.includes(place.researchStatus)) return false;
  if (!state.filters.confidence.includes(event.confidence)) return false;
  if (state.filters.planningGroups && !state.filters.planningGroups.includes(eventPlanningGroup(event))) return false;
  if (place && numericDistance(place) != null && numericDistance(place) > state.filters.distance) return false;
  if (state.filters.onlyFree && Number(event.entryFee || 0) !== 0) return false;
  if (hideCompetitive && (isCompetitive(event) || isHighPowerCommander(event))) return false;
  if (state.favoritesOnly && !state.personal.favorites[eventPreferenceKey(event)] && !state.personal.favorites[`place:${place?.id}`] && !state.personal.favorites[`community:${organizer?.id}`]) return false;
  if (includeSearch && state.search) {
    const haystack = [
      event.title,
      event.details,
      event.format,
      event.eventType,
      event.bracket,
      fitLabel(event).label,
      evidenceLabel(event).label,
      event.confidence,
      event.occurrenceStatus,
      place?.name,
      place?.city,
      place?.address,
      place?.researchStatus,
      place?.assessmentNotes,
      organizer?.name,
      organizer?.region,
      event.physicalLocation,
      ...(place?.tags || []),
      ...(place?.communitySignals || [])
    ].filter(Boolean).join(' ').toLowerCase();
    if (!haystack.includes(state.search)) return false;
  }
  if (includePreset) {
    if (!eventMatchesPreset(event, state.preset)) return false;
  }
  return true;
}

function eventMatchesPreset(event, preset) {
  if (preset === 'best') return fitScore(event) >= 68;
  if (preset === 'commander') return /commander|edh/i.test(`${event.title} ${event.format} ${event.eventType}`);
  if (preset === 'weekend') return isWeekend(event.occurrenceDate);
  if (preset === 'specials') return /prerelease|sealed|limited/i.test(`${event.title} ${event.format} ${event.eventType}`);
  if (preset === 'draft') return /draft/i.test(`${event.title} ${event.format} ${event.eventType}`);
  if (preset === 'favorites') return !!state.personal.favorites[eventPreferenceKey(event)] || !!state.personal.favorites[`place:${event.storeId}`] || !!state.personal.favorites[`community:${event.communityId}`];
  return true;
}

function rangeForView() {
  if (state.view === 'agenda') return { start: startOfDay(state.date), end: endOfDay(addDays(state.date, state.agendaDays)) };
  if (state.view === 'week') {
    const start = fridayWeekStart(state.date);
    return { start, end: endOfDay(addDays(start, 6)) };
  }
  const start = rollingMonthStart(state.date);
  return { start, end: endOfDay(addDays(start, 34)) };
}

function rollingMonthStart(date) {
  return startOfDay(addDays(date, -date.getDay()));
}

function fridayWeekStart(date) {
  const day = date.getDay();
  const offset = (day - 5 + 7) % 7;
  return startOfDay(addDays(date, -offset));
}

function buildOccurrences(start, end, applyFilters = true) {
  const items = [];
  for (const event of DATA.events) {
    if (event.status !== 'active') continue;
    if (event.recurrence?.frequency === 'weekly') {
      const dayOfWeek = validWeeklyDayOfWeek(event);
      if (dayOfWeek == null) continue;
      const firstOffset = (dayOfWeek - start.getDay() + 7) % 7;
      let cursor = addDays(startOfDay(start), firstOffset);
      const earliest = event.startDate ? startOfDay(parseDate(event.startDate)) : startOfDay(start);
      const latest = event.endDate ? endOfDay(parseDate(event.endDate)) : null;
      while (cursor <= end) {
        if (cursor >= earliest && (!latest || cursor <= latest)) items.push({ ...event, occurrenceDate: new Date(cursor), occurrenceStatus: 'projected' });
        cursor = addDays(cursor, 7);
      }
    } else if (event.date || event.startDate) {
      if (event.occurrenceStatus === 'cancelled') continue;
      const date = parseDate(event.date || event.startDate);
      if (date >= start && date <= end) items.push({ ...event, occurrenceDate: date, occurrenceStatus: event.occurrenceStatus || 'confirmed' });
    }
  }
  const confirmedSeriesDates = new Set(items
    .filter((item) => item.occurrenceStatus === 'confirmed' && item.seriesId)
    .map((item) => `${item.seriesId}:${dateKey(item.occurrenceDate)}`));
  const withoutSupersededProjections = items.filter((item) =>
    item.occurrenceStatus !== 'projected'
    || !item.seriesId
    || !confirmedSeriesDates.has(`${item.seriesId}:${dateKey(item.occurrenceDate)}`)
  );
  const filtered = applyFilters ? withoutSupersededProjections.filter(matchesFilters) : withoutSupersededProjections;
  return filtered.sort((a, b) => a.occurrenceDate - b.occurrenceDate || compareText(eventStartTime(a), eventStartTime(b)));
}

function matchesFilters(event) {
  return eventMatchesSharedFilters(event);
}

function fitScore(event) {
  const place = store(event.storeId);
  if (isDatedCommunityEvent(event)) return 82;
  if (!place) return event.communityId ? 70 : 0;
  const assessment = place.assessment || {};
  let score = 35;
  score += (assessment.communityContinuity || 3) * 5;
  score += (assessment.meetupAccessibility || 3) * 4;
  score += (assessment.scheduleReliability || 3) * 3;
  score += (assessment.homeGroupPotential || 3) * 3;
  score -= Math.min(numericDistance(place) ?? 28, 35) * 0.8;
  if (event.bracket === '3' || /bracket 3|casual|open play/i.test(`${event.bracket} ${event.title} ${event.details}`)) score += 9;
  if (event.bracket === '2') score += 5;
  if (isCompetitive(event)) score -= 30;
  if (isHighPowerCommander(event)) score -= 28;
  if (hasExplicitNoProxy(event)) score -= 24;
  if (isPrereleaseOrSealed(event)) score += 14;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function fitLabel(event) {
  const place = store(event.storeId);
  if (place?.lifecycleState === 'identity_blocked') return { label: 'Identity unresolved · check first', tone: 'amber' };
  if (isDatedCommunityEvent(event)) return { label: 'Community event', tone: 'mint' };
  const score = fitScore(event);
  if (hasExplicitNoProxy(event)) return { label: 'Poor fit · no proxy', tone: 'coral' };
  if (isCompetitive(event)) return { label: 'Competitive lane', tone: 'coral' };
  if (isHighPowerCommander(event)) return { label: 'Poor fit · high power', tone: 'coral' };
  if (score >= 78) return { label: 'Strong fit', tone: 'mint' };
  if (score >= 64) return { label: 'Promising', tone: 'sky' };
  return { label: 'Worth a look', tone: 'slate' };
}

function evidenceLabel(event) {
  const place = store(event.storeId);
  if (place?.lifecycleState === 'identity_blocked') return { label: 'Source-attributed · check first', tone: 'amber' };
  if (event.occurrenceStatus === 'confirmed') return { label: 'Dated listing', tone: 'mint' };
  if (event.confidence === 'high' && place?.researchStatus === 'partial') return { label: 'Supported routine', tone: 'sky' };
  if (place?.researchStatus === 'wizards-discovery') return { label: 'Discovery-level', tone: 'amber' };
  return { label: 'Expected routine', tone: 'amber' };
}

function isDatedCommunityEvent(event) {
  if (!event?.communityId) return false;
  const isConfirmed = event.occurrenceStatus === 'confirmed' || !!event.date || !!event.startDate;
  const hasUsableConfidence = event.confidence === 'high' || event.confidence === 'medium';
  return isConfirmed && !!eventStartTime(event) && hasUsableConfidence;
}

function renderCalendar() {
  const { start, end } = rangeForView();
  const events = buildOccurrences(start, end);
  const label = state.view === 'month'
    ? `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
    : state.view === 'week'
      ? `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
      : 'From today onward';
  document.getElementById('dateLabel').textContent = label;
  if (state.view === 'agenda') renderAgenda(events, start);
  if (state.view === 'week') renderWeek(events, start);
  if (state.view === 'month') renderMonth(events);
  document.getElementById('activeFilterCount').textContent = activeFilterCount();
  document.getElementById('activeFilterCount').classList.toggle('hidden', activeFilterCount() === 0);
}

function renderAgenda(events, start) {
  const container = document.getElementById('calendarContent');
  if (!events.length) return container.innerHTML = emptyState('No events match this view', 'Try widening the distance, research status, or confidence filters.');
  const groups = Object.groupBy ? Object.groupBy(events, (event) => dateKey(event.occurrenceDate)) : events.reduce((acc, event) => ((acc[dateKey(event.occurrenceDate)] ||= []).push(event), acc), {});
  const todayEvents = events.filter((event) => dateKey(event.occurrenceDate) === dateKey(new Date()));
  const spotlightEvents = todayEvents.length ? todayEvents : events;
  const bestBets = rankedTodayLeads(spotlightEvents).slice(0, 5);
  const bestIds = new Set(bestBets.map(todayLeadKey));
  const spotlightTitle = todayEvents.length ? "Today's strongest leads" : 'Next strong leads';
  const spotlightNote = todayEvents.length ? `${todayEvents.length} today` : 'Nothing matching today';
  let html = `<div class="agenda-intro"><div><span class="live-dot"></span><strong>${events.length} opportunities</strong> in this window</div><span>Scroll toward future dates</span></div>`;
  if (bestBets.length) {
    html += `<section class="today-best-bets" aria-label="Best near-term bets">
      <div class="today-section-heading"><div><p class="eyebrow mint">Best bets</p><h2>${spotlightTitle}</h2></div><span>${spotlightNote}</span></div>
      <div class="best-bet-grid">${bestBets.map((event) => eventCard(event, false, { showDate: true, emphasize: true })).join('')}</div>
    </section>
    <div class="today-section-heading full-catalog-heading"><div><p class="eyebrow">Full catalog</p><h2>Everything still visible</h2></div><span>${events.length} matching</span></div>`;
  }
  for (let date = new Date(start); date <= rangeForView().end; date = addDays(date, 1)) {
    const dayEvents = groups[dateKey(date)] || [];
    if (!dayEvents.length) continue;
    const weekend = isWeekend(date);
    html += `<section class="agenda-day ${weekend ? 'weekend-day' : ''}" id="day-${dateKey(date)}">
      <div class="day-marker"><span class="day-name">${date.toLocaleDateString(undefined, { weekday: 'short' })}</span><strong>${date.getDate()}</strong><span>${date.toLocaleDateString(undefined, { month: 'short' })}</span></div>
      <div class="day-content"><div class="day-heading"><h2>${date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h2>${weekend ? '<span class="weekend-label">Weekend focus</span>' : ''}</div>
      <div class="event-stack">${dayEvents.map((event) => eventCard(event, false, { emphasize: bestIds.has(todayLeadKey(event)) })).join('')}</div></div>
    </section>`;
  }
  html += `<button class="load-more" data-action="load-more"><span>&darr;</span><strong>Show four more weeks</strong><small>Continue the timeline</small></button>`;
  container.innerHTML = html;
}

function rankedTodayLeads(events) {
  return [...events]
    .filter((event) => !isCompetitive(event) && eventPlanningGroup(event) !== 'hidden')
    .sort((a, b) => todayLeadScore(b) - todayLeadScore(a) || a.occurrenceDate - b.occurrenceDate || compareText(eventStartTime(a), eventStartTime(b)));
}

function todayLeadScore(event) {
  const place = store(event.storeId);
  const daysAway = Math.max(0, Math.round((startOfDay(event.occurrenceDate) - startOfDay(new Date())) / 86400000));
  const favoriteBonus = state.personal.favorites[eventPreferenceKey(event)] || state.personal.favorites[`place:${event.storeId}`] ? 18 : 0;
  const weekendBonus = isWeekend(event.occurrenceDate) ? 10 : 0;
  const reviewedBonus = place?.researchStatus === 'partial' ? 8 : 0;
  const confidenceBonus = event.confidence === 'high' ? 8 : event.confidence === 'medium' ? 3 : 0;
  const specialBonus = isPrereleaseOrSealed(event) ? 24 : isSpecial(event) ? 8 : 0;
  const commanderBonus = /commander|edh/i.test(`${event.title} ${event.format} ${event.eventType}`) ? 8 : 0;
  const draftBonus = /draft/i.test(`${event.title} ${event.format} ${event.eventType}`) ? 4 : 0;
  const discoveryPenalty = place?.researchStatus === 'wizards-discovery' ? 10 : 0;
  return fitScore(event) + favoriteBonus + weekendBonus + reviewedBonus + confidenceBonus + specialBonus + commanderBonus + draftBonus - discoveryPenalty - Math.min(daysAway, 21);
}

function todayLeadKey(event) {
  return `${event.id}:${dateKey(event.occurrenceDate)}`;
}

function heartIcon() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6c-1.7-1.8-4.6-1.8-6.3 0L12 7.1 9.5 4.6c-1.7-1.8-4.6-1.8-6.3 0-1.8 1.9-1.8 4.9 0 6.8L12 20l8.8-8.6c1.8-1.9 1.8-4.9 0-6.8Z"/></svg>';
}

function thumbDownIcon() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14.5v4.2c0 1.1.8 2 1.9 2.1h.2c.8 0 1.5-.5 1.8-1.2l2-4.7h3.4c1.2 0 2.1-1 2-2.2L20.5 5c-.1-1.1-1-1.9-2.1-1.9H8.8c-.6 0-1.1.2-1.5.6L3.5 7.5v7h6.5Z"/><path d="M7.5 4v10.5"/></svg>';
}

function eyeClosedIcon() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 10.6A2 2 0 0 0 13.4 13.4"/><path d="M9.9 5.2A9.8 9.8 0 0 1 12 5c5 0 8.4 4.1 9.5 6.8-.4 1-1.2 2.2-2.3 3.3M6.7 6.8C4.7 8.1 3.3 10.1 2.5 11.8 3.6 14.5 7 18.5 12 18.5c1.4 0 2.7-.3 3.8-.9"/></svg>';
}

function calendarPlusIcon() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Zm7 7v6m-3-3h6"/></svg>';
}

function eventCard(event, compact = false, options = {}) {
  const { showDate = false, emphasize = false, catalog = false, dense = false } = options;
  const place = store(event.storeId);
  const organizer = community(event.communityId);
  const hostLabel = eventHostLabel(event, place);
  const fit = fitLabel(event);
  const evidence = evidenceLabel(event);
  const favoriteKey = eventPreferenceKey(event);
  const hiddenKey = favoriteKey;
  const isFavorite = !!state.personal.favorites[favoriteKey];
  const isHidden = !!state.personal.hidden[hiddenKey];
  const fee = event.entryFee == null ? 'Fee unknown' : Number(event.entryFee) === 0 ? 'Free' : `$${event.entryFee}`;
  const occurrence = event.occurrenceDate || parseDate(event.date || event.startDate);
  const dateNote = occurrence ? occurrence.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : '';
  if (compact) {
    const cue = compactEventCue(event, fit, evidence);
    return `<button class="compact-event ${isCompetitive(event) ? 'competitive' : ''} ${isHidden ? 'deprioritized' : ''} ${isPrereleaseOrSealed(event) ? 'limited-highlight' : ''} ${cue.className}" data-event-id="${escapeHtml(event.id)}" data-date="${dateKey(event.occurrenceDate)}"><span class="compact-event-time">${formatTime(eventStartTime(event))}</span><strong>${escapeHtml(event.title)}</strong><small>${organizer ? `${escapeHtml(organizer.name)} meetup · ` : ''}${escapeHtml(hostLabel)}</small><em>${escapeHtml(cue.label)}</em></button>`;
  }
  const limitedChip = isPrereleaseOrSealed(event) ? '<span class="status-chip limited">Prerelease / sealed</span>' : '';
  const communityChip = organizer ? '<span class="status-chip sky">Community meetup</span>' : '';
  return `<article class="event-card ${catalog ? 'catalog-event-card' : ''} ${dense ? 'dense-event-card' : ''} ${isCompetitive(event) ? 'competitive' : ''} ${isHidden ? 'deprioritized' : ''} ${isPrereleaseOrSealed(event) ? 'limited-highlight' : ''} ${emphasize ? `fit-${fit.tone}` : ''}" data-event-id="${escapeHtml(event.id)}" data-date="${dateKey(event.occurrenceDate)}" tabindex="0">
    <div class="event-time"><strong>${formatTime(eventStartTime(event))}</strong><span>${event.recurrence?.frequency === 'weekly' ? 'Weekly' : 'One-off'}</span>${showDate && dateNote ? `<small>${dateNote}</small>` : ''}</div>
    <div class="event-main">
      <div class="event-topline"><span class="format-mark ${formatClass(event)}">${formatShort(event)}</span><h3>${escapeHtml(event.title)}</h3></div>
      <div class="event-attribution">${organizer ? `<button class="place-inline" data-community-id="${escapeHtml(organizer.id)}">Organized by ${escapeHtml(organizer.name)}</button><span>·</span>` : ''}${place ? `<button class="place-inline" data-place-id="${escapeHtml(place.id)}" data-place-mode="drawer">At ${escapeHtml(place.name)} <span>· ${distanceLabel(place)}</span></button>` : `<span>At ${escapeHtml(hostLabel)}</span>`}</div>
      <div class="event-chips">${communityChip}${limitedChip}<span class="status-chip ${fit.tone}">${fit.label}</span><span class="status-chip ${evidence.tone}">${evidence.label}</span><span class="meta-chip">${fee}</span>${event.bracket && event.bracket !== 'unspecified' ? `<span class="meta-chip">Bracket ${escapeHtml(event.bracket)}</span>` : '<span class="meta-chip muted-chip">Bracket unknown</span>'}</div>
      <p>${escapeHtml(truncate(meaningfulEventDetails(event), 175))}</p>
    </div>
    <div class="event-actions"><div class="event-preference-actions"><button class="heart-button ${isFavorite ? 'active' : ''}" data-favorite="${favoriteKey}" aria-label="${isFavorite ? 'Remove from' : 'Add to'} favorites" title="Favorite series">${heartIcon()}</button><button class="visibility-button ${isHidden ? 'active' : ''}" data-action="toggle-event-hidden" data-event-id="${escapeHtml(event.id)}" aria-label="${isHidden ? 'Show event normally' : 'Hide event for now'}" title="${isHidden ? 'Show normally' : 'Hide for now'}">${eyeClosedIcon()}</button><button class="thumb-button ${state.personal.ratings[favoriteKey] === 1 ? 'active' : ''}" data-action="toggle-event-dislike" data-event-id="${escapeHtml(event.id)}" aria-label="${state.personal.ratings[favoriteKey] === 1 ? 'Remove event dislike' : 'Dislike event series'}" title="${state.personal.ratings[favoriteKey] === 1 ? 'Remove dislike' : 'Not for me'}">${thumbDownIcon()}</button></div><span class="open-cue">Open details →</span></div>
  </article>`;
}

function formatClass(event) {
  if (/community social|community gaming|gaymer night/i.test(`${event.title} ${event.format} ${event.eventType}`)) return 'format-community';
  if (/prerelease|sealed|limited/i.test(`${event.format} ${event.eventType}`)) return 'format-limited';
  if (/draft/i.test(`${event.format} ${event.eventType}`)) return 'format-draft';
  if (isCompetitive(event) || isHighPowerCommander(event)) return 'format-competitive';
  return 'format-commander';
}

function compactEventCue(event, fit, evidence) {
  if (isPrereleaseOrSealed(event)) return { label: /prerelease/i.test(`${event.title} ${event.eventType}`) ? 'Prerelease' : 'Limited', className: 'cue-limited' };
  if (state.personal.hidden[eventPreferenceKey(event)]) return { label: 'Hidden', className: 'cue-hidden' };
  if (hasExplicitNoProxy(event)) return { label: 'No proxy', className: 'cue-hidden' };
  if (isHighPowerCommander(event)) return { label: 'High power', className: 'cue-hidden' };
  if (isCompetitive(event)) return { label: 'Check first', className: 'cue-caution' };
  if (fit.tone === 'mint') return { label: 'Best fit', className: 'cue-best' };
  if (fit.tone === 'sky') return { label: 'Promising', className: 'cue-promising' };
  if (evidence.tone === 'amber') return { label: 'Verify', className: 'cue-verify' };
  return { label: 'Maybe', className: 'cue-neutral' };
}

function formatShort(event) {
  const text = `${event.title || ''} ${event.format || ''} ${event.eventType || ''}`;
  if (/community social|community gaming|gaymer night/i.test(text)) return 'SOC';
  if (/prerelease/i.test(text)) return 'PR';
  if (/sealed|limited/i.test(text)) return 'SE';
  if (/draft/i.test(text)) return 'DR';
  if (isCompetitive(event) || isHighPowerCommander(event)) return 'C4';
  if (/commander|edh/i.test(text)) return 'EDH';
  if (/standard/i.test(text)) return 'STD';
  if (/modern/i.test(text)) return 'MOD';
  if (/pioneer/i.test(text)) return 'PIO';
  if (/pauper/i.test(text)) return 'PAU';
  if (/legacy/i.test(text)) return 'LEG';
  if (/fnm|friday night magic/i.test(text)) return 'FNM';
  return 'MTG';
}

function hasExplicitNoProxy(event) {
  const place = store(event.storeId);
  return /no prox(?:y|ies)/i.test(`${event.title || ''} ${event.details || ''} ${place?.assessmentNotes || ''}`);
}

function eventPlanningGroup(event) {
  const place = store(event.storeId);
  const placeHidden = !!state.personal.hidden[`place:${event.storeId}`];
  const eventHidden = !!state.personal.hidden[eventPreferenceKey(event)];
  if (eventHidden || placeHidden || hasExplicitNoProxy(event) || isCompetitive(event) || isHighPowerCommander(event)) return 'hidden';
  if (place?.lifecycleState === 'identity_blocked') return 'verify';
  if (isPrereleaseOrSealed(event)) return 'limited';
  const fit = fitLabel(event);
  if (fit.tone === 'mint') return 'best';
  if (fit.tone === 'sky') return 'promising';
  if (evidenceLabel(event).tone === 'amber' || event.confidence === 'low' || !eventStartTime(event)) return 'verify';
  return 'maybe';
}

const EVENT_GROUPS = [
  { id: 'limited', label: 'Prerelease / sealed', tone: 'limited' },
  { id: 'best', label: 'Best fits', tone: 'mint' },
  { id: 'promising', label: 'Promising', tone: 'sky' },
  { id: 'verify', label: 'Verify / check first', tone: 'amber' },
  { id: 'maybe', label: 'Maybe / lower priority', tone: 'slate' },
  { id: 'hidden', label: 'Hidden / poor fit', tone: 'coral' }
];

function eventFormatBucket(event) {
  const text = `${event.title || ''} ${event.format || ''} ${event.eventType || ''}`;
  if (/prerelease|sealed|limited/i.test(text)) return 'Limited';
  if (/draft/i.test(text)) return 'Draft';
  if (/fnm|friday night magic/i.test(text)) return 'FNM';
  if (/commander|edh/i.test(text)) return 'Commander';
  if (/party|special/i.test(text)) return 'Special';
  return 'Other';
}

function formatMix(events, limit = 3) {
  const counts = events.reduce((result, event) => {
    const bucket = eventFormatBucket(event);
    result[bucket] = (result[bucket] || 0) + 1;
    return result;
  }, {});
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || compareText(a[0], b[0]))
    .slice(0, limit)
    .map(([label, count]) => `${count} ${label}`)
    .join(' · ');
}

function eventPlanningSort(a, b) {
  return compareText(eventStartTime(a), eventStartTime(b)) || compareText(a.title, b.title);
}

function groupedDayEvents(events, options = {}) {
  const {
    compact = true,
    drawer = false,
    dense = false,
    cardOptions = {},
    emphasizedKeys = new Set(),
    openGroups: explicitOpenGroups
  } = options;
  const crowded = events.length > 12;
  return EVENT_GROUPS.map((group) => {
    const items = events.filter((event) => eventPlanningGroup(event) === group.id).sort(eventPlanningSort);
    if (!items.length) return '';
    const openGroups = explicitOpenGroups || (drawer && !crowded ? ['limited', 'best', 'promising'] : ['limited', 'best']);
    const open = openGroups.includes(group.id);
    const mix = drawer ? formatMix(items, 2) : '';
    return `<details class="event-priority-group group-${group.id}" ${open ? 'open' : ''}>
      <summary><span><i class="group-dot ${group.tone}"></i><strong>${group.label}</strong>${mix ? `<em>${escapeHtml(mix)}</em>` : ''}</span><span>${items.length}</span></summary>
      <div class="event-priority-items">${items.map((event) => eventCard(event, compact, { ...cardOptions, dense, emphasize: emphasizedKeys.has(todayLeadKey(event)) })).join('')}</div>
    </details>`;
  }).join('');
}

function dayGroupCounts(events) {
  return EVENT_GROUPS
    .map((group) => ({ ...group, count: events.filter((event) => eventPlanningGroup(event) === group.id).length }))
    .filter((group) => group.count)
    .map((group) => `<span class="day-group-pill group-${group.id}"><i class="group-dot ${group.tone}"></i>${group.count} ${escapeHtml(group.label)}</span>`)
    .join('');
}

function monthHighlightScore(event) {
  const groupRank = { limited: 450, best: 400, promising: 300, verify: 200, maybe: 100, hidden: 0 }[eventPlanningGroup(event)];
  const datedBonus = event.occurrenceStatus === 'confirmed' ? 45 : 0;
  const specialBonus = isPrereleaseOrSealed(event) ? 75 : /draft|party|special/i.test(`${event.title} ${event.format} ${event.eventType}`) ? 35 : 0;
  const routinePenalty = event.recurrence?.frequency === 'weekly' ? 8 : 0;
  return groupRank + datedBonus + specialBonus + fitScore(event) - routinePenalty;
}

function monthHighlights(events, limit = 3) {
  const sorted = [...events].sort((a, b) => monthHighlightScore(b) - monthHighlightScore(a) || eventPlanningSort(a, b));
  const stronger = sorted.filter((event) => ['limited', 'best', 'promising'].includes(eventPlanningGroup(event)));
  const verify = sorted.filter((event) => eventPlanningGroup(event) === 'verify');
  const lower = sorted.filter((event) => eventPlanningGroup(event) === 'maybe');
  return [...stronger, ...verify, ...lower].slice(0, limit);
}

function dayMoreLabel(events, visibleEvents) {
  const hidden = events.length - visibleEvents.length;
  if (hidden <= 0) return '';
  const mix = formatMix(events, 2);
  return `${hidden} more${mix ? ` · ${mix}` : ''}`;
}

function renderWeek(events, start) {
  const weekendCount = events.filter((event) => isWeekend(event.occurrenceDate)).length;
  document.getElementById('calendarContent').innerHTML = `<div class="week-helper"><span>${weekendCount} Fri-Sun matches this week</span><span>Weekend columns are emphasized for planning.</span></div><div class="week-grid">${Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    const dayEvents = events.filter((event) => dateKey(event.occurrenceDate) === dateKey(date));
    return `<section class="week-column ${date < startOfDay(new Date()) ? 'past' : ''} ${isWeekend(date) ? 'weekend-column' : ''}"><header><span>${date.toLocaleDateString(undefined, { weekday: 'short' })}</span><strong>${date.getDate()}</strong>${dateKey(date) === dateKey(new Date()) ? '<em>Today</em>' : ''}${dayEvents.length ? `<small>${dayEvents.length} events · ${formatMix(dayEvents, 2)}</small>` : ''}</header><div>${groupedDayEvents(dayEvents) || '<p class="no-events">No matching events</p>'}</div></section>`;
  }).join('')}</div>`;
}

function renderMonth(events) {
  const gridStart = rollingMonthStart(state.date);
  let html = `<div class="month-grid">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => `<div class="month-label">${day}</div>`).join('')}`;
  for (let index = 0; index < 35; index++) {
    const date = addDays(gridStart, index);
    const dayEvents = events.filter((event) => dateKey(event.occurrenceDate) === dateKey(date));
    const highlights = monthHighlights(dayEvents);
    html += `<section class="month-cell ${date < startOfDay(new Date()) ? 'past' : ''} ${isWeekend(date) ? 'weekend-cell' : ''}"><header><span>${date.getDate()}</span><div>${dateKey(date) === dateKey(new Date()) ? '<em>Today</em>' : ''}${dayEvents.length ? `<small>${dayEvents.length} · ${formatMix(dayEvents, 1)}</small>` : ''}</div></header><div>${highlights.map((event) => eventCard(event, true)).join('')}${dayEvents.length > highlights.length ? `<button class="more-day" data-action="day-popover" data-day-date="${dateKey(date)}">${dayMoreLabel(dayEvents, highlights)}</button>` : ''}</div></section>`;
  }
  document.getElementById('calendarContent').innerHTML = `${html}</div>`;
}

function moveDate(direction) {
  if (state.view === 'month') state.date = addDays(state.date, direction * 28);
  else if (state.view === 'week') state.date = addDays(state.date, direction * 7);
  else state.date = addDays(state.date, direction * 14);
  renderCalendar();
}

function moveEventCatalogDate(direction) {
  if (state.eventCatalogView === 'month') state.eventCatalogDate = addDays(state.eventCatalogDate, direction * 28);
  else state.eventCatalogDate = addDays(state.eventCatalogDate, direction * 7);
  resetEventCatalogVisible();
  renderEventCatalog();
}

function jumpToWeekend() {
  let date = startOfDay(new Date());
  while (date.getDay() !== 5) date = addDays(date, 1);
  state.date = date;
  state.preset = 'weekend';
  document.querySelectorAll('[data-preset]').forEach((button) => button.classList.toggle('active', button.dataset.preset === 'weekend'));
  renderCalendar();
  if (state.view === 'agenda') document.getElementById(`day-${dateKey(date)}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  else if (state.view === 'week') document.querySelector('.weekend-column')?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
}

function renderHighlights() {
  const events = buildOccurrences(startOfDay(new Date()), endOfDay(addDays(new Date(), 28)), false);
  const notable = [...events]
    .filter((event) => !isPlaceHidden(event.storeId) && !isEventHidden(event))
    .sort((a, b) => Number(isSpecial(b)) - Number(isSpecial(a)) || freshnessDays(a.lastVerified) - freshnessDays(b.lastVerified))
    .slice(0, 3);
  document.getElementById('newHighlights').innerHTML = notable.map((event) => highlightEvent(event)).join('');
  const bestPlaces = rankedStores().filter((place) => place.researchStatus === 'partial').slice(0, 3);
  document.getElementById('fitHighlights').innerHTML = bestPlaces.map((place, index) => `<button class="place-highlight" data-place-id="${place.id}"><span class="rank-number">0${index + 1}</span><span><strong>${escapeHtml(place.name)}</strong><small>${distanceLabel(place)} · ${placeFitPhrase(place)}</small></span><span>→</span></button>`).join('');
  const discoveryCount = DATA.stores.filter((place) => place.researchStatus === 'wizards-discovery' && !isPlaceHidden(place.id)).length;
  document.getElementById('researchAlerts').innerHTML = `<button class="alert-row" data-route="research"><span class="alert-icon amber">!</span><span><strong>${discoveryCount} places need deeper review</strong><small>Visible, but not fully vetted</small></span></button><button class="alert-row" data-route="research"><span class="alert-icon coral">↯</span><span><strong>Other Magic formats under-covered</strong><small>Current seed is Commander-heavy</small></span></button>`;
}

function highlightEvent(event) {
  const place = store(event.storeId);
  return `<button class="highlight-card" data-event-id="${event.id}" data-date="${dateKey(event.occurrenceDate)}"><span class="highlight-date"><strong>${event.occurrenceDate.getDate()}</strong>${event.occurrenceDate.toLocaleDateString(undefined, { month: 'short' })}</span><span><em>${isSpecial(event) ? 'Special event' : evidenceLabel(event).label}</em><strong>${escapeHtml(event.title)}</strong><small>${escapeHtml(place.name)} · ${formatTime(eventStartTime(event))}</small></span><span>→</span></button>`;
}

function notableEvents(limit = 12) {
  const start = startOfDay(new Date());
  const events = buildOccurrences(start, endOfDay(addDays(start, 28)), false);
  return [...events]
    .filter((event) => !isPlaceHidden(event.storeId) && !isEventHidden(event))
    .sort((a, b) => Number(isSpecial(b)) - Number(isSpecial(a)) || freshnessDays(a.lastVerified) - freshnessDays(b.lastVerified) || a.occurrenceDate - b.occurrenceDate)
    .slice(0, limit);
}

function rankedStores() {
  return [...DATA.stores]
    .filter((place) => !isPlaceHidden(place.id))
    .sort((a, b) => storeScore(b) - storeScore(a) || a.distanceMiles - b.distanceMiles);
}

function placesByBestFit() {
  return [...DATA.stores].sort((a, b) => storeScore(b) - storeScore(a) || a.distanceMiles - b.distanceMiles);
}

function placesByName() {
  return [...DATA.stores].sort((a, b) => compareText(a?.name, b?.name, { numeric: true, sensitivity: 'base' }));
}

function placesByDistance() {
  return [...DATA.stores].sort((a, b) => {
    const distanceA = numericDistance(a);
    const distanceB = numericDistance(b);
    if (distanceA == null && distanceB == null) return compareText(a?.name, b?.name);
    if (distanceA == null) return 1;
    if (distanceB == null) return -1;
    return distanceA - distanceB || compareText(a?.name, b?.name);
  });
}

function sortPlacesByMode(mode) {
  if (mode === 'best') return placesByBestFit();
  if (mode === 'distance') return placesByDistance();
  return placesByName();
}

function favoritePlaces() {
  return DATA.stores.filter((place) => state.personal.favorites[`place:${place.id}`] && !isPlaceHidden(place.id));
}

function defaultSelectedPlaceId() {
  return favoritePlaces().sort((a, b) => storeScore(b) - storeScore(a) || compareText(a?.name, b?.name))[0]?.id
    || rankedStores()[0]?.id
    || placesByName()[0]?.id
    || DATA.stores[0]?.id;
}

function storeScore(place) {
  return fitScoreFor(place) * 20 - Math.min(numericDistance(place) ?? 28, 40) + (place.researchStatus === 'partial' ? 8 : 0);
}

function isPlaceHidden(placeId) {
  const place = store(placeId);
  return !!state.personal.hidden[`place:${placeId}`] || (place ? isPlaceLowFit(place) : false);
}

function isEventHidden(event) {
  if (!event) return false;
  return !!state.personal.hidden[eventPreferenceKey(event)] || isPlaceHidden(event.storeId);
}

function placeFitPhrase(place) {
  if ((place.assessment?.homeGroupPotential || 0) >= 4 && numericDistance(place) != null && numericDistance(place) < 10) return 'strong local potential';
  if ((place.assessment?.commanderActivity || 0) >= 4) return 'active Magic opportunity';
  return 'worth investigating';
}

function placeResearchLabel(place) {
  if (place.evaluation?.researchStatus === 'deepened') return 'Deepened';
  if (place.researchStatus === 'partial') return candidateStatusFor(place) === 'promoted' ? 'Deepened' : 'Reviewed';
  return 'Discovery-level';
}

function placeEvaluationSummary(place) {
  const evaluation = normalizedEvaluation(place);
  return `<div class="evaluation-summary" aria-label="Current place evaluation">
    <button class="evaluation-tile" data-action="explain-scores"><span>Personal fit</span><strong>${escapeHtml(evaluation.fitGrade)}</strong><small>${Number(evaluation.fitScore).toFixed(1)} / 5 · promise for you</small></button>
    <button class="evaluation-tile" data-action="explain-scores"><span>Confidence</span><strong>${escapeHtml(evaluation.confidence)}</strong><small>How strongly the evidence supports that read</small></button>
    <button class="evaluation-tile" data-action="explain-scores"><span>Research depth</span><strong>${escapeHtml(placeResearchLabel(place))}</strong><small>${evaluation.candidateStatus === 'promoted' ? 'Promoted candidate' : evaluation.candidateStatus === 'working' ? 'Working candidate' : 'Discovery candidate'}</small></button>
  </div>
  <section class="detail-section assessment-snapshot"><div><p class="eyebrow">Pluses</p><ul>${evaluation.positives.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join('') || '<li>No strong positive factors are recorded yet.</li>'}</ul></div><div><p class="eyebrow">Cautions</p><ul>${evaluation.cautions.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join('') || '<li>No specific caution has been recorded yet.</li>'}</ul></div><div><p class="eyebrow">Open questions</p><ul>${evaluation.openQuestions.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join('') || '<li>No open question is recorded yet.</li>'}</ul></div></section>`;
}

function placeHoursChip(place) {
  const hours = place.hours || normalizePlaceHours();
  const sourceItem = hours.sourceId ? source(hours.sourceId) : null;
  const today = new Date().getDay();
  const todaySlots = hours.weekly?.[String(today)] || hours.weekly?.[dayKeyName(today)] || [];
  const temporary = activeTemporaryHours(hours.temporary);
  const status = temporary?.status || hours.status || 'unknown';
  const tone = status === 'verified' ? 'mint' : status === 'variable' ? 'amber' : status === 'stale' ? 'coral' : 'slate';
  const label = temporary?.label || hoursStatusLabel(status);
  const todayLabel = temporary?.label || formatHoursSlots(todaySlots) || (status === 'unknown' ? 'Hours unknown' : 'Check hours');
  const note = temporary?.note || hours.note || hoursStatusNote(status);
  const sourceLine = sourceItem
    ? `<a href="${escapeHtml(sourceItem.url)}" target="_blank" rel="noreferrer">${escapeHtml(sourceItem.label)} ↗</a>`
    : 'No hours source captured yet';
  return `<details class="hours-popover">
    <summary><span class="status-dot ${tone}"></span><span>${escapeHtml(todayLabel)}</span><em>${escapeHtml(label)}</em></summary>
    <div class="hours-popover-panel">
      <p>${escapeHtml(note)}</p>
      <div class="hours-meta"><span>Last checked: ${escapeHtml(hours.lastVerified || place.lastVerified || 'Unknown')}</span><span>${sourceLine}</span></div>
      ${hoursWeekGrid(hours.weekly)}
    </div>
  </details>`;
}

function dayKeyName(index) {
  return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][index];
}

function hoursStatusLabel(status) {
  if (status === 'verified') return 'Verified hours';
  if (status === 'variable') return 'Check first';
  if (status === 'stale') return 'Stale hours';
  return 'Hours unknown';
}

function hoursStatusNote(status) {
  if (status === 'verified') return 'These hours have a captured source and recent enough verification to use for ordinary planning.';
  if (status === 'variable') return 'Hours appear to vary or depend on the event/source. Check the linked source before relying on them.';
  if (status === 'stale') return 'These hours are preserved for context, but they are old enough that they should not be treated as current.';
  return 'No structured weekly hours have been captured yet. Event times may still be valid, but ordinary opening hours need a source-backed pass.';
}

function formatHoursSlots(slots) {
  const list = Array.isArray(slots) ? slots : [];
  if (!list.length) return '';
  if (list.some((slot) => slot?.closed)) return 'Closed today';
  return list.map((slot) => `${formatTime(slot.open)}-${formatTime(slot.close)}`).join(', ');
}

function activeTemporaryHours(items) {
  const today = dateKey(new Date());
  return (items || []).find((item) => (!item.startDate || item.startDate <= today) && (!item.endDate || item.endDate >= today));
}

function hoursWeekGrid(weekly = {}) {
  const hasHours = Object.keys(weekly || {}).length > 0;
  if (!hasHours) return '';
  return `<div class="hours-week">${Array.from({ length: 7 }, (_, index) => `<div><span>${dayKeyName(index).slice(0, 3)}</span><strong>${escapeHtml(formatHoursSlots(weekly[String(index)] || weekly[dayKeyName(index)]) || 'Unknown')}</strong></div>`).join('')}</div>`;
}

function renderEventCatalog() {
  const catalogRange = eventCatalogRange();
  const rawStart = state.eventCatalogView === 'list' ? startOfDay(new Date()) : catalogRange.start;
  const rawEnd = state.eventCatalogView === 'list' ? endOfDay(addDays(rawStart, 56)) : catalogRange.end;
  const rawEvents = buildOccurrences(rawStart, rawEnd);
  const events = eventCatalogMatches(rawEvents);
  updateEventCatalogDateNav(catalogRange);
  const organizerCount = new Set(events.map((event) => event.storeId ? `place:${event.storeId}` : `community:${event.communityId}`).filter(Boolean)).size;
  document.getElementById('eventSummary').innerHTML = `<div><strong>${events.length}</strong><span>upcoming occurrences shown</span></div><div><strong>${organizerCount}</strong><span>organizers represented</span></div><div><strong>${events.filter(isSpecial).length}</strong><span>special / limited signals</span></div><div class="warning-stat"><strong>${state.eventCatalogFilter === 'best' ? 'Best-fit ordering' : 'Chronological catalog'}</strong><span>${state.eventCatalogView === 'list' ? 'full catalog list' : state.eventCatalogView === 'week' ? 'weekly layout' : 'monthly layout'}</span></div>`;
  if (!events.length) {
    document.getElementById('eventCatalog').innerHTML = emptyState('No catalog matches', 'Clear filters or search terms to restore events.');
    return;
  }
  if (state.eventCatalogView === 'week') {
    document.getElementById('eventCatalog').innerHTML = renderEventCatalogWeek(events, catalogRange.start);
    return;
  }
  if (state.eventCatalogView === 'month') {
    document.getElementById('eventCatalog').innerHTML = renderEventCatalogMonth(events, catalogRange.start);
    return;
  }
  const recommended = diversifiedRecommendedEvents(events, 6);
  const visibleCount = Math.min(state.eventCatalogVisible, events.length);
  const visibleEvents = events.slice(0, visibleCount);
  document.getElementById('eventCatalog').innerHTML = `<section class="catalog-featured" aria-label="Recommended events">
    <div class="today-section-heading"><div><p class="eyebrow mint">Recommended first</p><h2>High-signal events to scan first</h2></div><span>${recommended.length} surfaced</span></div>
    <div class="catalog-grid prioritized-grid">${recommended.map((event) => eventCard(event, false, { showDate: true, emphasize: true, catalog: true })).join('')}</div>
  </section>
  <section class="catalog-all-events">
    <div class="today-section-heading"><div><p class="eyebrow">Full catalog</p><h2>All matching events</h2></div><span>${visibleCount} of ${events.length} shown</span></div>
    ${renderCatalogListGroups(visibleEvents, recommended)}
    ${visibleCount < events.length ? `<button class="load-more catalog-load-more" data-action="load-more-event-catalog"><span>&darr;</span><strong>Show next ${Math.min(EVENT_CATALOG_PAGE_SIZE, events.length - visibleCount)}</strong><small>${events.length - visibleCount} more matching events remain</small></button>` : ''}
  </section>`;
}

function renderCatalogListGroups(events, recommended = []) {
  const recommendedKeys = new Set(recommended.map(todayLeadKey));
  const groups = [];
  for (const event of events) {
    const key = dateKey(event.occurrenceDate);
    let group = groups.at(-1);
    if (!group || group.key !== key) {
      group = { key, date: startOfDay(event.occurrenceDate), events: [] };
      groups.push(group);
    }
    group.events.push(event);
  }
  return `<div class="catalog-day-list">${groups.map((group) => `
    <section class="catalog-day-section">
      <header>
        <div><p class="eyebrow">${group.date.toLocaleDateString(undefined, { weekday: 'long' })}</p><h3>${group.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}${dateKey(group.date) === dateKey(new Date()) ? ' · Today' : ''}</h3></div>
        <span>${group.events.length} event${group.events.length === 1 ? '' : 's'} · ${formatMix(group.events, 2)}</span>
      </header>
      <div class="day-group-counts catalog-day-counts">${dayGroupCounts(group.events)}</div>
      <div class="catalog-day-groups">${groupedDayEvents(group.events, {
        compact: false,
        drawer: true,
        dense: true,
        cardOptions: { showDate: true, catalog: true },
        emphasizedKeys: recommendedKeys,
        openGroups: ['limited', 'best', 'promising']
      })}</div>
    </section>`).join('')}</div>`;
}

function eventCatalogRange() {
  if (state.eventCatalogView === 'month') {
    const start = rollingMonthStart(state.eventCatalogDate);
    return { start, end: endOfDay(addDays(start, 34)) };
  }
  const start = fridayWeekStart(state.eventCatalogDate);
  return { start, end: endOfDay(addDays(start, 6)) };
}

function updateEventCatalogDateNav(range) {
  const nav = document.getElementById('eventCatalogDateNav');
  const label = document.getElementById('eventCatalogDateLabel');
  if (!nav || !label) return;
  nav.classList.toggle('hidden', state.eventCatalogView === 'list');
  if (state.eventCatalogView === 'month') label.textContent = `${range.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${range.end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  else label.textContent = `${range.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${range.end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function eventCatalogMatches(events) {
  let filtered = events.filter((event) => eventMatchesSharedFilters(event, { includePreset: false, includeSearch: true }));
  if (state.eventCatalogFilter === 'commander') {
    filtered = filtered.filter((event) => /commander|edh/i.test(`${event.title} ${event.format} ${event.eventType}`));
  } else if (state.eventCatalogFilter === 'limited') {
    filtered = filtered.filter((event) => /prerelease|sealed|limited/i.test(`${event.title} ${event.format} ${event.eventType}`));
  } else if (state.eventCatalogFilter === 'draft') {
    filtered = filtered.filter((event) => /draft/i.test(`${event.title} ${event.format} ${event.eventType}`));
  }
  const sorter = state.eventCatalogFilter === 'best'
    ? (a, b) => eventCatalogPriority(b) - eventCatalogPriority(a) || a.occurrenceDate - b.occurrenceDate
    : (a, b) => a.occurrenceDate - b.occurrenceDate || compareText(eventStartTime(a), eventStartTime(b));
  return [...filtered].sort(sorter);
}

function diversifiedRecommendedEvents(events, limit = 6) {
  const selected = [];
  const seenSeries = new Set();
  const storeCounts = {};
  const candidates = [...events].sort((a, b) => eventCatalogPriority(b) - eventCatalogPriority(a) || a.occurrenceDate - b.occurrenceDate || compareText(eventStartTime(a), eventStartTime(b)));
  for (const event of candidates) {
    const seriesKey = eventPreferenceKey(event);
    if (seenSeries.has(seriesKey)) continue;
    if ((storeCounts[event.storeId] || 0) >= 2) continue;
    selected.push(event);
    seenSeries.add(seriesKey);
    storeCounts[event.storeId] = (storeCounts[event.storeId] || 0) + 1;
    if (selected.length >= limit) return selected;
  }
  for (const event of candidates) {
    if (selected.some((item) => todayLeadKey(item) === todayLeadKey(event))) continue;
    selected.push(event);
    if (selected.length >= limit) return selected;
  }
  return selected;
}

function eventCatalogPriority(event) {
  const reviewedBonus = store(event.storeId)?.researchStatus === 'partial' ? 8 : 0;
  const specialBonus = isSpecial(event) ? 10 : 0;
  const favoriteBonus = state.personal.favorites[`place:${event.storeId}`] || state.personal.favorites[eventPreferenceKey(event)] ? 14 : 0;
  const competitivePenalty = isCompetitive(event) ? 18 : 0;
  return fitScore(event) * 10 + reviewedBonus + specialBonus + favoriteBonus - competitivePenalty;
}

function renderEventCatalogWeek(events, start) {
  const weekStart = fridayWeekStart(start);
  return `<div class="week-grid event-catalog-week">${Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const dayEvents = events.filter((event) => dateKey(event.occurrenceDate) === dateKey(date));
    return `<section class="week-column ${date < startOfDay(new Date()) ? 'past' : ''} ${isWeekend(date) ? 'weekend-column' : ''}"><header><span>${date.toLocaleDateString(undefined, { weekday: 'short' })}</span><strong>${date.getDate()}</strong>${dateKey(date) === dateKey(new Date()) ? '<em>Today</em>' : ''}${dayEvents.length ? `<small>${dayEvents.length} events · ${formatMix(dayEvents, 2)}</small>` : ''}</header><div>${groupedDayEvents(dayEvents) || '<p class="no-events">No matching events</p>'}</div></section>`;
  }).join('')}</div>`;
}

function renderEventCatalogMonth(events, start) {
  const gridStart = rollingMonthStart(start);
  let html = `<div class="month-grid event-catalog-month">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => `<div class="month-label">${day}</div>`).join('')}`;
  for (let index = 0; index < 35; index++) {
    const date = addDays(gridStart, index);
    const dayEvents = events.filter((event) => dateKey(event.occurrenceDate) === dateKey(date));
    const highlights = monthHighlights(dayEvents);
    html += `<section class="month-cell ${date < startOfDay(new Date()) ? 'past' : ''} ${isWeekend(date) ? 'weekend-cell' : ''}"><header><span>${date.getDate()}</span><div>${dateKey(date) === dateKey(new Date()) ? '<em>Today</em>' : ''}${dayEvents.length ? `<small>${dayEvents.length} · ${formatMix(dayEvents, 1)}</small>` : ''}</div></header><div>${highlights.map((event) => eventCard(event, true)).join('')}${dayEvents.length > highlights.length ? `<button class="more-day" data-action="day-popover" data-day-date="${dateKey(date)}">${dayMoreLabel(dayEvents, highlights)}</button>` : ''}</div></section>`;
  }
  return `${html}</div>`;
}

function renderPlaces() {
  const list = document.getElementById('placeList');
  const mobileList = document.getElementById('placeListMobile');
  const desktopSearch = document.getElementById('placeSearch');
  const mobileSearch = document.getElementById('placeSearchMobile');
  if (state.placeFilter === 'hidden') state.placeFilter = 'all';
  const query = desktopSearch.value.trim().toLowerCase();
  const sortedPlaces = sortPlacesByMode(state.placeSort);
  let places = sortedPlaces.filter((place) => !query || `${place.name} ${place.city} ${place.assessmentNotes}`.toLowerCase().includes(query));
  if (state.placeFilter === 'partial') places = places.filter((place) => place.researchStatus === 'partial');
  if (state.placeFilter === 'favorites') places = places.filter((place) => state.personal.favorites[`place:${place.id}`]);
  if (state.favoritesOnly) places = places.filter((place) => state.personal.favorites[`place:${place.id}`]);
  const hiddenPlaces = places.filter((place) => isPlaceLowFit(place));
  const visiblePlaces = places.filter((place) => !isPlaceLowFit(place));
  const showFavoriteGroup = !query && state.placeFilter === 'all' && !state.favoritesOnly;
  const topFavorites = showFavoriteGroup ? visiblePlaces.filter((place) => state.personal.favorites[`place:${place.id}`]) : [];
  const primaryPlaces = topFavorites.length ? visiblePlaces.filter((place) => !state.personal.favorites[`place:${place.id}`]) : visiblePlaces;
  const candidatePool = [...topFavorites, ...primaryPlaces, ...hiddenPlaces];
  if (!candidatePool.some((place) => place.id === state.selectedPlaceId)) state.selectedPlaceId = topFavorites[0]?.id || primaryPlaces[0]?.id || hiddenPlaces[0]?.id;
  if (state.selectedPlaceWasAuto && topFavorites.length && state.selectedPlaceId !== topFavorites[0].id) state.selectedPlaceId = topFavorites[0].id;
  list.innerHTML = placeListMarkup(topFavorites, primaryPlaces, hiddenPlaces);
  mobileList.innerHTML = placeListMarkup(topFavorites, primaryPlaces, hiddenPlaces);
  mobileSearch.value = query;
  syncPlaceControls();
  renderPlacePickerSummary(visiblePlaces, hiddenPlaces);
  renderPlaceDetail(store(state.selectedPlaceId));
}

function placeListMarkup(favoritePlaces, visiblePlaces, hiddenPlaces) {
  const favoriteMarkup = favoritePlaces.length ? `<details class="entity-list-favorite-group" open><summary><strong>Favorites</strong><small>${favoritePlaces.length} saved</small></summary><div class="entity-list-favorite-items">${favoritePlaces.map((place) => placeListRow(place)).join('')}</div></details>` : '';
  const primaryMarkup = visiblePlaces.map((place) => placeListRow(place)).join('');
  const hiddenMarkup = hiddenPlaces.length ? `<details class="entity-list-hidden-group"><summary><strong>Hidden / low-fit</strong><small>${hiddenPlaces.length} deprioritized</small></summary><div class="entity-list-hidden-items">${hiddenPlaces.map((place) => placeListRow(place, true)).join('')}</div></details>` : '';
  const markup = `${favoriteMarkup}${primaryMarkup}${hiddenMarkup}`;
  return markup || emptyState('No places match', 'Try another name or filter.');
}

function placeListRow(place, hidden = false) {
  const active = place.id === state.selectedPlaceId;
  const favorite = state.personal.favorites[`place:${place.id}`];
  const evaluation = normalizedEvaluation(place);
  return `<button class="entity-list-item ${active ? 'active' : ''} ${hidden ? 'deprioritized' : ''}" data-place-id="${place.id}"><span class="entity-avatar">${initials(place.name)}</span><span><strong>${escapeHtml(place.name)}</strong><small>${escapeHtml(place.city)} · ${distanceLabel(place)}</small><em class="${place.researchStatus === 'partial' ? 'mint-text' : 'amber-text'}">${place.researchStatus === 'partial' ? 'Reviewed / partial' : 'Discovery-level'} · ${escapeHtml(evaluation.fitGrade)} · ${escapeHtml(evaluation.confidence)} confidence</em></span><span class="list-heart">${hidden ? '↓' : favorite ? '♥' : ''}</span></button>`;
}

function renderPlaceDetail(place) {
  const container = document.getElementById('placeDetail');
  if (!place) return container.innerHTML = emptyState('Select a place', 'Choose a venue from the list.');
  const placeEvents = uniqueEventSeries(DATA.events.filter((event) => event.storeId === place.id));
  const sources = (place.sourceIds || []).map(source).filter(Boolean);
  const artifacts = artifactsFor('venue', place.id);
  const favorite = !!state.personal.favorites[`place:${place.id}`];
  const hidden = !!state.personal.hidden[`place:${place.id}`];
  const rating = state.personal.ratings[`place:${place.id}`] || 0;
  container.innerHTML = `<div class="detail-hero"><div class="detail-identity"><span class="large-avatar">${initials(place.name)}</span><div><div class="identity-flags"><span class="status-chip ${place.researchStatus === 'partial' ? 'mint' : 'amber'}">${place.researchStatus === 'partial' ? 'Reviewed / partial' : 'Discovery-level'}</span>${place.lifecycleState === 'identity_blocked' ? '<span class="status-chip amber">Identity unresolved · check first</span>' : ''}${hidden ? '<span class="status-chip coral">Deprioritized by you</span>' : ''}${place.wpnPremium ? '<span class="status-chip violet">WPN Premium</span>' : ''}</div><h2>${escapeHtml(place.name)}</h2><p>${escapeHtml(place.city)} · ${distanceLabel(place, true)} from Los Alamitos</p></div></div><div class="detail-hero-aside">${placeHoursChip(place)}<div class="detail-preference-actions"><button class="heart-button large ${favorite ? 'active' : ''}" data-favorite="place:${place.id}" aria-label="Favorite place" title="Favorite">${heartIcon()}</button><button class="thumb-button large ${hidden ? 'active' : ''}" data-action="toggle-place-hidden" data-place-id="${place.id}" aria-label="${hidden ? 'Restore priority' : 'Deprioritize place'}" title="${hidden ? 'Restore priority' : 'Deprioritize'}">${thumbDownIcon()}</button></div></div></div>
    <div class="detail-actions"><a class="primary-button" href="${mapsUrl(place)}" target="_blank" rel="noreferrer">Directions ↗</a>${place.website ? `<a class="soft-button" href="${escapeHtml(place.website)}" target="_blank" rel="noreferrer">Website ↗</a>` : ''}${place.instagram ? `<a class="soft-button" href="${escapeHtml(place.instagram)}" target="_blank" rel="noreferrer">Instagram ↗</a>` : ''}</div>
    <div class="detail-tabs" role="tablist" aria-label="Place details"><button class="${state.selectedPlaceTab === 'overview' ? 'active' : ''}" data-place-tab="overview" role="tab" aria-selected="${state.selectedPlaceTab === 'overview'}">Overview</button><button class="${state.selectedPlaceTab === 'events' ? 'active' : ''}" data-place-tab="events" role="tab" aria-selected="${state.selectedPlaceTab === 'events'}">Events <span>${placeEvents.length}</span></button><button class="${state.selectedPlaceTab === 'evidence' ? 'active' : ''}" data-place-tab="evidence" role="tab" aria-selected="${state.selectedPlaceTab === 'evidence'}">Evidence <span>${sources.length + artifacts.length}</span></button></div>
    <div class="place-tab-content">${placeTabContent(place, placeEvents, sources, artifacts, rating)}</div>`;
}

function uniqueEventSeries(events) {
  const bySeries = new Map();
  for (const event of events) {
    const key = event.seriesId || event.id;
    const existing = bySeries.get(key);
    if (!existing || event.recurrence?.frequency === 'weekly') bySeries.set(key, event);
  }
  return [...bySeries.values()];
}

function placeTabContent(place, placeEvents, sources, artifacts, rating) {
  if (state.selectedPlaceTab === 'events') {
    const upcoming = buildOccurrences(startOfDay(new Date()), endOfDay(addDays(new Date(), 56)), false).filter((event) => event.storeId === place.id);
    return `<section class="detail-section tab-intro"><p class="eyebrow">Known schedule</p><h3>${placeEvents.length} normalized series · ${upcoming.length} projected occurrences</h3><p class="analysis-copy">Recurring listings are patterns, not promises. Open any occurrence to see whether it is dated or projected and what should be verified before leaving.</p></section><section class="detail-section"><div class="section-title-row"><div><p class="eyebrow">Event series</p><h3>Recurring and one-off records</h3></div></div><div class="series-list">${placeEvents.length ? placeEvents.map((event) => seriesRow(event)).join('') : '<p class="muted-copy">No normalized event series yet. This is not proof that the venue has no Magic events.</p>'}</div></section><section class="detail-section"><div class="section-title-row"><div><p class="eyebrow">Next eight weeks</p><h3>Upcoming occurrences</h3></div></div><div class="place-occurrences">${upcoming.length ? upcoming.slice(0, 24).map((event) => `<button class="occurrence-row" data-event-id="${event.id}" data-date="${dateKey(event.occurrenceDate)}"><time><strong>${event.occurrenceDate.getDate()}</strong>${event.occurrenceDate.toLocaleDateString(undefined,{month:'short'})}</time><span><strong>${escapeHtml(event.title)}</strong><small>${event.occurrenceDate.toLocaleDateString(undefined,{weekday:'long'})} · ${formatTime(event.recurrence?.startTime)}</small></span><span class="status-chip ${evidenceLabel(event).tone}">${evidenceLabel(event).label}</span></button>`).join('') : '<p class="muted-copy">No upcoming occurrence is generated in the current window.</p>'}</div></section>`;
  }
  if (state.selectedPlaceTab === 'evidence') {
    const visualEvidence = artifacts.length ? `<section class="detail-section artifact-evidence-section"><p class="eyebrow">Retained visual evidence</p><h3>${artifacts.length} source image${artifacts.length === 1 ? '' : 's'}</h3>${artifactEvidenceList(artifacts)}</section>` : '';
    return `<section class="detail-section tab-intro"><p class="eyebrow">Evidence coverage</p><h3>${sources.length} connected sources${artifacts.length ? ` · ${artifacts.length} retained image${artifacts.length === 1 ? '' : 's'}` : ''}</h3><p class="analysis-copy">Sources are retained separately from the analyst synthesis. A strong venue can have a weak social channel, and silence on one source is not proof that an event does not exist.</p></section>${visualEvidence}<section class="detail-section"><div class="source-health-summary"><div><span>Research status</span><strong>${place.researchStatus === 'partial' ? 'Reviewed / partial' : 'Discovery-level'}</strong></div><div><span>Last venue check</span><strong>${escapeHtml(place.lastVerified || 'Unknown')}</strong></div><div><span>Source count</span><strong>${sources.length}</strong></div></div>${evidenceSourceList(sources)}</section><section class="detail-section"><p class="eyebrow">Interpretive boundary</p><h3>What remains uncertain</h3><p class="analysis-copy">Fields not stated by the connected sources remain unknown. In particular, proxy policy, pod formation, typical power level, and solo-arrival experience should not be inferred from silence.</p></section>`;
  }
  return `${placeEvaluationSummary(place)}<section class="detail-section"><div class="section-title-row"><div><p class="eyebrow">Analyst synthesis</p><h3>Practical verdict</h3></div></div><p class="analysis-copy">${escapeHtml(place.assessmentNotes)}</p>${place.assessmentDetail && place.assessmentDetail !== place.assessmentNotes ? `<details class="monitoring-details"><summary>Research detail</summary><p class="analysis-copy">${escapeHtml(place.assessmentDetail)}</p></details>` : ''}</section>
    <section class="detail-section"><div class="section-title-row"><div><p class="eyebrow">Fit dimensions</p><h3>Current working assessment</h3></div><button class="why-button" data-action="explain-scores">Why these scores?</button></div><div class="score-bars">${assessmentBars(place)}</div></section>
    <section class="detail-section"><div class="section-title-row"><div><p class="eyebrow">Known schedule</p><h3>Event series</h3></div><button class="text-button" data-place-tab="events">See all events</button></div><div class="series-list">${placeEvents.length ? placeEvents.slice(0, 4).map((event) => seriesRow(event)).join('') : '<p class="muted-copy">No normalized event series yet. This is not proof that the venue has no Magic events.</p>'}</div></section>
    <section class="detail-section two-column-section"><div><p class="eyebrow">Personal continuity</p><h3>Your rating & notes</h3><div class="rating-row" aria-label="Rate this place">${[1,2,3,4,5].map((value) => `<button class="star ${value <= rating ? 'active' : ''}" data-rating="${value}" data-entity="place:${place.id}" aria-label="${value} stars">★</button>`).join('')}</div>${noteComposer(`place:${place.id}`, 'What did it feel like in person?')}</div><div><p class="eyebrow">Source map</p><h3>${sources.length} connected sources</h3><div class="source-list">${sources.slice(0, 5).map((item) => sourceRow(item)).join('') || '<p class="muted-copy">Source mapping incomplete.</p>'}</div><button class="text-button evidence-jump" data-place-tab="evidence">Review all evidence →</button></div></section>`;
}

function assessmentBars(place) {
  const labels = { commanderActivity: 'Commander activity', meetupAccessibility: 'Solo-arrival access', communityContinuity: 'Community continuity', newPlayerIntegration: 'New-player integration', physicalEnvironment: 'Physical environment', scheduleReliability: 'Schedule reliability', homeGroupPotential: 'Home-pod potential' };
  return Object.entries(place.assessment || {}).filter(([, value]) => typeof value === 'number').map(([key, value]) => `<div class="score-row"><span>${labels[key] || key}</span><div class="score-track"><i style="width:${value * 20}%"></i></div><strong>${value}/5</strong></div>`).join('');
}

function scoreBreakdown(place) {
  const labels = {
    commanderActivity: 'Commander activity',
    meetupAccessibility: 'Solo-arrival access',
    communityContinuity: 'Community continuity',
    newPlayerIntegration: 'New-player integration',
    physicalEnvironment: 'Physical environment',
    scheduleReliability: 'Schedule reliability',
    homeGroupPotential: 'Home-pod potential'
  };
  const explanations = {
    commanderActivity: 'How much useful Magic opportunity appears to exist for your preferred play.',
    meetupAccessibility: 'Whether the sources say anything that makes showing up alone feel easier.',
    communityContinuity: 'Whether this looks like a repeat-visit scene rather than a one-off stop.',
    newPlayerIntegration: 'Signals that the store helps people slot into games without already knowing the room.',
    physicalEnvironment: 'What the sources imply about usable play space, comfort, and scale.',
    scheduleReliability: 'How dependable the recurring schedule looks across official and secondary surfaces.',
    homeGroupPotential: 'Whether the place seems promising for meeting nearby people you might play with again.'
  };
  return Object.entries(place.assessment || {}).filter(([, value]) => typeof value === 'number').map(([key, value]) => `
    <div class="dimension-card">
      <div class="dimension-head">
        <strong>${labels[key] || key}</strong>
        <span>${value}/5</span>
      </div>
      <div class="score-track large"><i style="width:${value * 20}%"></i></div>
      <p>${explanations[key] || 'This dimension contributes to the overall fit grade.'}</p>
    </div>
  `).join('');
}

function seriesRow(event) {
  return `<button class="series-row" data-event-id="${event.id}" data-date="${event.date || event.startDate}"><span class="format-mark ${formatClass(event)}">${formatShort(event)}</span><span><strong>${escapeHtml(event.title)}</strong><small>${event.recurrence?.frequency === 'weekly' ? `${dayName(event.recurrence.dayOfWeek)} · ${formatTime(event.recurrence.startTime)} · recurring` : event.date || 'Dated event'}</small></span><span class="status-chip ${event.confidence === 'high' ? 'mint' : 'amber'}">${event.confidence}</span></button>`;
}

function renderCommunities() {
  const surfaces = communitySurfaces();
  const formalHubs = COMMUNITY_SEED.map(communityHubFromCommunity).filter(communityHubMatchesSearch);
  const visibleHubs = state.favoritesOnly ? formalHubs.filter(isCommunityHubFollowed) : formalHubs;
  const chatter = communityDigestSignals();
  const visibleSurfaces = state.favoritesOnly
    ? surfaces.filter((surface) => state.personal.favorites[`place:${surface.place?.id}`] || state.personal.favorites[`community:${surface.community?.id}`])
    : surfaces;
  const filteredSurfaces = filterCommunitySurfaces(visibleSurfaces);
  const activeChannels = recentlyActiveCommunityChannels(visibleSurfaces);
  const needsReplay = surfaces.filter((surface) => surface.replayStatus === 'needs_replay').length;
  const inspected = surfaces.filter((surface) => surface.replayStatus === 'inspected').length;
  document.getElementById('communityGrid').innerHTML = `${communityDigestSection(chatter)}
    ${communityNetworkSection(visibleHubs)}
    ${recentlyActiveChannelsSection(activeChannels)}
    ${communicationRoutesSection(filteredSurfaces, needsReplay, inspected)}`;
}

function communityDigestSignals() {
  return rankedSignals().filter((signal) => {
    if (isSignalRead(signal.id)) return false;
    if (['dismissed', 'stale'].includes(signal.status)) return false;
    const src = source(signal.sourceId);
    if (!src || !isCommunitySurfaceSource(src)) return false;
    const text = `${signal.summary} ${signal.details} ${signal.suggestedAction}`.toLowerCase();
    const personal = signal.category === 'mention' || /\byou\b|metavirus/.test(text);
    const planConversation = signal.category === 'event_opportunity'
      && /meet|join|invite|confirm|plan|vote|looking for|lfg|bar|brewery|venue|host/.test(text);
    const usefulChatter = signal.category === 'community_activity'
      && !/route|first content read|content replay|source|operational|captured|monitoring/.test(text);
    return personal || planConversation || usefulChatter;
  }).sort((a, b) => communityDigestRank(b) - communityDigestRank(a)
    || String(b.observedAt || b.capturedAt).localeCompare(String(a.observedAt || a.capturedAt))).slice(0, 6);
}

function communityDigestRank(signal) {
  const text = `${signal.summary} ${signal.details}`.toLowerCase();
  const personal = signal.category === 'mention' || /\byou\b|metavirus/.test(text);
  const plan = signal.category === 'event_opportunity' || /meet|join|invite|confirm|plan|lfg/.test(text);
  return (personal ? 1000 : 0) + (plan ? 300 : 0) + signalRank(signal);
}

function communityDigestSection(signals) {
  return `<section class="community-section community-chatter-section">
    <div class="section-title-row"><div><p class="eyebrow coral">Community digest</p><h2>Worth catching up on</h2><p class="muted-copy">Useful conversation without the Discord scavenger hunt. Your invitations and mentions come first, followed by plans, venue ideas, and event-adjacent chatter.</p></div></div>
    ${signals.length ? `<div class="community-chatter-list">${signals.map(communityChatterCard).join('')}</div>` : emptyState('Nothing useful to catch up on', 'Routine chatter stays out; this area fills when a conversation could help you find people, places, or plans.')}
  </section>`;
}

function communityChatterCard(signal) {
  const observed = signal.observedAt || signal.capturedAt;
  const src = source(signal.sourceId);
  const sourceCommunity = signalSourceCommunity(signal);
  const threadUrl = signal.evidenceUrl || src?.url || '';
  const linkedEvent = communityEventForSignal(signal);
  const linkedEventDate = linkedEvent ? (linkedEvent.occurrenceDate || parseDate(linkedEvent.date || linkedEvent.startDate)) : null;
  const text = `${signal.summary} ${signal.details}`.toLowerCase();
  const personal = signal.category === 'mention' || /\byou\b|metavirus/.test(text);
  const status = linkedEvent ? { label: 'Confirmed plan', tone: 'mint' }
    : signal.status === 'needs_followup' ? { label: 'Tentative', tone: 'amber' }
      : personal ? { label: 'For you', tone: 'coral' }
        : { label: 'Community chatter', tone: 'sky' };
  const planMeta = linkedEvent ? communityPlanMeta(linkedEvent) : '';
  return `<article class="community-chatter-card ${status.tone}">
    <div class="community-chatter-kicker"><span class="status-chip ${status.tone}">${status.label}</span><span>${escapeHtml(formatFreshnessDate(observed))}</span></div>
    <h3>${escapeHtml(signal.summary)}</h3>
    ${planMeta}
    <p>${escapeHtml(truncate(signal.details || signal.suggestedAction || 'Open the conversation for context.', 260))}</p>
    <div class="community-chatter-targets">${communityChatterTargets(signal, sourceCommunity)}</div>
    <div class="community-chatter-actions">
      ${linkedEvent ? `<button class="primary-button compact-action" data-event-id="${escapeHtml(linkedEvent.id)}" ${linkedEventDate ? `data-date="${dateKey(linkedEventDate)}"` : ''}>Open plan</button>` : ''}
      ${threadUrl ? `<a class="soft-button" href="${escapeHtml(threadUrl)}" target="_blank" rel="noreferrer">Open thread ↗</a>` : ''}
      <button class="soft-button" data-action="open-signal" data-signal-id="${escapeHtml(signal.id)}">Details</button>
      <button class="soft-button" data-action="mark-signal-read" data-signal-id="${escapeHtml(signal.id)}">Hide</button>
    </div>
  </article>`;
}

function signalSourceCommunity(signal) {
  return COMMUNITY_SEED.find((item) => (item.sourceIds || []).includes(signal.sourceId)) || null;
}

function communityChatterTargets(signal, sourceCommunity) {
  const targets = [];
  if (sourceCommunity) targets.push(`<button data-community-id="${escapeHtml(sourceCommunity.id)}">From ${escapeHtml(sourceCommunity.name)}</button>`);
  if (signal.relatedEntityType === 'venue') {
    const place = store(signal.relatedEntityId);
    if (place) targets.push(`<button data-place-id="${escapeHtml(place.id)}">Mentions ${escapeHtml(place.name)}</button>`);
  } else if (signal.relatedEntityType === 'community' && signal.relatedEntityId !== sourceCommunity?.id) {
    const relatedCommunity = community(signal.relatedEntityId);
    if (relatedCommunity) targets.push(`<button data-community-id="${escapeHtml(relatedCommunity.id)}">About ${escapeHtml(relatedCommunity.name)}</button>`);
  }
  return targets.join('');
}

function communityEventForSignal(signal) {
  const candidates = DATA.events.filter((event) => {
    if (event.status === 'cancelled' || event.occurrenceStatus === 'cancelled') return false;
    if (!(event.sourceIds || []).includes(signal.sourceId)) return false;
    if (signal.relatedEntityType === 'community' && event.communityId !== signal.relatedEntityId) return false;
    return true;
  });
  return candidates.sort((a, b) => {
    const aDate = a.occurrenceDate || parseDate(a.date || a.startDate);
    const bDate = b.occurrenceDate || parseDate(b.date || b.startDate);
    return (aDate?.getTime() || Infinity) - (bDate?.getTime() || Infinity);
  })[0] || null;
}

function communityPlanMeta(event) {
  const occurrence = event.occurrenceDate || parseDate(event.date || event.startDate);
  const place = store(event.storeId);
  if (!occurrence || !place) return '';
  return `<div class="community-plan-meta"><span>${escapeHtml(occurrence.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }))}</span><strong>${formatTime(eventStartTime(event))}</strong><button data-place-id="${escapeHtml(place.id)}">${escapeHtml(place.name)}</button></div>`;
}

function communityNetworkSection(hubs) {
  return `<section class="community-section community-network-section">
    <div class="section-title-row"><div><p class="eyebrow violet">${hubs.length} communit${hubs.length === 1 ? 'y' : 'ies'}</p><h2>Communities</h2><p class="muted-copy">Regional groups stay visible here. Store Discords remain important chatter sources and live in the compact channel directory below.</p></div></div>
    ${hubs.length ? `<div class="community-network-grid">${hubs.map(communityNetworkCard).join('')}</div>` : emptyState('No communities match', 'Clear the current search or favorites filter to see the regional community list.')}
  </section>`;
}

function communityNetworkCard(hub) {
  const favorite = isCommunityHubFollowed(hub);
  const sourceUrl = hub.primarySource?.url || '';
  const profile = communityProfileData(hub.community);
  return `<article class="community-network-card" data-community-id="${escapeHtml(hub.community.id)}" role="button" tabindex="0" aria-label="Open ${escapeHtml(hub.name)} community profile">
    <div class="community-network-head"><span class="community-symbol small">${communitySurfaceIcon('Community')}</span><div><strong>${escapeHtml(hub.name)}</strong><small>${escapeHtml(hub.linkedLabel)}</small></div><button class="heart-button ${favorite ? 'active' : ''}" data-favorite="${escapeHtml(hub.favoriteKey)}" aria-label="${favorite ? 'Unfollow' : 'Follow'} ${escapeHtml(hub.name)}">${heartIcon()}</button></div>
    <div class="community-card-status"><button class="status-chip ${profile.monitoring.tone}" data-community-id="${escapeHtml(hub.community.id)}" data-community-open-tab="sources">${escapeHtml(profile.monitoring.label)}</button><small>${escapeHtml(profile.monitoring.detail)}</small></div>
    <p>${escapeHtml(communityUsefulness(hub.community))}</p>
    ${communityCardHighlight(profile)}
    <div class="community-card-counts"><button data-community-id="${escapeHtml(hub.community.id)}" data-community-open-tab="events"><strong>${profile.upcoming.length}</strong> upcoming</button><button data-community-id="${escapeHtml(hub.community.id)}" data-community-open-tab="connections"><strong>${profile.connections.length}</strong> connection${profile.connections.length === 1 ? '' : 's'}</button><button data-community-id="${escapeHtml(hub.community.id)}" data-community-open-tab="events"><strong>${profile.locations.length}</strong> host${profile.locations.length === 1 ? '' : 's'}</button></div>
    <div class="community-network-actions">${sourceUrl ? `<a class="soft-button" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">Open Discord ↗</a>` : ''}<button class="soft-button" data-community-id="${escapeHtml(hub.community.id)}">Details</button></div>
  </article>`;
}

function communityCardHighlight(profile) {
  const event = profile.upcoming[0];
  if (event) {
    const occurrence = event.occurrenceDate || parseDate(event.date || event.startDate);
    return `<button class="community-network-finding" data-event-id="${escapeHtml(event.id)}" ${occurrence ? `data-date="${dateKey(occurrence)}"` : ''}><span>Next community event</span>${escapeHtml(event.title)}${communityHostLabel(event) ? ` · ${escapeHtml(communityHostLabel(event))}` : ''} →</button>`;
  }
  const connection = profile.connections[0];
  if (connection) return `<button class="community-network-finding social" data-action="open-signal" data-signal-id="${escapeHtml(connection.id)}"><span>Your connection</span>${escapeHtml(connection.summary)} →</button>`;
  const signal = profile.signals[0];
  if (signal) return `<button class="community-network-finding" data-action="open-signal" data-signal-id="${escapeHtml(signal.id)}"><span>Last useful activity</span>${escapeHtml(signal.summary)} →</button>`;
  return `<button class="community-network-finding quiet" data-community-id="${escapeHtml(profile.community.id)}" data-community-open-tab="activity"><span>No recent useful activity</span>Monitoring state is shown above; open the activity view for the durable record.</button>`;
}

function recentlyActiveCommunityChannels(surfaces) {
  const cutoff = Date.now() - (45 * 24 * 60 * 60 * 1000);
  const channels = new Map();
  surfaces.forEach((surface) => {
    const recentSignals = DATA.signals.filter((signal) => {
      if (signal.sourceId !== surface.source.id || isSignalRead(signal.id) || ['dismissed', 'stale'].includes(signal.status)) return false;
      const text = `${signal.summary} ${signal.details} ${signal.suggestedAction}`.toLowerCase();
      if (!['mention', 'event_opportunity', 'community_activity'].includes(signal.category)) return false;
      if (/route|first content read|content replay|source health|operational|captured|monitoring|needs (?:a )?first .*read/.test(text)) return false;
      const observed = new Date(signal.observedAt || signal.capturedAt || 0).getTime();
      return Number.isFinite(observed) && observed >= cutoff;
    });
    if (!recentSignals.length) return;
    const sampleSignal = recentSignals[0];
    const sourceCommunity = signalSourceCommunity(sampleSignal) || surface.community;
    const relatedPlace = sampleSignal.relatedEntityType === 'venue' ? store(sampleSignal.relatedEntityId) : null;
    const key = sourceCommunity ? `community:${sourceCommunity.id}` : relatedPlace ? `place:${relatedPlace.id}` : `source:${surface.source.id}`;
    const current = channels.get(key) || { ...surface, recentSignals: [] };
    current.recentSignals.push(...recentSignals);
    if (!isOpenableCommunityUrl(current.source.url) && isOpenableCommunityUrl(surface.source.url)) current.source = surface.source;
    channels.set(key, current);
  });
  return [...channels.values()].map((channel) => {
    channel.recentSignals = [...new Map(channel.recentSignals.map((signal) => [signal.id, signal])).values()]
      .sort((a, b) => String(b.observedAt || b.capturedAt).localeCompare(String(a.observedAt || a.capturedAt)));
    channel.latestSignal = channel.recentSignals[0];
    return channel;
  }).sort((a, b) => String(b.latestSignal?.observedAt || b.latestSignal?.capturedAt).localeCompare(String(a.latestSignal?.observedAt || a.latestSignal?.capturedAt))).slice(0, 6);
}

function recentlyActiveChannelsSection(channels) {
  if (!channels.length) return '';
  return `<section class="community-section community-active-channels-section">
    <div class="section-title-row"><div><p class="eyebrow sky">${channels.length} active lately</p><h2>Channels with useful activity</h2><p class="muted-copy">A compact view of Discords and community routes that recently produced planning-relevant chatter. Quiet channels stay in the directory below.</p></div></div>
    <div class="community-active-channel-list">${channels.map(recentlyActiveChannelCard).join('')}</div>
  </section>`;
}

function recentlyActiveChannelCard(channel) {
  const signal = channel.latestSignal;
  const sourceCommunity = signalSourceCommunity(signal) || channel.community;
  const relatedPlace = signal.relatedEntityType === 'venue' ? store(signal.relatedEntityId) : null;
  const targetAction = sourceCommunity
    ? `data-community-id="${escapeHtml(sourceCommunity.id)}"`
    : relatedPlace || channel.place
      ? `data-place-id="${escapeHtml((relatedPlace || channel.place).id)}"`
      : '';
  const targetLabel = sourceCommunity?.name || relatedPlace?.name || channel.place?.name || channel.source.label;
  const sourceUrl = signal.evidenceUrl || channel.source.url || '';
  return `<article class="community-active-channel-card">
    <button class="community-active-channel-target" ${targetAction}><span class="community-symbol small">${communitySurfaceIcon(channel.kind)}</span><span><strong>${escapeHtml(targetLabel)}</strong><small>${escapeHtml(channel.kind)} · ${escapeHtml(formatFreshnessDate(signal.observedAt || signal.capturedAt))}${channel.recentSignals.length > 1 ? ` · ${channel.recentSignals.length} useful threads` : ''}</small></span></button>
    <button class="community-active-channel-finding" data-action="open-signal" data-signal-id="${escapeHtml(signal.id)}">${escapeHtml(truncate(signal.summary, 150))}</button>
    <div class="community-active-channel-actions">${sourceUrl ? `<a class="icon-link" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer" aria-label="Open ${escapeHtml(targetLabel)} channel" title="Open channel">↗</a>` : ''}<button class="icon-button" data-action="mark-signal-read" data-signal-id="${escapeHtml(signal.id)}" aria-label="Hide this activity" title="Hide">×</button></div>
  </article>`;
}

function communicationRoutesSection(surfaces, needsReplay, inspected) {
  return `<section class="community-section community-routes-section">
    <details class="community-route-queue">
      <summary><span><strong>All store channels</strong><small>${surfaces.length} Discord, social, and announcement routes</small></span><span>Browse</span></summary>
      <p class="community-route-intro">Useful shortcuts when you want a particular store’s conversation. These are communication routes, not separate communities.</p>
      ${communitySurfaceFilters()}
      <div class="community-surface-list">${surfaces.length ? surfaces.map(communitySurfaceCard).join('') : '<p class="muted-copy">No routes match the current search and filter.</p>'}</div>
      <p class="community-route-status">${needsReplay} await a useful content read · ${inspected} have accepted context</p>
    </details>
  </section>`;
}

function isOpenableCommunityUrl(url) {
  return /^https?:\/\//i.test(url || '');
}

function communityHubFromCommunity(community) {
  const relatedSignals = DATA.signals.filter((signal) => {
    if (['dismissed', 'stale'].includes(signal.status)) return false;
    return (signal.relatedEntityType === 'community' && signal.relatedEntityId === community.id)
      || (community.sourceIds || []).includes(signal.sourceId);
  });
  const primarySource = (community.sourceIds || []).map(source).filter((item) => item && isOpenableCommunityUrl(item.url)).sort((a, b) => (/discord/i.test(b.label) ? 1 : 0) - (/discord/i.test(a.label) ? 1 : 0))[0] || null;
  const latestSignal = [...relatedSignals].sort((a, b) => signalRank(b) - signalRank(a))[0] || null;
  return {
    id: `community:${community.id}`,
    type: /orange county|los angeles|south bay|regional/i.test(`${community.region} ${community.summary}`) ? 'Regional community' : 'Independent group',
    name: community.name,
    linkedLabel: community.region || 'Regional community',
    usefulness: communityUsefulness(community),
    latestSignal,
    primarySource,
    lastChecked: latestCommunitySourceDate(community.sourceIds),
    favoriteKey: `community:${community.id}`,
    community,
    score: (latestSignal ? signalRank(latestSignal) : 0) + (community.id === 'legendary-creature-club' ? 78 : community.status === 'partial' ? 62 : 48),
    lowValue: false
  };
}

function communityUsefulness(community) {
  if (community.id === 'legendary-creature-club') return 'Nearby Commander meetups and repeat-player connections across Long Beach and the South Bay.';
  if (community.id === 'infinite-loop-mtg') return 'Regional Magic discovery when a particularly strong event or organizer signal justifies the longer trip.';
  if (community.id === 'mtg-oc') return 'Cross-store Orange County event discovery and player coordination.';
  return community.signal || community.summary;
}

function latestCommunitySourceDate(sourceIds = []) {
  return sourceIds.map(source).filter(Boolean).map((item) => item.lastChecked).filter(Boolean).sort().reverse()[0] || '';
}

function isCommunityHubFollowed(hub) {
  return !!(hub.favoriteKey && state.personal.favorites[hub.favoriteKey]);
}

function communityHubMatchesSearch(hub) {
  if (!state.search) return true;
  return `${hub.name} ${hub.type} ${hub.linkedLabel} ${hub.usefulness} ${hub.latestSignal?.summary || ''}`.toLowerCase().includes(state.search);
}

function communitySurfaces() {
  const seen = new Set();
  const surfaces = [];
  for (const place of DATA.stores) {
    for (const sourceId of place.sourceIds || []) {
      const src = source(sourceId);
      if (!src || !isCommunitySurfaceSource(src)) continue;
      const key = `${place.id}:${src.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      surfaces.push(completeCommunitySurface({ id: key, source: src, place, ...communitySurfaceMeta(src, place) }));
    }
  }
  for (const community of COMMUNITY_SEED) {
    for (const sourceId of community.sourceIds || []) {
      const src = source(sourceId);
      if (!src || !isCommunitySurfaceSource(src)) continue;
      const key = `${community.id}:${src.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      surfaces.push(completeCommunitySurface({ id: key, source: src, community, ...communitySurfaceMeta(src, null, community) }));
    }
  }
  return surfaces.sort((a, b) => communitySurfaceRank(b) - communitySurfaceRank(a) || compareText(a.source.label, b.source.label));
}

function completeCommunitySurface(surface) {
  const priorityScore = communityPriorityScore(surface);
  return { ...surface, priorityScore, priorityReason: communityPriorityReason(surface, priorityScore) };
}

function isCommunitySurfaceSource(src) {
  const text = `${src.label || ''} ${src.url || ''} ${src.type || ''}`.toLowerCase();
  if (/discord|linktr|meetup|reddit|community discussion|group|server/.test(text)) return true;
  if (/instagram|facebook/.test(text)) return src.status === 'current' || /synthesis|content|weekly|event|announcement|lineup|stale/.test(text);
  return false;
}

function communitySurfaceMeta(src, place, community) {
  const text = `${src.label || ''} ${src.url || ''} ${src.type || ''}`.toLowerCase();
  const isDiscord = /discord/.test(text);
  const isSynthesis = /synthesis|content|channel|announcements|commander channel|promo image/.test(text) && !/route|invite|landing/.test(text);
  const isRouteOnly = /route|invite|landing|linktree/.test(text) || (isDiscord && !isSynthesis);
  const isStale = src.status === 'stale' || /stale|historical|reddit discussion|community discussion/.test(text);
  const relatedSignals = DATA.signals.filter((signal) => {
    if (signal.sourceId === src.id) return true;
    if (place && signal.relatedEntityType === 'venue' && signal.relatedEntityId === place.id) return true;
    if (community && signal.relatedEntityType === 'community' && signal.relatedEntityId === community.id) return true;
    return false;
  });
  const replayStatus = isStale ? 'stale_or_low' : isSynthesis ? 'inspected' : isRouteOnly ? 'needs_replay' : src.status === 'current' ? 'needs_replay' : 'stale_or_low';
  return {
    kind: isDiscord ? 'Discord' : /linktr/.test(text) ? 'Linktree/router' : /instagram/.test(text) ? 'Instagram' : /facebook/.test(text) ? 'Facebook' : /meetup/.test(text) ? 'Meetup' : /reddit/.test(text) ? 'Reddit/community discussion' : 'Community surface',
    replayStatus,
    relatedSignals,
    whyCare: communitySurfaceWhyCare(src, replayStatus),
    suggestedAction: replayStatus === 'inspected' ? 'Use as accepted context; refresh only when planning needs it.' : replayStatus === 'needs_replay' ? 'First-pass content replay when this venue/community becomes planning-relevant.' : 'Keep as context; do not spend cycles unless a new source/update appears.'
  };
}

function communitySurfaceWhyCare(src, replayStatus) {
  const text = `${src.label || ''} ${src.url || ''}`.toLowerCase();
  if (/discord/.test(text)) return replayStatus === 'inspected'
    ? 'Discord content can reveal turnout, event reliability, proxy texture, and newcomer/solo-arrival fit.'
    : 'A Discord route exists, but its content should not be treated as evidence until replayed.';
  if (/linktr/.test(text)) return 'Router pages often reveal the useful Discord, calendar, registration, and branch-specific social paths.';
  if (/instagram|facebook/.test(text)) return 'Store-controlled social routes can surface announcements, event graphics, cancellations, and current activity.';
  if (/meetup/.test(text)) return 'Meetup surfaces can reveal off-store coordination, RSVP texture, and recurring social play.';
  if (/reddit|community discussion/.test(text)) return 'Community discussion is context for reputation and fit, not canonical event proof.';
  return 'This is a communication or community-adjacent route tied to an accepted record.';
}

function communitySurfaceRank(surface) {
  const kindScore = surface.kind === 'Discord' ? 40 : surface.kind === 'Linktree/router' ? 28 : ['Meetup', 'Instagram', 'Facebook'].includes(surface.kind) ? 22 : 12;
  const statusScore = surface.replayStatus === 'needs_replay' ? 20 : surface.replayStatus === 'inspected' ? 16 : 4;
  const signalScore = surface.relatedSignals.length ? 15 : 0;
  return kindScore + statusScore + signalScore + communityPriorityScore(surface);
}

function communityPriorityScore(surface) {
  const place = surface.place;
  const text = `${surface.source.label || ''} ${surface.source.url || ''} ${place?.assessmentNotes || ''}`.toLowerCase();
  let score = 0;
  if (place?.distanceMiles != null && Number(place.distanceMiles) <= 12) score += 22;
  if (place?.researchStatus === 'partial') score += 10;
  if (place && (normalizedEvaluation(place)?.fitScore || 0) >= 3.8) score += 18;
  if (state.personal.favorites[`place:${place?.id}`] || state.personal.favorites[`community:${surface.community?.id}`]) score += 25;
  if (surface.kind === 'Discord') score += 24;
  if (surface.replayStatus === 'needs_replay') score += 16;
  if (surface.relatedSignals.length) score += 20;
  if (/source|stale|conflict|calendar|event|tournament|announcement|commander|draft|prerelease|proxy|lfg/.test(text)) score += 14;
  if (surface.replayStatus === 'stale_or_low') score -= 18;
  return score;
}

function communityPriorityReason(surface, score) {
  const place = surface.place;
  const text = `${surface.source.label || ''} ${surface.source.url || ''}`.toLowerCase();
  if (surface.relatedSignals.length) return 'Linked to an active Signal.';
  if (surface.kind === 'Discord' && /magic and monsters/i.test(place?.name || '')) return 'Likely to clarify current MTG commitment after source-health concerns.';
  if (surface.kind === 'Discord' && /projectccg/i.test(place?.name || '')) return 'Likely to reveal branch-specific coordination and event reliability.';
  if (surface.kind === 'Discord' && /jjs|jj's/i.test(place?.name || '')) return 'Already yielded Magic announcement/event graphics, so it is a high-signal route.';
  if (surface.kind === 'Discord' && place?.distanceMiles != null && Number(place.distanceMiles) <= 12) return 'Nearby Discord route could answer turnout, proxy, and cancellation questions quickly.';
  if (/linktr/.test(text)) return 'Router may expose the real calendar, Discord, or registration path.';
  if (/meetup|reddit|community discussion/.test(text)) return 'Community surface may explain where people coordinate outside store calendars.';
  if (place && (normalizedEvaluation(place)?.fitScore || 0) >= 3.8) return 'High-fit venue; community route may change whether it is worth trying soon.';
  if (score >= 70) return 'Good mix of relevance, route type, and unresolved coordination value.';
  return 'Useful context, but not a top inspection target unless this venue becomes relevant.';
}

function filterCommunitySurfaces(surfaces) {
  const query = state.search;
  const matching = query ? surfaces.filter((surface) => `${surface.source.label} ${surface.kind} ${surface.place?.name || ''} ${surface.place?.city || ''} ${surface.community?.name || ''} ${surface.community?.region || ''}`.toLowerCase().includes(query)) : surfaces;
  const filter = state.communitySurfaceFilter;
  if (filter === 'discord') return matching.filter((surface) => surface.kind === 'Discord');
  if (filter === 'needs') return matching.filter((surface) => surface.replayStatus === 'needs_replay');
  if (filter === 'inspected') return matching.filter((surface) => surface.replayStatus === 'inspected');
  if (filter === 'nearby') return matching.filter((surface) => surface.priorityScore >= 70);
  if (filter === 'low') return matching.filter((surface) => surface.replayStatus === 'stale_or_low' || surface.priorityScore < 45);
  return matching;
}

function communitySurfaceFilters() {
  const filters = [
    ['all', 'All routes'],
    ['discord', 'Discord'],
    ['inspected', 'Fresh / inspected'],
    ['needs', 'Needs context'],
    ['nearby', 'Nearby / high value'],
    ['low', 'Older / low priority']
  ];
  return `<div class="community-filter-row">${filters.map(([value, label]) => `<button class="${state.communitySurfaceFilter === value ? 'active' : ''}" data-community-filter="${value}">${label}</button>`).join('')}</div>`;
}

function communitySurfaceSection(title, copy, surfaces, options = {}) {
  if (!surfaces.length) return '';
  return `<section class="community-section ${options.priority ? 'community-priority-section' : ''}"><div class="section-title-row"><div><p class="eyebrow ${options.priority ? 'mint' : title === 'Needs replay' ? 'amber' : title === 'Inspected or synthesized' ? 'mint' : 'coral'}">${surfaces.length} route${surfaces.length === 1 ? '' : 's'}</p><h2>${escapeHtml(title)}</h2><p class="muted-copy">${escapeHtml(copy)}</p></div></div><div class="community-surface-list ${options.priority ? 'priority-list' : ''}">${surfaces.map(communitySurfaceCard).join('')}</div></section>`;
}

function communitySurfaceCard(surface) {
  const target = surface.place || surface.community;
  const targetButton = surface.place
    ? `<button class="change-inline-target" data-place-id="${escapeHtml(surface.place.id)}">${escapeHtml(surface.place.name)}</button>`
    : surface.community
      ? `<button class="change-inline-target" data-community-id="${escapeHtml(surface.community.id)}">${escapeHtml(surface.community.name)}</button>`
      : 'Unlinked';
  const status = surface.replayStatus === 'inspected'
    ? { label: 'Content inspected', tone: 'mint' }
    : surface.replayStatus === 'needs_replay'
      ? { label: 'Route captured / replay TBD', tone: 'amber' }
      : { label: 'Low-value or stale', tone: 'slate' };
  const signalLinks = surface.relatedSignals.slice(0, 2).map((signal) => `<span class="meta-chip">${escapeHtml(signal.categoryLabel || signal.category || 'Signal')}</span>`).join('');
  return `<article class="community-surface-card">
    <div class="community-surface-head"><span class="community-symbol small">${communitySurfaceIcon(surface.kind)}</span><div><h3>${escapeHtml(surface.source.label)}</h3><p>${targetButton}</p></div><span class="status-chip ${status.tone}">${status.label}</span></div>
    <div class="community-facts"><div><span>Surface type</span><strong>${escapeHtml(surface.kind)}</strong></div><div><span>Last checked</span><strong>${escapeHtml(surface.source.lastChecked || 'Unknown')}</strong></div><div><span>Monitoring status</span><strong>${escapeHtml(surface.suggestedAction)}</strong></div></div>
    <p><strong>${escapeHtml(surface.priorityReason)}</strong> ${escapeHtml(surface.whyCare)}</p>
    <div class="community-tags"><span class="meta-chip">${escapeHtml(surface.source.status || 'unknown')}</span>${signalLinks}<a class="meta-chip link-chip" href="${escapeHtml(surface.source.url)}" target="_blank" rel="noreferrer">Open source ↗</a></div>
  </article>`;
}

function communitySurfaceIcon(kind) {
  if (kind === 'Discord') return '◇';
  if (kind === 'Linktree/router') return '↗';
  if (kind === 'Instagram') return '◎';
  if (kind === 'Facebook') return 'f';
  if (kind === 'Meetup') return 'm';
  return '•';
}

function renderChanges() {
  const allItems = [...DATA.changes].sort((a, b) => compareText(b.detectedAt, a.detectedAt));
  const items = allItems.filter((change) => changeMatchesFilter(change, state.changeFilter));
  const latestAccepted = latestAcceptedChangeTimestamp();
  const latest = latestAccepted ? formatFreshnessDate(latestAccepted) : allItems[0]?.detectedAt ? formatFreshnessDate(allItems[0].detectedAt) : 'None yet';
  const unreadOnOpen = state.route === 'changes' ? state.changesUnreadOnOpen || 0 : unreadChangesCount();
  const unreadLabel = unreadOnOpen === 1 ? '1 new' : `${unreadOnOpen} new`;
  const unreadCopy = unreadOnOpen
    ? 'Opening Updates marks accepted records read.'
    : 'No new accepted updates since your last visit.';
  document.getElementById('changeList').innerHTML = `<div class="change-summary">
    <div><span>New since last visit</span><strong>${escapeHtml(unreadLabel)}</strong><p>${unreadCopy}</p></div>
    <div><span>Visible updates</span><strong>${items.length}<small> / ${allItems.length}</small></strong><p>Latest accepted: ${escapeHtml(latest)}</p></div>
    <div><span>Current filter</span><strong>${changeFilterLabel(state.changeFilter)}</strong><p>${changeFilterHelp(state.changeFilter)}</p></div>
  </div>${dailyAgentStatusPanel()}${items.length ? items.map((change) => changeRow(change)).join('') : emptyState('No updates in this filter', 'Try All updates or a different triage category.')}`;
}

function dailyAgentStatusPanel() {
  const agents = dailyAgentStatuses();
  if (!agents.length) return '';
  return `<section class="daily-agent-panel" aria-label="Daily automation status">
    <div class="section-title-row">
      <div><p class="eyebrow violet">Daily agents</p><h2>Automated surface sweeps</h2></div>
      <button class="text-button" data-route="research">Coverage details</button>
    </div>
    <p class="muted-copy">Quiet runs update monitoring state here without creating fake Updates. Useful findings still surface through Updates or Signals when they change planning.</p>
    <div class="daily-agent-grid">${agents.map(dailyAgentCard).join('')}</div>
  </section>`;
}

function dailyAgentStatuses() {
  const byId = new Map(DATA.dailyAgentStatuses.map((item) => [item.id, item]));
  return [
    normalizeDailyAgentStatus(byId.get('wpn'), { id: 'wpn', label: 'WPN / EventLink', route: 'events', actionLabel: 'Review events' }),
    normalizeDailyAgentStatus(byId.get('instagram'), { id: 'instagram', label: 'Instagram', route: 'research', actionLabel: 'Open coverage' }),
    normalizeDailyAgentStatus(byId.get('facebook'), { id: 'facebook', label: 'Facebook', route: 'research', actionLabel: 'Open coverage' }),
    normalizeDailyAgentStatus(byId.get('discord'), { id: 'discord', label: 'Discord', route: 'communities', actionLabel: 'Open communities' })
  ];
}

function normalizeDailyAgentStatus(row, fallback) {
  const status = row?.checkedAt
    ? freshnessStatus(row.checkedAt, row.id === 'discord' || row.id === 'wpn' ? 36 : 48, row.attentionCount ? 'attention' : 'active')
    : 'unknown';
  const headline = row
    ? dailyAgentHeadline(row)
    : 'No run state loaded yet';
  return {
    id: fallback.id,
    label: row?.label || fallback.label,
    status,
    headline,
    detail: row?.summary || 'Configured daily lane; waiting for aggregate run state.',
    checkedAt: row?.checkedAt || '',
    metric: row ? dailyAgentMetric(row) : 'configured',
    submetric: row ? dailyAgentSubmetric(row) : 'no public aggregate row yet',
    route: row?.route || fallback.route,
    actionLabel: row?.actionLabel || fallback.actionLabel
  };
}

function dailyAgentHeadline(row) {
  if (row.id === 'discord') return `${row.usefulCount} useful / ${row.quietCount} quiet / ${row.staleCount} stale`;
  return surfaceDispositionLabel(row.latestResult || 'checked');
}

function dailyAgentMetric(row) {
  if (row.id === 'discord') return `${row.primaryCount} watchlist channels`;
  if (row.id === 'wpn') return `${row.primaryCount} ingest updates/checks`;
  return `${row.primaryCount} checked surfaces`;
}

function dailyAgentSubmetric(row) {
  if (row.attentionCount) return `${row.attentionCount} need attention`;
  if (row.usefulCount) return `${row.usefulCount} useful checks retained`;
  if (row.id === 'discord') return 'read-only guard proven';
  return 'quiet/no-delta by default';
}

function dailyAgentCard(agent) {
  const tone = {
    active: 'mint',
    stale: 'amber',
    attention: 'coral',
    unknown: 'slate'
  }[agent.status] || 'slate';
  return `<article class="daily-agent-card ${tone}">
    <div>
      <span class="status-chip ${tone}">${escapeHtml(agent.status)}</span>
      <h3>${escapeHtml(agent.label)}</h3>
      <p>${escapeHtml(agent.headline)}</p>
    </div>
    <div class="daily-agent-meta">
      <span>${escapeHtml(agent.checkedAt ? `Last checked ${formatRelativeDate(agent.checkedAt)}` : 'No last-check timestamp')}</span>
      <span>${escapeHtml(agent.metric)}</span>
      <span>${escapeHtml(agent.submetric)}</span>
    </div>
    <p class="daily-agent-detail">${escapeHtml(agent.detail)}</p>
    <button class="change-action" data-route="${escapeHtml(agent.route)}">${escapeHtml(agent.actionLabel)} →</button>
  </article>`;
}

function freshnessStatus(value, freshHours, freshStatus = 'active') {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'unknown';
  const hours = (Date.now() - date.getTime()) / 36e5;
  if (hours <= freshHours) return freshStatus;
  if (hours <= freshHours * 4) return 'stale';
  return 'attention';
}

function surfaceDispositionLabel(value) {
  const text = value ? value.replaceAll('_', ' ') : 'checked';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatRelativeDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'unknown';
  const hours = Math.round((Date.now() - date.getTime()) / 36e5);
  if (Math.abs(hours) < 1) return 'just now';
  if (hours < 48) return `${hours}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function changeRow(change) {
  const tone = changeTone(change);
  const title = changeTitle(change);
  const status = reviewStatusDisplay(change);
  return `<article class="change-row"><div class="timeline-node ${tone}"></div><time><strong>${new Date(change.detectedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</strong><small>${new Date(change.detectedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</small></time><div class="change-body"><div class="change-title-row"><h3>${title}</h3><span class="change-type-chip">${escapeHtml(change.changeType?.replaceAll('_', ' ') || 'research update')}</span></div><p>${linkifyChangeText(change.details || 'The research record was updated.')}</p>${changeEventPreview(change)}<div class="change-clicklets">${changeTargetButtons(change)}</div></div><span class="review-state ${status.tone}">${status.label}</span></article>`;
}

function reviewStatusDisplay(change) {
  const value = (change.reviewStatus || '').toLowerCase();
  if (value === 'accepted') return { label: 'Accepted', tone: 'accepted' };
  if (value === 'proposed') return { label: 'Pending proposal', tone: 'pending' };
  if (value === 'rejected' || value === 'declined') return { label: 'Not accepted', tone: 'rejected' };
  return { label: value ? value.replaceAll('_', ' ') : 'Recorded', tone: 'recorded' };
}

function changeTitle(change) {
  if (change.changeType === 'event_ingest_delta') {
    const matchedEvents = eventIngestDeltaMatches(change);
    if (matchedEvents.length) {
      const owner = eventIngestDisplayOwner(change, matchedEvents);
      return `${escapeHtml(owner.name)}: ${matchedEvents.length} newly listed event${matchedEvents.length === 1 ? '' : 's'}`;
    }
  }
  const rawSummary = change.summary || 'Research record updated';
  const summary = linkifyChangeText(rawSummary);
  const escapedSummary = escapeHtml(rawSummary);
  if (summary !== escapedSummary) return summary;
  return escapedSummary;
}

function changeTargetButtons(change) {
  const target = structuredChangeTarget(change);
  if (target) return `<button class="change-action" ${target.attribute}>${escapeHtml(target.label)} →</button>`;
  const route = changeRoute(change);
  return `<button class="change-action" data-route="${route}">${route === 'events' ? 'Browse events' : route === 'research' ? 'Coverage' : 'Browse places'} →</button>`;
}

function changeEventPreview(change) {
  if (!change || change.changeType !== 'event_ingest_delta') return '';
  const matchedEvents = eventIngestDeltaMatches(change).filter((event) => !isEventHidden(event));
  if (!matchedEvents.length) return '';
  const preview = matchedEvents.slice(0, 3).map((event) => {
    const occurrence = event.occurrenceDate || parseDate(event.date || event.startDate);
    const when = occurrence instanceof Date && !Number.isNaN(occurrence.getTime())
      ? occurrence.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      : 'dated';
    return `<button class="change-event-chip" data-event-id="${escapeHtml(event.id)}" ${occurrence ? `data-date="${dateKey(occurrence)}"` : ''}><strong>${escapeHtml(event.title)}</strong><small>${escapeHtml(when)}</small></button>`;
  }).join('');
  const more = matchedEvents.length > 3
    ? `<button class="change-event-chip more" data-action="open-change-events" data-change-id="${escapeHtml(change.id)}">+${matchedEvents.length - 3} more</button>`
    : '';
  return `<div class="change-event-preview">${preview}${more}</div>`;
}

function changeById(id) {
  return DATA.changes.find((item) => item.id === id) || null;
}

function eventIngestDeltaMatches(change) {
  if (!change || change.changeType !== 'event_ingest_delta' || !['venue', 'community'].includes(change.entityType) || !change.entityId) return [];
  const detectedAt = change.detectedAt ? new Date(change.detectedAt) : null;
  const detectedMs = detectedAt && !Number.isNaN(detectedAt.getTime()) ? detectedAt.getTime() : null;
  const changeText = `${change.summary || ''} ${change.details || ''}`.toLowerCase();
  const matched = DATA.events.filter((event) => {
    const entityMatched = (change.entityType === 'venue' ? event.storeId : event.communityId) === change.entityId;
    const titleMatched = event.title && event.title.length > 6 && changeText.includes(event.title.toLowerCase());
    if (!entityMatched && !titleMatched) return false;
    if (!event.createdAt || !detectedMs) return false;
    const created = new Date(event.createdAt);
    if (Number.isNaN(created.getTime())) return false;
    return Math.abs(created.getTime() - detectedMs) <= 30 * 60 * 1000;
  });
  return matched.sort((a, b) => {
    const aDate = a.occurrenceDate || parseDate(a.date || a.startDate);
    const bDate = b.occurrenceDate || parseDate(b.date || b.startDate);
    return aDate - bDate || compareText(eventStartTime(a), eventStartTime(b)) || compareText(a.title, b.title);
  });
}

function eventIngestDisplayOwner(change, events = []) {
  const communityIds = [...new Set(events.map((event) => event.communityId).filter(Boolean))];
  if (communityIds.length === 1) {
    const item = community(communityIds[0]);
    if (item) return { type: 'community', id: item.id, name: item.name, community: item, place: null };
  }
  const venueIds = [...new Set(events.map((event) => event.storeId).filter(Boolean))];
  if (venueIds.length === 1 && !communityIds.length) {
    const item = store(venueIds[0]);
    if (item) return { type: 'venue', id: item.id, name: item.name, community: null, place: item };
  }
  if (change.entityType === 'community') {
    const item = community(change.entityId);
    if (item) return { type: 'community', id: item.id, name: item.name, community: item, place: null };
  }
  if (change.entityType === 'venue') {
    const item = store(change.entityId);
    if (item) return { type: 'venue', id: item.id, name: item.name, community: null, place: item };
  }
  return { type: change.entityType || 'dataset', id: change.entityId || '', name: 'Daily surveyor', community: null, place: null };
}

function structuredChangeTarget(change) {
  if (change.changeType === 'event_ingest_delta') {
    const matchedEvents = eventIngestDeltaMatches(change);
    if (matchedEvents.length === 1) {
      const event = matchedEvents[0];
      const occurrenceDate = event.occurrenceDate || parseDate(event.date || event.startDate);
      return {
        label: 'Open new event',
        attribute: `data-event-id="${escapeHtml(event.id)}" ${occurrenceDate ? `data-date="${dateKey(occurrenceDate)}"` : ''}`
      };
    }
    if (matchedEvents.length > 1) {
      return {
        label: `Open ${matchedEvents.length} new events`,
        attribute: `data-action="open-change-events" data-change-id="${escapeHtml(change.id)}"`
      };
    }
  }

  const type = (change.entityType || '').toLowerCase();
  const id = change.entityId || '';
  if (!id || type === 'dataset') return null;

  if (type === 'venue') {
    const place = store(id);
    if (place) return { label: place.name, attribute: `data-place-id="${escapeHtml(id)}"` };
  }

  if (type === 'community') {
    const community = COMMUNITY_SEED.find((item) => item.id === id);
    if (community) return { label: community.name, attribute: `data-community-id="${escapeHtml(id)}"` };
  }

  if (type === 'event' || type === 'event_series' || type === 'event_occurrence') {
    const event = eventById(id) || DATA.events.find((item) => item.seriesId === id);
    if (event) return { label: event.title, attribute: `data-event-id="${escapeHtml(event.id)}"` };
  }

  return null;
}

function linkifyChangeText(rawText = '') {
  const candidates = changeLinkCandidates();
  if (!candidates.length) return escapeHtml(rawText);
  const pattern = new RegExp(candidates.map((item) => escapeRegExp(item.label)).join('|'), 'gi');
  let html = '';
  let lastIndex = 0;
  for (const match of rawText.matchAll(pattern)) {
    const label = match[0];
    const index = match.index ?? 0;
    const candidate = candidates.find((item) => item.label.toLowerCase() === label.toLowerCase());
    if (!candidate) continue;
    html += escapeHtml(rawText.slice(lastIndex, index));
    html += candidateLink(candidate, label);
    lastIndex = index + label.length;
  }
  html += escapeHtml(rawText.slice(lastIndex));
  return html;
}

function openChangeEvents(changeId) {
  const change = changeById(changeId);
  if (!change) return;
  const matchedEvents = eventIngestDeltaMatches(change);
  const place = store(change.entityId);
  const eventRows = matchedEvents.length
    ? matchedEvents.map((event) => {
        const occurrence = event.occurrenceDate || parseDate(event.date || event.startDate);
        return `<button class="occurrence-row" data-event-id="${escapeHtml(event.id)}" ${occurrence ? `data-date="${dateKey(occurrence)}"` : ''}><time><strong>${occurrence ? occurrence.getDate() : '—'}</strong>${occurrence ? occurrence.toLocaleDateString(undefined, { month: 'short' }) : ''}</time><span><strong>${escapeHtml(event.title)}</strong><small>${occurrence ? occurrence.toLocaleDateString(undefined, { weekday: 'long' }) : 'Dated event'} · ${formatTime(eventStartTime(event))}</small></span><span class="status-chip ${evidenceLabel(event).tone}">${evidenceLabel(event).label}</span></button>`;
      }).join('')
    : '<p class="muted-copy">This update no longer maps cleanly to live event rows.</p>';
  openDrawer(`<div class="drawer-kicker"><span class="status-chip violet">Update batch</span><span class="status-chip slate">${matchedEvents.length} event${matchedEvents.length === 1 ? '' : 's'}</span></div><h1 id="drawerTitle">${escapeHtml(change.summary || 'New event batch')}</h1><p class="drawer-lead">${escapeHtml(change.details || 'These events were added by the automated ingest pipeline.')}</p><section class="drawer-section"><p class="eyebrow">Linked venue</p><h2>${place ? escapeHtml(place.name) : 'Venue update'}</h2>${place ? `<button class="soft-button" data-place-id="${escapeHtml(place.id)}">Open place →</button>` : ''}</section><section class="drawer-section"><p class="eyebrow">Newly added occurrences</p><h2>${matchedEvents.length ? 'Open any occurrence' : 'No direct event match found'}</h2><div class="place-occurrences">${eventRows}</div></section>`);
}

function changeLinkCandidates() {
  const seen = new Set();
  const aliasOwners = changeAliasOwners();
  const add = (label, html) => {
    const clean = (label || '').trim();
    const key = clean.toLowerCase();
    if (clean.length < 4 || seen.has(key)) return null;
    seen.add(key);
    return { label: clean, html };
  };
  return [
    ...DATA.stores.flatMap((place) => placeChangeLinkLabels(place, aliasOwners).map((label) => add(label, (matchedLabel) => `<button class="change-inline-target" data-place-id="${escapeHtml(place.id)}">${escapeHtml(matchedLabel)}</button>`))),
    ...COMMUNITY_SEED.map((community) => add(community.name, (label) => `<button class="change-inline-target" data-community-id="${escapeHtml(community.id)}">${escapeHtml(label)}</button>`)),
    ...DATA.sources
      .filter((item) => item.url && safeSourceLinkLabel(item.label))
      .map((item) => add(item.label, (label) => `<a class="change-inline-target" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`))
  ].filter(Boolean).sort((a, b) => b.label.length - a.label.length);
}

function changeAliasOwners() {
  const owners = new Map();
  for (const place of DATA.stores) {
    for (const alias of rawPlaceAliases(place.name)) {
      const key = alias.toLowerCase();
      const owner = owners.get(key);
      if (!owner) owners.set(key, place.id);
      else if (owner !== place.id) owners.set(key, null);
    }
  }
  return owners;
}

function placeChangeLinkLabels(place, aliasOwners) {
  return rawPlaceAliases(place.name).filter((alias) => aliasOwners.get(alias.toLowerCase()) === place.id);
}

function rawPlaceAliases(name = '') {
  const aliases = new Set();
  const add = (value) => {
    const clean = value.replace(/\s+/g, ' ').trim();
    if (clean.length >= 4) aliases.add(clean);
  };
  const baseName = name.split(' - ')[0].trim();
  const branchName = name.includes(' - ') ? name.split(' - ').slice(1).join(' - ').trim() : '';
  const compactBase = placeAliasCompact(baseName);
  add(name);
  add(baseName);
  add(compactBase);
  if (branchName) {
    add(`${baseName} ${branchName}`);
    add(`${baseName} - ${branchName}`);
    add(`${compactBase} ${branchName}`);
    add(`${compactBase} - ${branchName}`);
  }
  return [...aliases];
}

function placeAliasCompact(name = '') {
  return name
    .replace(/\b(Games|Game|Collectibles|TCG|LLC|Inc\.?|Store|Stores)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function safeSourceLinkLabel(label = '') {
  const clean = label.trim();
  if (clean.length < 10) return false;
  return !/^(instagram|facebook|discord|website|wizards|yelp|google|eventlink)$/i.test(clean);
}

function candidateLink(candidate, label) {
  return candidate.html(label);
}

function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function changeMatchesFilter(change, filter) {
  if (filter === 'all') return true;
  const text = `${change.changeType || ''} ${change.summary || ''} ${change.details || ''} ${change.reviewStatus || ''}`.toLowerCase();
  if (filter === 'new') return /new_event|event|schedule|prerelease|draft|sealed|commander/.test(text);
  if (filter === 'research') return /research|profile|venue|store|community|classified|assessment/.test(text);
  if (filter === 'correction') return /correction|repair|fix|reclass|duplicate|resolved|updated/.test(text);
  if (filter === 'source') return /source|failure|broken|stale|link|unreachable|instagram|website/.test(text);
  if (filter === 'hot') return /hot|action|question|waiting|urgent|follow|verify|notable/.test(text);
  return true;
}

function changeTone(change) {
  const text = `${change.changeType || ''} ${change.summary || ''} ${change.details || ''}`.toLowerCase();
  if (/source|failure|broken|stale/.test(text)) return 'coral';
  if (/new_event|event|schedule|prerelease|draft|sealed|commander/.test(text)) return 'mint';
  if (/research|profile|venue|store|community/.test(text)) return 'sky';
  return 'violet';
}

function changeRoute(change) {
  const text = `${change.changeType || ''} ${change.summary || ''} ${change.details || ''}`.toLowerCase();
  if (/new_event|event|schedule|prerelease|draft|sealed|commander/.test(text)) return 'events';
  if (/source|research|coverage|failure|broken|stale/.test(text)) return 'research';
  return 'places';
}

function changeFilterLabel(filter) {
  return ({ all: 'All updates', new: 'New events', research: 'Research', correction: 'Corrections', source: 'Source issues', hot: 'Hot/action' })[filter] || 'All updates';
}

function changeFilterHelp(filter) {
  return ({
    all: 'Everything recorded in the current change feed.',
    new: 'Event and schedule signals most likely to affect plans.',
    research: 'Venue, community, and assessment work.',
    correction: 'Repairs, reclassifications, and cleanup.',
    source: 'Evidence surfaces that need attention.',
    hot: 'Items whose wording suggests follow-up or verification.'
  })[filter] || 'Everything recorded in the current change feed.';
}

function renderResearch() {
  const visibleStores = DATA.stores.filter((place) => !isPlaceHidden(place.id));
  const partial = visibleStores.filter((place) => place.researchStatus === 'partial').length;
  const discovery = visibleStores.length - partial;
  const formats = DATA.events.reduce((acc, event) => ((acc[event.format || 'Unknown'] = (acc[event.format || 'Unknown'] || 0) + 1), acc), {});
  const sourceTypes = DATA.sources.reduce((acc, item) => ((acc[item.type || 'other'] = (acc[item.type || 'other'] || 0) + 1), acc), {});
  document.getElementById('researchDashboard').innerHTML = `<div class="research-stats"><button class="research-stat primary clickable" data-action="show-reviewed-places"><span>Venue depth</span><strong>${partial}<small> / ${visibleStores.length}</small></strong><p>visible places have moved beyond raw discovery</p><div class="progress"><i style="width:${visibleStores.length ? partial / visibleStores.length * 100 : 0}%"></i></div></button><button class="research-stat clickable" data-action="show-discovery-queue"><span>Discovery queue</span><strong>${discovery}</strong><p>visible places remain lightly vetted</p></button><button class="research-stat clickable" data-action="show-source-records"><span>Source records</span><strong>${DATA.sources.length}</strong><p>connected evidence surfaces</p></button><button class="research-stat warning clickable" data-action="show-format-balance"><span>Event-format balance</span><strong>${formats.Commander || 0}<small> Commander</small></strong><p>${DATA.events.length - (formats.Commander || 0)} other-format record</p></button></div>
    <div class="research-grid"><section class="research-panel"><p class="eyebrow">Coverage truth</p><h2>What this snapshot can and cannot say</h2><div class="truth-list"><div><span class="truth-icon mint">✓</span><p><strong>Useful nearby Commander starting set</strong><br>Recurring listings and strong partial venue profiles can support real planning now.</p></div><div><span class="truth-icon amber">~</span><p><strong>Uneven venue depth</strong><br>${partial} places have qualitative work; ${discovery} remain discovery-level and need social/site corroboration.</p></div><div><span class="truth-icon coral">!</span><p><strong>Not a complete Magic calendar</strong><br>Draft, sealed, prerelease, and other formats have not received comparable normalization yet.</p></div><div><span class="truth-icon sky">i</span><p><strong>Recurring dates are expectations</strong><br>Weekly schedules are displayed as projected occurrences unless a date-specific source confirms them.</p></div></div></section>
    <section class="research-panel"><p class="eyebrow">Source mix</p><h2>Where the evidence comes from</h2><div class="source-bars">${Object.entries(sourceTypes).sort((a,b) => b[1]-a[1]).slice(0,8).map(([type,count]) => `<div><span>${escapeHtml(type.replaceAll(/([A-Z])/g, ' $1'))}</span><div><i style="width:${count / Math.max(...Object.values(sourceTypes)) * 100}%"></i></div><strong>${count}</strong></div>`).join('')}</div></section></div>
    <div class="research-panel methodology-card"><div><p class="eyebrow">Method in one line</p><h2>Catalog broadly. Classify carefully. Rank personally. Preserve the evidence.</h2></div><button class="soft-button" data-action="show-log">View activity log</button></div>`;
}

function openEvent(id, occurrenceDate) {
  const event = eventById(id);
  const place = store(event?.storeId);
  const organizer = community(event?.communityId);
  if (!event || (!place && !organizer)) return;
  const occurrence = occurrenceDate ? parseDate(occurrenceDate) : parseDate(event.date || event.startDate);
  const { baseSource, eventRef } = resolvedEventSourceContext(event, occurrence);
  const src = eventSourceDisplay(baseSource, eventRef);
  const fit = fitLabel({ ...event, occurrenceDate: occurrence });
  const evidence = evidenceLabel({ ...event, occurrenceDate: occurrence, occurrenceStatus: event.occurrenceStatus || (!event.recurrence && (event.date || event.startDate) ? 'confirmed' : 'projected') });
  const personalKey = eventPreferenceKey(event);
  const favorite = state.personal.favorites[personalKey];
  const hidden = state.personal.hidden[personalKey];
  const interested = state.personal.interested[`${event.id}:${dateKey(occurrence)}`];
  const calendarUrl = googleCalendarUrl(event, place, occurrence);
  const artifacts = artifactsForEvent(event);
  const retainedEvidence = artifacts.length ? artifactEvidenceList(artifacts) : '';
  const details = meaningfulEventDetails(event);
  const disliked = state.personal.ratings[personalKey] === 1;
  const hostLabel = eventHostLabel(event, place);
  const hostAttribution = place
    ? `<button class="drawer-place-link" data-place-id="${place.id}" data-place-mode="drawer">Hosted at ${escapeHtml(place.name)} · ${distanceLabel(place)} →</button>`
    : `<span class="drawer-place-link static">At ${escapeHtml(hostLabel)}</span>`;
  const destination = place?.address || event.physicalLocation || '';
  openDrawer(`<div class="drawer-kicker"><span class="format-mark ${formatClass(event)}">${formatShort(event)}</span>${organizer ? '<span class="status-chip sky">Community meetup</span>' : ''}<span class="status-chip ${fit.tone}">${fit.label}</span><span class="status-chip ${evidence.tone}">${evidence.label}</span>${hidden ? '<span class="status-chip coral">Hidden by you</span>' : ''}${disliked ? '<span class="status-chip coral">Not for you</span>' : ''}<span class="drawer-preference-actions"><button class="heart-button ${favorite ? 'active' : ''}" data-favorite="${personalKey}" aria-label="${favorite ? 'Unfollow event series' : 'Follow event series'}" title="${favorite ? 'Following series' : 'Follow series'}">${heartIcon()}</button><button class="visibility-button ${hidden ? 'active' : ''}" data-action="toggle-event-hidden" data-event-id="${event.id}" aria-label="${hidden ? 'Show event normally' : 'Hide event for now'}" title="${hidden ? 'Show normally' : 'Hide for now'}">${eyeClosedIcon()}</button><button class="thumb-button ${disliked ? 'active' : ''}" data-action="toggle-event-dislike" data-event-id="${event.id}" aria-label="${disliked ? 'Remove event dislike' : 'Dislike event series'}" title="${disliked ? 'Remove dislike' : 'Not for me'}">${thumbDownIcon()}</button></span></div><h1 id="drawerTitle">${escapeHtml(event.title)}</h1>${organizer ? `<button class="drawer-place-link" data-community-id="${escapeHtml(organizer.id)}">Organized by ${escapeHtml(organizer.name)} →</button><span class="drawer-attribution-separator"> · </span>` : ''}${hostAttribution}
    <div class="event-hero-meta"><div><span>Date</span><strong>${occurrence.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</strong></div><div><span>Time</span><strong>${formatTime(eventStartTime(event))}</strong></div><div><span>Entry</span><strong>${event.entryFee == null ? 'Unknown' : Number(event.entryFee) === 0 ? 'Free' : `$${event.entryFee}`}</strong></div><div><span>Power</span><strong>${event.bracket && event.bracket !== 'unspecified' ? `Bracket ${event.bracket}` : 'Not stated'}</strong></div></div>
    <div class="drawer-action-grid"><a class="soft-button calendar-action" href="${calendarUrl}" target="_blank" rel="noreferrer" aria-label="Add to Google Calendar" title="Add to Google Calendar">${calendarPlusIcon()}</a>${destination ? `<a class="soft-button" href="${mapsUrl({ address: destination })}" target="_blank" rel="noreferrer">Directions ↗</a>` : ''}<button class="soft-button ${interested ? 'active' : ''}" data-interested="${event.id}:${dateKey(occurrence)}">${interested ? '✓ Interested' : '+ Interested'}</button></div>
    <section class="drawer-section"><p class="eyebrow">Source description</p><h2>What’s happening</h2><p>${escapeHtml(details)}</p></section>
    <section class="drawer-section"><p class="eyebrow">Analyst read</p><h2>How to interpret it</h2><div class="interpretation-grid"><div><span class="interpret-icon ${fit.tone}">●</span><p><strong>${fit.label}</strong><br>${eventFitExplanation(event, place)}</p></div><div><span class="interpret-icon ${evidence.tone}">●</span><p><strong>${evidence.label}</strong><br>${evidenceExplanation(event, place)}</p></div>${place?.lifecycleState === 'identity_blocked' ? '<div><span class="interpret-icon amber">!</span><p><strong>Identity unresolved</strong><br>The event has an attached source, but the venue or branch identity remains unresolved. Check the source before relying on it.</p></div>' : ''}${isCompetitive(event) ? '<div><span class="interpret-icon coral">!</span><p><strong>Competitive signal</strong><br>This belongs in the complete catalog but is deprioritized from your casual default view.</p></div>' : ''}</div></section>
    <section class="drawer-section"><p class="eyebrow">Before you go</p><h2>Practical check</h2><div class="before-grid"><div><span>Location</span><strong>${escapeHtml(hostLabel)}</strong></div><div><span>Added to catalog</span><strong>${escapeHtml(event.createdAt ? formatFreshnessDate(event.createdAt) : 'Unknown')}</strong></div><div><span>Last verified</span><strong>${escapeHtml(event.lastVerified)}</strong></div><div><span>Pod formation</span><strong>${/pair|random pod/i.test(event.details) ? 'Structured signal found' : 'Not stated'}</strong></div><div><span>Proxy policy</span><strong>${/no prox/i.test(event.details) ? 'No proxies stated' : /prox/i.test(event.details) ? 'Policy mentioned' : 'Not stated'}</strong></div></div></section>
    <section class="drawer-section"><p class="eyebrow">Evidence</p><h2>Source trail</h2>${retainedEvidence}${src ? sourceRow(src, true) : '<p class="muted-copy">No normalized source link is attached yet.</p>'}</section>
    <section class="drawer-section"><p class="eyebrow">Your private note</p><h2>Note on this series</h2>${noteComposer(personalKey, 'What should future-you remember about this event?')}</section>`);
}

function openDay(dayDate) {
  if (!dayDate) return;
  const date = parseDate(dayDate);
  const events = buildOccurrences(startOfDay(date), endOfDay(date));
  const mix = formatMix(events);
  const groupCounts = dayGroupCounts(events);
  openDrawer(`<div class="drawer-kicker"><span class="status-chip violet">Calendar day</span><span class="status-chip slate">${events.length} events</span></div><h1 id="drawerTitle">${date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h1><p class="drawer-lead">${mix || 'Every matching event currently visible for this date.'}</p>${groupCounts ? `<div class="day-group-counts">${groupCounts}</div>` : ''}<section class="drawer-section day-drawer-groups">${events.length ? groupedDayEvents(events, { compact: false, drawer: true, dense: true }) : '<p class="muted-copy">No events match the active filters for this day.</p>'}</section>`);
}

function eventFitExplanation(event, place) {
  if (isCompetitive(event)) return 'The wording suggests cEDH, optimized, or tournament-style play outside your usual Bracket 2/3 preference.';
  if (isHighPowerCommander(event)) return 'The wording suggests high-power or Bracket 4/5 Commander, so it belongs in the recoverable poor-fit bucket rather than competing with your usual casual Bracket 2/3 targets.';
  if (/open play|drop.?in|casual/i.test(`${event.title} ${event.details}`)) return 'The casual/open wording aligns with your preferred play style; solo-arrival mechanics may still be unknown.';
  if (isSpecial(event)) return 'This is the kind of infrequent limited or special event you asked to have highlighted.';
  if (!place && event.communityId) return 'This is a community-organized event relevant to your interests. Its practical fit depends on the specific gathering and physical location, not a store assessment.';
  return `The listing is relevant, but its power expectations and social structure need interpretation. ${distanceLabel(place, true)} keeps distance in the practical calculation.`;
}

function evidenceExplanation(event, place) {
  if (!event.recurrence && (event.date || event.startDate)) return 'A source names this specific date rather than only a recurring weekly pattern.';
  if (place?.researchStatus === 'partial' && event.confidence === 'high') return 'The routine is supported by a stronger store pass, but this displayed date is still projected from recurrence.';
  return 'This occurrence is generated from a recurring listing. Verify the source before a longer drive.';
}

function openPlaceDrawer(id) {
  const place = store(id);
  if (!place) return;
  const events = DATA.events.filter((event) => event.storeId === id);
  openDrawer(`<div class="drawer-kicker"><span class="status-chip ${place.researchStatus === 'partial' ? 'mint' : 'amber'}">${place.researchStatus === 'partial' ? 'Reviewed / partial' : 'Discovery-level'}</span></div><h1 id="drawerTitle">${escapeHtml(place.name)}</h1><p class="drawer-lead">${escapeHtml(place.city)} · ${distanceLabel(place, true)} from Los Alamitos</p><div class="drawer-action-grid"><button class="primary-button" data-place-id="${place.id}">Open full profile</button><a class="soft-button" href="${mapsUrl(place)}" target="_blank" rel="noreferrer">Directions ↗</a></div><section class="drawer-section"><p class="eyebrow">Analyst synthesis</p><h2>Why it’s on the radar</h2><p>${escapeHtml(place.assessmentNotes)}</p></section><section class="drawer-section"><p class="eyebrow">Known schedule</p><h2>${events.length} event series</h2><div class="series-list">${events.map(seriesRow).join('') || '<p>No normalized series yet.</p>'}</div></section>`);
}

function communityProfileData(community) {
  const signals = DATA.signals.filter((signal) => {
    if (['dismissed', 'stale'].includes(signal.status)) return false;
    return (signal.relatedEntityType === 'community' && signal.relatedEntityId === community.id)
      || (community.sourceIds || []).includes(signal.sourceId);
  }).sort((a, b) => String(b.observedAt || b.capturedAt).localeCompare(String(a.observedAt || a.capturedAt)));
  const events = uniqueEventSeries(DATA.events.filter((event) => event.communityId === community.id));
  const upcoming = buildOccurrences(startOfDay(new Date()), endOfDay(addDays(new Date(), 56)), false)
    .filter((event) => event.communityId === community.id)
    .sort((a, b) => a.occurrenceDate - b.occurrenceDate);
  const recent = buildOccurrences(startOfDay(addDays(new Date(), -56)), endOfDay(addDays(new Date(), -1)), false)
    .filter((event) => event.communityId === community.id)
    .sort((a, b) => b.occurrenceDate - a.occurrenceDate);
  const sources = (community.sourceIds || []).map(source).filter(Boolean);
  const surfaces = communitySurfaces().filter((surface) => surface.community?.id === community.id);
  const connections = signals.filter(isPersonalCommunityConnection);
  const locations = [...new Map(DATA.events.filter((event) => event.communityId === community.id).map((event) => {
    const place = store(event.storeId);
    if (place) return [`place:${place.id}`, { id: place.id, name: place.name, place }];
    const hostText = communityHostName(event);
    if (hostText) return [`text:${hostText.toLowerCase()}`, { id: '', name: hostText, place: null }];
    return null;
  }).filter(Boolean)).values()];
  return { community, signals, events, upcoming, recent, sources, surfaces, connections, locations, monitoring: communityMonitoringState(sources, signals) };
}

function isPersonalCommunityConnection(signal) {
  const text = `${signal.summary || ''} ${signal.details || ''} ${signal.suggestedAction || ''}`.toLowerCase();
  const personal = signal.category === 'mention' || /\bmetavirus\b|\byou\b/.test(text);
  const social = /had fun|great time|good time|nice meeting|meet you|played with|photo|picture|glad (?:you|we)|thanks for (?:coming|joining)|see you again/.test(text);
  return personal && (social || signal.category === 'mention');
}

function communityMonitoringState(sources, signals) {
  const dates = sources.map((item) => item.lastChecked).filter(Boolean).map((value) => new Date(value)).filter((value) => !Number.isNaN(value.getTime()));
  const lastChecked = dates.sort((a, b) => b - a)[0] || null;
  const current = lastChecked && (Date.now() - lastChecked.getTime()) <= 14 * 24 * 60 * 60 * 1000;
  const usefulDate = signals.map((signal) => new Date(signal.observedAt || signal.capturedAt || 0)).filter((value) => !Number.isNaN(value.getTime())).sort((a, b) => b - a)[0] || null;
  const recent = usefulDate && (Date.now() - usefulDate.getTime()) <= 14 * 24 * 60 * 60 * 1000;
  if (!sources.length) return { label: 'Not yet assessed', tone: 'amber', detail: 'No monitored route is mapped yet', lastChecked, usefulDate };
  if (!current) return { label: 'Coverage uncertain', tone: 'amber', detail: lastChecked ? `Last checked ${formatFreshnessDate(lastChecked)}` : 'No successful check recorded', lastChecked, usefulDate };
  if (recent) return { label: 'New activity', tone: 'mint', detail: `Useful activity ${formatFreshnessDate(usefulDate)}`, lastChecked, usefulDate };
  return { label: 'Quiet but monitored', tone: 'sky', detail: `Checked ${formatFreshnessDate(lastChecked)}`, lastChecked, usefulDate };
}

function communityHostLabel(event) {
  const location = communityHostName(event);
  return location ? `at ${location}` : '';
}

function communityHostName(event) {
  const place = store(event.storeId);
  if (place?.name) return place.name;
  if (event.physicalLocation) return event.physicalLocation;
  const explicitHost = String(event.details || '').match(/\b(?:hosted|held|meeting) at ([^,.;\n]+)/i);
  return explicitHost?.[1]?.trim() || '';
}

function mapsSearchUrl(label) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`;
}

function communityOwnedEventRow(event, community) {
  const occurrence = event.occurrenceDate || parseDate(event.date || event.startDate);
  const host = communityHostName(event);
  const when = occurrence ? occurrence.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Date not normalized';
  return `<button class="community-event-row" data-event-id="${escapeHtml(event.id)}" ${occurrence ? `data-date="${dateKey(occurrence)}"` : ''}><span class="format-mark ${formatClass(event)}">${formatShort(event)}</span><span><strong>${escapeHtml(event.title)}</strong><small>${escapeHtml(when)} · Organized by ${escapeHtml(community.name)}${host ? ` · Hosted at ${escapeHtml(host)}` : ''}</small></span><span class="status-chip ${event.confidence === 'high' ? 'mint' : 'amber'}">${escapeHtml(event.confidence || 'unknown')}</span></button>`;
}

function communityProfileTabs(profile) {
  const tabs = [
    ['overview', 'Overview', ''],
    ['events', 'Events & plans', profile.upcoming.length],
    ['connections', 'Your connections', profile.connections.length],
    ['activity', 'Activity', profile.signals.length],
    ['sources', 'Sources', profile.sources.length]
  ];
  return `<div class="community-detail-tabs" role="tablist" aria-label="Community details">${tabs.map(([id, label, count]) => `<button class="${state.selectedCommunityTab === id ? 'active' : ''}" data-community-tab="${id}" role="tab" aria-selected="${state.selectedCommunityTab === id}">${label}${count !== '' ? ` <span>${count}</span>` : ''}</button>`).join('')}</div>`;
}

function communityProfileTabContent(profile) {
  const { community, monitoring } = profile;
  if (state.selectedCommunityTab === 'events') {
    return `<section class="drawer-section"><p class="eyebrow">Confirmed events</p><h2>Organized by ${escapeHtml(community.name)}</h2><p>Host locations are logistics, not ownership. Community-owned events remain here whether they meet at a store, bar, park, home, or another location.</p><div class="series-list">${profile.upcoming.length ? profile.upcoming.slice(0, 20).map((event) => communityOwnedEventRow(event, community)).join('') : '<p class="muted-copy">No confirmed upcoming community-owned events in the next eight weeks.</p>'}</div></section><section class="drawer-section"><p class="eyebrow">Event series</p><h2>${profile.events.length} normalized record${profile.events.length === 1 ? '' : 's'}</h2><div class="series-list">${profile.events.length ? profile.events.map((event) => communityOwnedEventRow(event, community)).join('') : '<p class="muted-copy">No normalized community-owned series yet. Tentative Discord plans can remain signals until their logistics are stable.</p>'}</div></section><section class="drawer-section"><p class="eyebrow">Recent gatherings</p><h2>Continuity after the date passes</h2><div class="series-list">${profile.recent.length ? profile.recent.slice(0, 8).map((event) => communityOwnedEventRow(event, community)).join('') : '<p class="muted-copy">No recent normalized gathering is linked yet.</p>'}</div></section>`;
  }
  if (state.selectedCommunityTab === 'connections') {
    return `<section class="drawer-section"><p class="eyebrow coral">Your connections</p><h2>Moments worth remembering</h2><p>Direct invitations, personal mentions, and positive post-meetup follow-ups live here so a quiet Discord does not erase the social continuity you built.</p><div class="community-connection-list">${profile.connections.length ? profile.connections.map(communityConnectionCard).join('') : '<div class="community-empty-memory"><strong>No personal connection has been captured yet</strong><p>This does not mean none happened. New direct mentions and post-meetup acknowledgments will appear here when supported by monitored evidence.</p></div>'}</div></section>${noteComposer(`community:${community.id}`, 'Who did you meet, and what made the gathering worth remembering?')}`;
  }
  if (state.selectedCommunityTab === 'activity') {
    return `<section class="drawer-section"><p class="eyebrow sky">Meaningful activity</p><h2>${profile.signals.length} useful signal${profile.signals.length === 1 ? '' : 's'}</h2><p>This is a curated timeline, not a raw Discord feed. Empty scans and routine chatter stay out.</p><div class="community-activity-list">${profile.signals.length ? profile.signals.slice(0, 20).map(communityActivityRow).join('') : '<p class="muted-copy">No useful activity is currently captured. Monitoring silence is normal.</p>'}</div></section>`;
  }
  if (state.selectedCommunityTab === 'sources') {
    return `<section class="drawer-section"><p class="eyebrow">Monitoring coverage</p><h2>${escapeHtml(monitoring.label)}</h2><p>${escapeHtml(monitoring.detail)}. Last meaningful activity and last successful check are tracked separately so quiet periods remain trustworthy.</p><div class="source-list">${profile.sources.map(sourceRow).join('') || '<p class="muted-copy">No source mapping is available.</p>'}</div></section><section class="drawer-section"><details class="monitoring-details"><summary>Monitoring details</summary><div class="community-surface-list">${profile.surfaces.length ? profile.surfaces.map(communitySurfaceCard).join('') : '<p class="muted-copy">No classified community surfaces are available yet.</p>'}</div></details></section>`;
  }
  return `<section class="drawer-section community-profile-snapshot"><div class="community-facts"><button data-community-tab="sources"><span>Monitoring</span><strong>${escapeHtml(monitoring.label)}</strong></button><button data-community-tab="events"><span>Upcoming</span><strong>${profile.upcoming.length} confirmed</strong></button><button data-community-tab="events"><span>Known hosts</span><strong>${profile.locations.length}</strong></button></div>${monitoring.usefulDate ? `<button class="community-last-meaningful" data-community-tab="activity">Last meaningful activity ${escapeHtml(formatFreshnessDate(monitoring.usefulDate))} →</button>` : '<button class="community-last-meaningful" data-community-tab="activity">No meaningful activity date is captured yet · review activity →</button>'}</section><section class="drawer-section"><p class="eyebrow">Current synthesis</p><h2>Why this group matters</h2><p>${escapeHtml(community.summary)}</p></section>${communityOverviewHighlight(profile)}<section class="drawer-section"><p class="eyebrow">Geography and hosts</p><h2>${profile.locations.length ? `${profile.locations.length} known gathering location${profile.locations.length === 1 ? '' : 's'}` : 'Host relationships still developing'}</h2><div class="community-host-list">${profile.locations.map((location) => location.place ? `<button class="meta-chip link-chip" data-place-id="${escapeHtml(location.id)}" data-place-mode="drawer">${escapeHtml(location.name)}</button>` : `<a class="meta-chip link-chip" href="${escapeHtml(mapsSearchUrl(location.name))}" target="_blank" rel="noreferrer">${escapeHtml(location.name)} · map ↗</a>`).join('') || '<p class="muted-copy">A community can organize gatherings at stores, parks, bars, homes, or location text that has not become a venue record.</p>'}</div></section><section class="drawer-section"><p class="eyebrow">Open research question</p><h2>What would make this profile more useful</h2><p>${escapeHtml(community.nextQuestion)}</p></section>${noteComposer(`community:${community.id}`, 'Add a personal note about this community...')}`;
}

function communityOverviewHighlight(profile) {
  const connection = profile.connections[0];
  if (connection) return `<section class="drawer-section"><p class="eyebrow coral">Your latest connection</p>${communityConnectionCard(connection)}</section>`;
  const event = profile.upcoming[0];
  if (event) return `<section class="drawer-section"><p class="eyebrow mint">Next community event</p><div class="series-list">${communityOwnedEventRow(event, profile.community)}</div></section>`;
  return `<section class="drawer-section"><p class="eyebrow sky">Current pulse</p><h2>No new useful activity</h2><p>That is a normal state. This profile remains available while monitoring watches for the next plan, invitation, event change, or social follow-up.</p></section>`;
}

function communityConnectionCard(signal) {
  const observed = signal.observedAt || signal.capturedAt;
  const src = source(signal.sourceId);
  const url = signal.evidenceUrl || src?.url || '';
  return `<article class="community-connection-card"><div><span class="status-chip coral">Personal connection</span><small>${escapeHtml(formatFreshnessDate(observed))}</small></div><h3>${escapeHtml(signal.summary)}</h3><p>${escapeHtml(signal.details || signal.suggestedAction || '')}</p><div>${url ? `<a class="soft-button" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">View conversation ↗</a>` : ''}<button class="soft-button" data-action="open-signal" data-signal-id="${escapeHtml(signal.id)}">Evidence</button></div></article>`;
}

function communityActivityRow(signal) {
  return `<button class="community-activity-row" data-action="open-signal" data-signal-id="${escapeHtml(signal.id)}"><span class="status-chip ${signal.category === 'mention' ? 'coral' : signal.category === 'event_opportunity' ? 'mint' : 'sky'}">${escapeHtml(signal.categoryLabel || signal.category || 'Activity')}</span><span><strong>${escapeHtml(signal.summary)}</strong><small>${escapeHtml(formatFreshnessDate(signal.observedAt || signal.capturedAt))}</small></span><span>→</span></button>`;
}

function openCommunity(id, preserveTab = false) {
  const community = COMMUNITY_SEED.find((item) => item.id === id);
  if (!community) return;
  if (!preserveTab || state.selectedCommunityId !== id) state.selectedCommunityTab = 'overview';
  state.selectedCommunityId = id;
  const favorite = state.personal.favorites[`community:${id}`];
  const profile = communityProfileData(community);
  openDrawer(`<div class="drawer-kicker"><span class="community-symbol small">◎</span><button class="status-chip ${profile.monitoring.tone}" data-community-tab="sources">${escapeHtml(profile.monitoring.label)}</button><span class="status-chip slate">Community record</span><span class="drawer-preference-actions"><button class="heart-button ${favorite ? 'active' : ''}" data-favorite="community:${id}" aria-label="${favorite ? 'Remove community from' : 'Add community to'} favorites" title="Favorite community">${heartIcon()}</button></span></div><h1 id="drawerTitle">${escapeHtml(community.name)}</h1><p class="drawer-lead">${escapeHtml(community.region)}${community.formats?.length ? ` · ${escapeHtml(community.formats.join(' · '))}` : ''}</p>${communityProfileTabs(profile)}<div class="community-profile-content">${communityProfileTabContent(profile)}</div>`);
}

async function sendMagicLink(inputId) {
  const email = document.getElementById(inputId)?.value.trim();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    toast('Enter a valid email address');
    return;
  }
  if (personalAuth.sendingLink) return;
  if (!personalAuth.client) {
    toast('Sign-in service is unavailable; preferences remain local');
    return;
  }
  personalAuth.sendingLink = true;
  const button = document.querySelector(`[data-action="send-magic-link"][data-input="${CSS.escape(inputId)}"]`);
  if (button) {
    button.disabled = true;
    button.textContent = 'Sending...';
  }
  try {
    const { error } = await personalAuth.client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: authRedirectUrl() }
    });
    if (error) {
      console.warn('Magic-link request failed.', error);
      const message = /rate limit|over_email_send_rate_limit|429/i.test(`${error.message || ''} ${error.code || ''}`)
        ? 'Too many sign-in emails. Wait a bit, then try again.'
        : 'Could not send the sign-in link';
      toast(message);
      return;
    }
    openDrawer(`<div class="drawer-kicker"><span class="status-chip mint">Email sent</span></div><h1 id="drawerTitle">Check your email</h1><p class="drawer-lead">Open the sign-in link on the device where you want to use the app.</p><section class="drawer-section"><p>Your current browser preferences remain safe while you complete sign-in.</p></section>`);
  } finally {
    personalAuth.sendingLink = false;
    if (button) {
      button.disabled = false;
      button.textContent = 'Email me a sign-in link';
    }
  }
}

async function signOutPersonalAccount() {
  if (personalAuth.client) await personalAuth.client.auth.signOut();
  personalAuth.user = null;
  DATA.artifacts = [];
  personalAuth.status = 'local';
  personalAuth.message = 'Saved on this device';
  updateAuthChrome();
  closeDrawer();
  toast('Signed out · preferences remain on this device');
}

async function persistPreference(key) {
  if (!personalAuth.user || !personalAuth.client) return;
  const target = personalTarget(key);
  if (!target) return;
  const row = {
    user_id: personalAuth.user.id,
    entity_type: target.entityType,
    entity_id: target.entityId,
    is_favorite: !!state.personal.favorites[key],
    visibility_preference: state.personal.hidden[key] ? 'deprioritize' : 'normal',
    rating: state.personal.ratings[key] || null,
    updated_at: new Date().toISOString()
  };
  const { error } = await personalAuth.client.from('entity_preferences').upsert(row, { onConflict: 'user_id,entity_type,entity_id' });
  recordPersonalWriteResult(error);
}

async function persistPersonalNote(key, value) {
  if (!personalAuth.user || !personalAuth.client) return;
  const target = personalTarget(key);
  if (!target) return;
  let error;
  if (value) {
    ({ error } = await personalAuth.client.from('personal_notes').upsert({
      user_id: personalAuth.user.id,
      entity_type: target.entityType,
      entity_id: target.entityId,
      note_text: value,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,entity_type,entity_id' }));
  } else {
    ({ error } = await personalAuth.client.from('personal_notes').delete().eq('entity_type', target.entityType).eq('entity_id', target.entityId));
  }
  recordPersonalWriteResult(error);
}

async function persistSignalReadState(signalId, read) {
  if (!personalAuth.user || !personalAuth.client) return;
  let error;
  if (read) {
    const now = new Date().toISOString();
    ({ error } = await personalAuth.client.from('signal_user_states').upsert({
      user_id: personalAuth.user.id,
      signal_id: signalId,
      read_at: state.personal.signalRead[signalId] || now,
      updated_at: now
    }, { onConflict: 'user_id,signal_id' }));
  } else {
    ({ error } = await personalAuth.client.from('signal_user_states').delete().eq('user_id', personalAuth.user.id).eq('signal_id', signalId));
  }
  recordPersonalWriteResult(error);
}

function recordPersonalWriteResult(error) {
  if (error) {
    console.warn('Personal state write failed; local value remains active.', error);
    personalAuth.status = 'error';
    personalAuth.message = 'Saved locally — account sync unavailable';
  } else {
    personalAuth.status = 'synced';
    personalAuth.message = 'Saved to your account';
  }
  updateAuthChrome();
}

function personalSaveToast(label) {
  return personalAuth.user ? `${label} to your account` : `${label} on this device`;
}

function updateAuthChrome() {
  const button = document.getElementById('openQuickNote');
  if (!button) return;
  const restoring = ['checking', 'syncing'].includes(personalAuth.status);
  button.textContent = personalAuth.user ? (personalAuth.user.email?.[0] || 'K').toUpperCase() : 'K';
  button.classList.toggle('signed-in', !!personalAuth.user);
  button.classList.toggle('local-only', !personalAuth.user && !restoring);
  button.classList.toggle('syncing', restoring);
  button.classList.toggle('sync-error', personalAuth.status === 'error');
  button.dataset.authState = personalAuth.user ? personalAuth.status : personalAuth.status || 'local';
  button.setAttribute('aria-label', personalAuth.user ? 'Open signed-in personal preferences' : restoring ? 'Restoring personal sign-in' : 'Sign in to save personal preferences');
  button.title = personalAuth.message || 'Personal preferences';
}

function openActivityLog() {
  const activity = state.personal.activity || [];
  openDrawer(`<div class="drawer-kicker"><span class="status-chip ${personalAuth.user ? 'mint' : 'slate'}">${escapeHtml(personalAuth.message || 'Saved on this device')}</span></div><h1 id="drawerTitle">Activity log</h1><p class="drawer-lead">A quiet record of favorites, ratings, notes, and planning actions.</p><section class="drawer-section"><div class="activity-list">${activity.length ? activity.map((item) => `<div class="activity-row"><span>${activityIcon(item.type)}</span><div><strong>${escapeHtml(item.label || item.type)}</strong><small>${new Date(item.at).toLocaleString()}</small></div></div>`).join('') : '<p class="muted-copy">No personal actions yet. Favorite a place or add a note and it will appear here.</p>'}</div></section><section class="drawer-section"><p class="field-help">Research facts stay separate from this personal activity and preference state.</p></section>`);
}

function openQuickNote() {
  if (personalAuth.user) {
    openDrawer(`<div class="drawer-kicker"><span class="status-chip mint">Signed in</span></div><h1 id="drawerTitle">Personal preferences</h1><p class="drawer-lead">${escapeHtml(personalAuth.user.email || 'Your personal account')}</p><section class="drawer-section"><p class="eyebrow">Account saving</p><h2>${escapeHtml(personalAuth.message || 'Saved to your account')}</h2><p>Venue and event-series favorites, deprioritize choices, ratings, and private notes follow this sign-in. Research facts remain separate.</p></section><section class="drawer-section"><button class="soft-button" data-action="sign-out">Sign out</button></section>`);
    return;
  }
  openDrawer(`<div class="drawer-kicker"><span class="status-chip violet">Personal use</span></div><h1 id="drawerTitle">Sign in to save preferences</h1><p class="drawer-lead">Use one email magic link so favorites, deprioritize choices, and private notes follow you across browsers.</p><section class="drawer-section auth-form"><label for="personalEmail">Email</label><input id="personalEmail" type="email" autocomplete="email" placeholder="you@example.com"><button class="primary-button" data-action="send-magic-link" data-input="personalEmail">Email me a sign-in link</button><p class="field-help">Without sign-in, the app still works and saves only on this device.</p></section>`);
}

function activityIcon(type) { return type === 'favorite' ? '♥' : type === 'rating' ? '★' : type === 'note' ? '✎' : '✓'; }

function noteComposer(entity, placeholder) {
  const note = state.personal.notes[entity] || '';
  const id = `note-${entity.replace(/[^a-z0-9]/gi, '-')}`;
  const saveLabel = personalAuth.user ? (personalAuth.status === 'error' ? 'Saved locally — sync unavailable' : 'Private · saved to your account') : 'Private · saved on this device';
  return `<div class="note-composer"><textarea id="${id}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(note)}</textarea><div><span>${saveLabel}</span><button class="soft-button" data-action="save-note" data-entity="${escapeHtml(entity)}" data-input="${id}">Save note</button></div></div>`;
}

function saveNote(entity, inputId) {
  const value = document.getElementById(inputId)?.value.trim() || '';
  state.personal.notes[entity] = value;
  savePersonal({ type: 'note', label: value ? `Updated note for ${entity.split(':')[1]}` : `Cleared note for ${entity.split(':')[1]}` });
  void persistPersonalNote(entity, value);
  toast(personalSaveToast('Note saved'));
}

function setRating(entity, rating) {
  state.personal.ratings[entity] = rating;
  savePersonal({ type: 'rating', label: `Rated ${entity.split(':')[1]} ${rating} stars` });
  void persistPreference(entity);
  renderPlaces();
  toast(`Rating saved: ${rating} stars`);
}

function toggleFavorite(key) {
  state.personal.favorites[key] = !state.personal.favorites[key];
  savePersonal({ type: 'favorite', label: `${state.personal.favorites[key] ? 'Followed' : 'Unfollowed'} ${key.split(':')[1]}` });
  void persistPreference(key);
  renderCurrentRoute();
  toast(state.personal.favorites[key] ? 'Added to favorites' : 'Removed from favorites');
}

function toggleHidden(key) {
  state.personal.hidden[key] = !state.personal.hidden[key];
  if (key.startsWith('place:') && state.personal.hidden[key] && state.selectedPlaceId === key.slice(6)) {
    state.selectedPlaceId = defaultSelectedPlaceId();
    state.selectedPlaceWasAuto = true;
    state.selectedPlaceTab = 'overview';
  }
  const isEvent = key.startsWith('event:');
  savePersonal({ type: 'preference', label: `${state.personal.hidden[key] ? (isEvent ? 'Hidden for now' : 'Deprioritized') : 'Restored'} ${key.split(':')[1]}` });
  void persistPreference(key);
  renderCurrentRoute();
  toast(state.personal.hidden[key] ? (isEvent ? 'Hidden from normal event views' : 'Deprioritized in your view') : 'Restored to normal priority');
}

function toggleEventDislike(key) {
  const disliked = state.personal.ratings[key] === 1;
  if (disliked) {
    delete state.personal.ratings[key];
  } else {
    state.personal.ratings[key] = 1;
  }
  savePersonal({ type: 'rating', label: `${disliked ? 'Removed dislike for' : 'Marked not-for-me'} ${key.split(':')[1]}` });
  void persistPreference(key);
  renderCurrentRoute();
  toast(disliked ? 'Event dislike removed' : 'Marked as not for you');
}

function setSignalRead(signalId, read) {
  const signal = DATA.signals.find((item) => item.id === signalId);
  if (!signal) return;
  if (read) {
    state.personal.signalRead[signalId] = new Date().toISOString();
  } else {
    delete state.personal.signalRead[signalId];
  }
  savePersonal({ type: 'signal', label: `${read ? 'Marked read' : 'Restored'} signal: ${signal.summary}` });
  void persistSignalReadState(signalId, read);
  renderSignals();
  toast(read ? personalSaveToast('Signal marked read') : personalSaveToast('Signal restored'));
}

function toggleInterested(key) {
  state.personal.interested[key] = !state.personal.interested[key];
  savePersonal({ type: 'planning', label: `${state.personal.interested[key] ? 'Marked interested in' : 'Removed interest from'} ${key.split(':')[0]}` });
  const [eventId, date] = key.split(/:(?=\d{4}-\d{2}-\d{2}$)/);
  openEvent(eventId, date);
  toast(state.personal.interested[key] ? 'Marked interested' : 'Interest removed');
}

function toggleFavoritesOnly() {
  state.favoritesOnly = !state.favoritesOnly;
  renderCurrentRoute();
  toast(state.favoritesOnly ? 'Showing favorited items where available' : 'Showing all visible items');
}

function toggleHighlightsRail() {
  state.highlightsCollapsed = !state.highlightsCollapsed;
  updateChrome();
}

function openScoreExplanation(place) {
  const evaluation = place ? normalizedEvaluation(place) : null;
  const evidence = evaluation ? `<section class="drawer-section"><p class="eyebrow">Current judgment</p><h2>${escapeHtml(place.name)}: ${escapeHtml(evaluation.fitGrade)} · ${Number(evaluation.fitScore).toFixed(1)}/5</h2><p class="drawer-lead">${escapeHtml(evaluation.confidence)} confidence · ${escapeHtml(placeResearchLabel(place))} research · ${evaluation.candidateStatus === 'promoted' ? 'promoted candidate' : evaluation.candidateStatus === 'working' ? 'working candidate' : 'discovery candidate'}</p></section>
    <section class="drawer-section evaluation-evidence"><div><p class="eyebrow">Pluses</p><ul>${evaluation.positives.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div><div><p class="eyebrow">Cautions</p><ul>${evaluation.cautions.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div><div><p class="eyebrow">Open questions</p><ul>${evaluation.openQuestions.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div></section>` : '';
  const breakdown = place ? `<section class="drawer-section"><p class="eyebrow">Dimension breakdown</p><h2>What pushed the score up or down</h2><div class="dimension-grid">${scoreBreakdown(place)}</div></section>` : '';
  openDrawer(`<div class="drawer-kicker"><span class="status-chip violet">Scoring guide</span></div><h1 id="drawerTitle">${evaluation ? 'Why this place received its score' : 'How place scores work'}</h1><p class="drawer-lead">Fit and confidence are separate. The grade estimates how good a practical bet the place is for you; confidence describes how strongly the available evidence supports that judgment.</p>${evidence}${breakdown}<section class="drawer-section"><p class="eyebrow">How to read the dimensions</p><div class="truth-list"><div><span class="truth-icon mint">1</span><p><strong>Magic and event fit</strong><br>Relevant Commander, prerelease, sealed, and draft opportunity without rewarding poor-fit competitive volume.</p></div><div><span class="truth-icon sky">2</span><p><strong>Solo-arrival and community fit</strong><br>Explicit welcoming or pairing help is a positive. Ordinary silence is neutral rather than a penalty.</p></div><div><span class="truth-icon amber">3</span><p><strong>Practical fit</strong><br>Distance, schedule reliability, physical environment, and realistic repeat-visit value.</p></div><div><span class="truth-icon coral">4</span><p><strong>Confidence</strong><br>Evidence depth and agreement across official, social, community, and user-observation sources.</p></div></div></section><section class="drawer-section"><p class="eyebrow">Important caveat</p><p>These are transparent working judgments, not objective truths. They should change when research deepens or your own visits provide better evidence.</p></section>`);
}

function openDiscoveryQueue() {
  const places = DATA.stores.filter((place) => place.researchStatus !== 'partial' && !isPlaceHidden(place.id)).sort((a, b) => (numericDistance(a) ?? 999) - (numericDistance(b) ?? 999));
  openDrawer(`<div class="drawer-kicker"><span class="status-chip amber">Discovery queue</span></div><h1 id="drawerTitle">Lightly vetted places</h1><p class="drawer-lead">These places are still in the queue for stronger corroboration before they should be treated as serious bets.</p><section class="drawer-section"><div class="place-occurrences">${places.map((place) => `<button class="occurrence-row" data-place-id="${place.id}"><time><strong>${numericDistance(place) == null ? '?' : numericDistance(place).toFixed(0)}</strong>mi</time><span><strong>${escapeHtml(place.name)}</strong><small>${escapeHtml(place.city)} · ${truncate(place.assessmentNotes || 'Needs synthesis', 110)}</small></span><span class="status-chip amber">Discovery-level</span></button>`).join('')}</div></section>`);
}

function openReviewedPlaces() {
  const places = DATA.stores.filter((place) => place.researchStatus === 'partial' && !isPlaceHidden(place.id)).sort((a, b) => storeScore(b) - storeScore(a));
  openDrawer(`<div class="drawer-kicker"><span class="status-chip mint">Reviewed places</span></div><h1 id="drawerTitle">Places with deeper work</h1><p class="drawer-lead">These places have moved beyond raw discovery and now support a real planning judgment.</p><section class="drawer-section"><div class="place-occurrences">${places.map((place) => { const evaluation = normalizedEvaluation(place); return `<button class="occurrence-row" data-place-id="${place.id}"><time><strong>${escapeHtml(evaluation.fitGrade)}</strong>${Number(evaluation.fitScore).toFixed(1)}</time><span><strong>${escapeHtml(place.name)}</strong><small>${escapeHtml(place.city)} · ${distanceLabel(place)}</small></span><span class="status-chip ${evaluation.candidateStatus === 'promoted' ? 'mint' : 'amber'}">${evaluation.candidateStatus === 'promoted' ? 'Promoted' : 'Working'}</span></button>`; }).join('')}</div></section>`);
}

function openFreshSignals() {
  const events = notableEvents();
  openDrawer(`<div class="drawer-kicker"><span class="status-chip amber">Fresh signals</span></div><h1 id="drawerTitle">New & notable</h1><p class="drawer-lead">A quieter shortlist of the most actionable or attention-worthy finds in the next four weeks.</p><section class="drawer-section"><div class="day-drawer-list">${events.length ? events.map((event) => eventCard(event)).join('') : '<p class="muted-copy">No notable upcoming items are visible in the current window.</p>'}</div></section><section class="drawer-section"><p class="eyebrow">Why these surfaced</p><div class="truth-list"><div><span class="truth-icon mint">★</span><p><strong>Special-event bias</strong><br>Prereleases, limited events, and unusual one-offs rise first because they are easy to miss and often matter most.</p></div><div><span class="truth-icon sky">i</span><p><strong>Freshness matters</strong><br>More recently verified items outrank older routine listings when the practical value is otherwise similar.</p></div></div></section>`);
}

function openHighlightsHub() {
  const events = notableEvents(6);
  const places = rankedStores().filter((place) => place.researchStatus === 'partial').slice(0, 6);
  const alerts = DATA.stores.filter((place) => place.researchStatus !== 'partial' && !isPlaceHidden(place.id)).slice(0, 5);
  openDrawer(`<div class="drawer-kicker"><span class="status-chip violet">Signals hub</span></div><h1 id="drawerTitle">Side-panel signals</h1><p class="drawer-lead">When the window gets tighter, use this drawer to reach the Today page highlights without hunting for where they went.</p><section class="drawer-section"><div class="section-title-row"><div><p class="eyebrow amber">Fresh signals</p><h2>New & notable</h2></div><button class="text-button" data-action="show-fresh-signals">Open full list</button></div><div class="day-drawer-list">${events.length ? events.map((event) => eventCard(event)).join('') : '<p class="muted-copy">No notable items are visible right now.</p>'}</div></section><section class="drawer-section"><div class="section-title-row"><div><p class="eyebrow mint">For you</p><h2>Promising nearby</h2></div><button class="text-button" data-action="show-promising-nearby">Open full list</button></div><div class="place-occurrences">${places.length ? places.map((place, index) => { const evaluation = normalizedEvaluation(place); return `<button class="occurrence-row" data-place-id="${place.id}"><time><strong>${String(index + 1).padStart(2, '0')}</strong>fit</time><span><strong>${escapeHtml(place.name)}</strong><small>${distanceLabel(place)} · ${escapeHtml(evaluation.fitGrade)} · ${Number(evaluation.fitScore).toFixed(1)}/5</small></span><span class="status-chip ${evaluation.candidateStatus === 'promoted' ? 'mint' : 'amber'}">${evaluation.candidateStatus === 'promoted' ? 'Promoted' : 'Working'}</span></button>`; }).join('') : '<p class="muted-copy">No reviewed places are available yet.</p>'}</div></section><section class="drawer-section"><div class="section-title-row"><div><p class="eyebrow coral">Check first</p><h2>Research alerts</h2></div><button class="text-button" data-route="research">See coverage</button></div><div class="place-occurrences">${alerts.length ? alerts.map((place) => `<button class="occurrence-row" data-place-id="${place.id}"><time><strong>?</strong>queue</time><span><strong>${escapeHtml(place.name)}</strong><small>${escapeHtml(place.city)} · ${truncate(place.assessmentNotes || 'Needs more corroboration', 95)}</small></span><span class="status-chip amber">Discovery</span></button>`).join('') : '<p class="muted-copy">No immediate research alerts are queued.</p>'}</div></section>`);
}

function openPromisingNearby() {
  const places = rankedStores().filter((place) => place.researchStatus === 'partial').slice(0, 12);
  openDrawer(`<div class="drawer-kicker"><span class="status-chip mint">For you</span></div><h1 id="drawerTitle">Promising nearby</h1><p class="drawer-lead">Reviewed places that currently look like the most practical bets for repeat play and local pod-building.</p><section class="drawer-section"><div class="place-occurrences">${places.map((place, index) => { const evaluation = normalizedEvaluation(place); return `<button class="occurrence-row" data-place-id="${place.id}"><time><strong>${String(index + 1).padStart(2, '0')}</strong>fit</time><span><strong>${escapeHtml(place.name)}</strong><small>${distanceLabel(place)} · ${escapeHtml(evaluation.fitGrade)} · ${Number(evaluation.fitScore).toFixed(1)}/5</small></span><span class="status-chip ${evaluation.candidateStatus === 'promoted' ? 'mint' : 'amber'}">${evaluation.candidateStatus === 'promoted' ? 'Promoted' : 'Working'}</span></button>`; }).join('')}</div></section><section class="drawer-section"><p class="eyebrow">How to use this</p><div class="truth-list"><div><span class="truth-icon mint">1</span><p><strong>Use it as a short list</strong><br>This is where to start when you want a realistic near-term option rather than the full landscape.</p></div><div><span class="truth-icon amber">2</span><p><strong>Not a permanent verdict</strong><br>Rank can move as we deepen research, add your visit notes, or learn something better about solo-arrival fit.</p></div></div></section>`);
}

function openDrawer(html) {
  document.getElementById('drawerContent').innerHTML = html;
  document.getElementById('detailDrawer').classList.add('open');
  document.getElementById('detailDrawer').setAttribute('aria-hidden', 'false');
  document.getElementById('drawerScrim').classList.remove('hidden');
  document.body.classList.add('drawer-open');
  setTimeout(() => document.getElementById('drawerClose').focus(), 50);
}

function closeDrawer() {
  if (artifactPreviewUrl) {
    URL.revokeObjectURL(artifactPreviewUrl);
    artifactPreviewUrl = null;
  }
  document.getElementById('detailDrawer').classList.remove('open');
  document.getElementById('detailDrawer').setAttribute('aria-hidden', 'true');
  if (!document.getElementById('placePickerDrawer').classList.contains('open') && !document.getElementById('filterDrawer').classList.contains('open')) {
    document.getElementById('drawerScrim').classList.add('hidden');
    document.body.classList.remove('drawer-open');
  }
}

function openPlacePicker() {
  const drawer = document.getElementById('placePickerDrawer');
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  document.getElementById('drawerScrim').classList.remove('hidden');
  document.body.classList.add('drawer-open');
  state.placePickerOpen = true;
  setTimeout(() => document.getElementById('placeSearchMobile').focus(), 50);
}

function closePlacePicker() {
  const drawer = document.getElementById('placePickerDrawer');
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  state.placePickerOpen = false;
  if (!document.getElementById('detailDrawer').classList.contains('open') && !document.getElementById('filterDrawer').classList.contains('open')) {
    document.getElementById('drawerScrim').classList.add('hidden');
    document.body.classList.remove('drawer-open');
  }
}

function syncPlaceControls() {
  document.querySelectorAll('[data-place-filter]').forEach((button) => button.classList.toggle('active', button.dataset.placeFilter === state.placeFilter));
  document.querySelectorAll('[data-place-sort]').forEach((button) => button.classList.toggle('active', button.dataset.placeSort === state.placeSort));
}

function renderPlacePickerSummary(visiblePlaces, hiddenPlaces) {
  const label = document.getElementById('placePickerLabel');
  if (!label) return;
  const selected = store(state.selectedPlaceId);
  const visibleCount = visiblePlaces.length;
  const hiddenSuffix = hiddenPlaces.length ? ` + ${hiddenPlaces.length} hidden` : '';
  label.textContent = selected ? `${selected.name} · ${visibleCount} shown${hiddenSuffix}` : `${visibleCount} places${hiddenSuffix}`;
}

function openFilters() {
  document.getElementById('filterDrawer').classList.add('open');
  document.getElementById('filterDrawer').setAttribute('aria-hidden', 'false');
  document.getElementById('drawerScrim').classList.remove('hidden');
}

function closeFilters() {
  document.getElementById('filterDrawer').classList.remove('open');
  document.getElementById('filterDrawer').setAttribute('aria-hidden', 'true');
  if (!document.getElementById('detailDrawer').classList.contains('open')) document.getElementById('drawerScrim').classList.add('hidden');
}

function applyFilters() {
  state.filters.research = [...document.querySelectorAll('input[name="research"]:checked')].map((input) => input.value);
  state.filters.confidence = [...document.querySelectorAll('input[name="confidence"]:checked')].map((input) => input.value);
  state.filters.planningGroups = [...document.querySelectorAll('input[name="planningGroup"]:checked')].map((input) => input.value);
  state.filters.distance = Number(document.getElementById('distanceFilter').value);
  state.filters.hideCompetitive = document.getElementById('hideCompetitive').checked;
  state.filters.onlyFree = document.getElementById('onlyFree').checked;
  closeFilters();
  renderCurrentRoute();
}

function resetFilters() {
  state.filters = { research: ['partial', 'wizards-discovery'], confidence: ['high', 'medium', 'low'], planningGroups: ['limited', 'best', 'promising', 'verify', 'maybe'], distance: 30, hideCompetitive: true, onlyFree: false };
  document.querySelectorAll('input[name="research"], input[name="confidence"]').forEach((input) => input.checked = true);
  document.querySelectorAll('input[name="planningGroup"]').forEach((input) => input.checked = input.value !== 'hidden');
  document.getElementById('distanceFilter').value = 30;
  document.getElementById('distanceValue').textContent = '30 miles';
  document.getElementById('hideCompetitive').checked = true;
  document.getElementById('onlyFree').checked = false;
}

function activeFilterCount() {
  let count = 0;
  if (state.filters.research.length < 2) count++;
  if (state.filters.confidence.length < 3) count++;
  if ((state.filters.planningGroups || []).length !== 5 || state.filters.planningGroups.includes('hidden')) count++;
  if (state.filters.distance !== 30) count++;
  if (!state.filters.hideCompetitive) count++;
  if (state.filters.onlyFree) count++;
  return count;
}

function googleCalendarUrl(event, place, date) {
  const [hour = 18, minute = 0] = (eventStartTime(event) || '18:00').split(':').map(Number);
  const start = new Date(date); start.setHours(hour, minute, 0, 0);
  const end = new Date(start);
  if (event.endTime) {
    const [endHour, endMinute = 0] = event.endTime.split(':').map(Number);
    end.setHours(endHour, endMinute, 0, 0);
  } else {
    end.setHours(end.getHours() + 3);
  }
  const stamp = (value) => value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const params = new URLSearchParams({ action: 'TEMPLATE', text: event.title, dates: `${stamp(start)}/${stamp(end)}`, details: meaningfulEventDetails(event), location: place?.address || event.physicalLocation || '' });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function evidenceSourceList(sources) {
  if (!sources.length) return '<p class="muted-copy">No normalized sources are linked yet.</p>';
  const visible = sources.slice(0, 8);
  const hidden = sources.slice(8);
  const visibleRows = `<div class="source-list evidence-list">${visible.map((item) => sourceRow(item, true)).join('')}</div>`;
  if (!hidden.length) return visibleRows;
  return `${visibleRows}<details class="evidence-overflow"><summary>Show ${hidden.length} more source${hidden.length === 1 ? '' : 's'}</summary><div class="source-list evidence-list">${hidden.map((item) => sourceRow(item, true)).join('')}</div></details>`;
}

function artifactsFor(targetType, targetId) {
  return DATA.artifacts.filter((artifact) =>
    artifact.links.some((link) => link.targetType === targetType && link.targetId === targetId)
  );
}

function artifactsForEvent(event) {
  const ids = new Set([event?.id, event?.seriesId].filter(Boolean));
  const sourceIds = new Set(event?.sourceIds || []);
  return DATA.artifacts.filter((artifact) =>
    artifact.links.some((link) =>
      ((link.targetType === 'event_occurrence' || link.targetType === 'event_series') && ids.has(link.targetId))
      || (link.targetType === 'source' && sourceIds.has(link.targetId))
      || sourceIds.has(artifact.sourceId)
    )
  );
}

function artifactsForSignal(signal) {
  const direct = artifactsFor('signal', signal.id);
  const derivedEvents = signal.derivedFromChangeId
    ? eventIngestDeltaMatches(changeById(signal.derivedFromChangeId)).filter((event) => !isEventHidden(event)).flatMap(artifactsForEvent)
    : [];
  if (signal.relatedEntityType !== 'event_series' && signal.relatedEntityType !== 'event_occurrence') {
    return [...new Map([...direct, ...derivedEvents].map((artifact) => [artifact.id, artifact])).values()];
  }
  const related = artifactsFor(signal.relatedEntityType, signal.relatedEntityId);
  return [...new Map([...direct, ...derivedEvents, ...related].map((artifact) => [artifact.id, artifact])).values()];
}

function artifactEvidenceList(artifacts) {
  return `<div class="artifact-evidence-list">${artifacts.map(artifactEvidenceRow).join('')}</div>`;
}

function artifactEvidenceRow(artifact) {
  const date = artifact.publishedAt ? formatFreshnessDate(artifact.publishedAt) : 'Date unknown';
  return `<button class="artifact-evidence-row" data-action="open-artifact" data-artifact-id="${artifact.id}"><span class="artifact-evidence-icon" aria-hidden="true">${imageEvidenceIcon()}</span><span><strong>${escapeHtml(artifact.summary || 'Retained source image')}</strong><small>${escapeHtml(artifact.platform || 'source')} · ${escapeHtml(date)}</small></span><span class="artifact-evidence-open">View</span></button>`;
}

function imageEvidenceIcon() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v13H4zM7 15l3.1-3.2 2.5 2.4 1.8-1.8L18 16M16.2 9.2h.01"/></svg>';
}

async function openArtifactPreview(artifactId) {
  const artifact = DATA.artifacts.find((item) => item.id === artifactId);
  if (!artifact || !personalAuth.client || !personalAuth.user) return;
  openDrawer(`<div class="drawer-kicker"><span class="status-chip violet">Source image</span></div><h1 id="drawerTitle">Loading evidence…</h1>`);
  try {
    const { data, error } = await personalAuth.client.storage
      .from('source-artifacts')
      .download(artifact.storagePath);
    if (error) throw error;
    if (artifactPreviewUrl) URL.revokeObjectURL(artifactPreviewUrl);
    artifactPreviewUrl = URL.createObjectURL(data);
    const sourceItem = source(artifact.sourceId);
    const facts = artifactFactRows(artifact.facts);
    openDrawer(`<div class="drawer-kicker"><span class="status-chip violet">Source image</span><span class="status-chip slate">${escapeHtml(artifact.confidence || 'analyzed')} confidence</span></div><h1 id="drawerTitle">${escapeHtml(artifact.summary || 'Retained source evidence')}</h1><p class="drawer-lead">${escapeHtml(artifact.platform || 'source')} · ${escapeHtml(artifact.publishedAt ? formatFreshnessDate(artifact.publishedAt) : 'date unknown')}</p><figure class="artifact-preview"><img src="${escapeHtml(artifactPreviewUrl)}" alt="${escapeHtml(artifact.summary || 'Retained source image')}"></figure>${facts ? `<section class="drawer-section"><p class="eyebrow">Extracted facts</p><div class="artifact-facts">${facts}</div></section>` : ''}${artifact.extractedText ? `<details class="artifact-transcript"><summary>View extracted text</summary><p>${escapeHtml(artifact.extractedText)}</p></details>` : ''}<div class="drawer-action-grid artifact-actions">${artifact.originUrl ? `<a class="soft-button" href="${escapeHtml(artifact.originUrl)}" target="_blank" rel="noreferrer">Open original source ↗</a>` : ''}${sourceItem?.url && sourceItem.url !== artifact.originUrl ? `<a class="soft-button" href="${escapeHtml(sourceItem.url)}" target="_blank" rel="noreferrer">Open source page ↗</a>` : ''}</div>`);
  } catch (error) {
    console.warn('Source artifact download failed.', error);
    openDrawer(`<div class="drawer-kicker"><span class="status-chip coral">Evidence unavailable</span></div><h1 id="drawerTitle">The image could not be opened</h1><p class="drawer-lead">The retained evidence record is still intact. Try again after refreshing your sign-in.</p>`);
  }
}

function artifactFactRows(facts = {}) {
  const labels = {
    organizer: 'Organizer',
    effective_date: 'Effective date',
    date: 'Event date',
    start_time: 'Start time',
    no_events: 'Events held',
    official_store_programming: 'Official store event',
    user_involved: 'Involves you'
  };
  const rows = Object.entries(facts)
    .filter(([key]) => labels[key])
    .map(([key, value]) => {
      const display = key === 'no_events'
        ? (value ? 'No' : 'Yes')
        : typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
      return `<div><span>${escapeHtml(labels[key])}</span><strong>${escapeHtml(display)}</strong></div>`;
    })
    .join('');
  const hours = facts.hours && typeof facts.hours === 'object'
    ? Object.entries(facts.hours)
      .map(([label, value]) => `${label}: ${value}`)
      .join(' · ')
    : '';
  return `${rows}${hours ? `<div><span>Hours</span><strong>${escapeHtml(hours)}</strong></div>` : ''}`;
}

function sourceRow(item, prominent = false) {
  const contextLabel = item.sourceContextLabel || item.type || 'source';
  const dateLabel = item.sourceDateLabel || `checked ${item.lastChecked || 'date unknown'}`;
  const content = `<span class="source-icon">${sourceIcon(item.type)}</span><span><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(contextLabel)} · ${escapeHtml(dateLabel)}</small></span><span>${item.url ? '↗' : '—'}</span>`;
  if (!item.url) return `<div class="source-row ${prominent ? 'prominent' : ''} source-row-static">${content}</div>`;
  return `<a class="source-row ${prominent ? 'prominent' : ''}" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${content}</a>`;
}

function sourceIcon(type = '') {
  if (/social|community/i.test(type)) return '◎';
  if (/calendar|event/i.test(type)) return '▦';
  if (/official|website/i.test(type)) return '⌂';
  return '↗';
}

function initials(name) { return name.split(/\s+/).filter((word) => !/^(and|the|-)$/.test(word.toLowerCase())).slice(0, 2).map((word) => word[0]).join('').toUpperCase(); }

function emptyState(title, copy) { return `<div class="empty-state"><span>⌁</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(copy)}</p></div>`; }

function toast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.getElementById('toastRegion').appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

async function importFiles(event) {
  for (const file of event.target.files) {
    const key = file.name.replace('.json', '');
    if (Object.hasOwn(DATA, key)) DATA[key] = JSON.parse(await file.text());
  }
  renderAll();
  toast('Updated data loaded for this session');
}

load().catch((error) => {
  document.body.innerHTML = `<main class="load-error"><h1>MTG Events needs a local web server</h1><p>${escapeHtml(error.message)}</p><p>Open this project through its normal preview or hosted address so the research files can load.</p></main>`;
});
