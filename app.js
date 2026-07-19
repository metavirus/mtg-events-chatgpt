const DATA = { stores: [], events: [], sources: [], changes: [] };

const SUPABASE = {
  url: 'https://pyvftzsodzwfqncjbmbc.supabase.co',
  publishableKey: 'sb_publishable_So6NutzmRqZnWIRis9uI1g_E1AT06Wm'
};

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
    name: 'MTG OC / ProjectCCG',
    region: 'Orange County',
    status: 'discovery',
    formats: ['Magic', 'Community'],
    channel: 'Discord',
    summary: 'An Orange County community surface selected for Magic and local coverage. It may provide useful cross-store discovery and player coordination.',
    signal: 'Regional discovery lead',
    nextQuestion: 'Clarify whether the useful unit is one community, several channels, or organizer-linked venue activity.'
  }
];

const state = {
  route: 'today',
  view: 'agenda',
  date: startOfDay(new Date()),
  agendaDays: 42,
  preset: 'all',
  eventCatalogView: 'list',
  eventCatalogFilter: 'all',
  eventCatalogDate: startOfDay(new Date()),
  changeFilter: 'all',
  favoritesOnly: false,
  highlightsCollapsed: false,
  search: '',
  selectedPlaceId: null,
  selectedPlaceTab: 'overview',
  placeFilter: 'all',
  placeSort: 'name',
  filters: {
    research: ['partial', 'wizards-discovery'],
    confidence: ['high', 'medium', 'low'],
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
    return { ...defaultPersonal(), ...saved, hidden: saved.hidden || {} };
  } catch (_) {
    return defaultPersonal();
  }
}

function defaultPersonal() {
  return { favorites: {}, hidden: {}, ratings: {}, notes: {}, interested: {}, activity: [], updatesSeenAt: null };
}

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

function latestAcceptedChangeTimestamp() {
  return DATA.changes.reduce((latest, change) => {
    if ((change?.reviewStatus || '').toLowerCase() !== 'accepted') return latest;
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
  return DATA.changes.filter((change) => (change?.detectedAt || '') > seenAt).length;
}

function markChangesRead() {
  const latest = latestChangeTimestamp();
  if (!latest || state.personal.updatesSeenAt === latest) return;
  state.personal.updatesSeenAt = latest;
  savePersonal();
}

function compareText(a, b, options = { sensitivity: 'base' }) {
  return String(a ?? '').localeCompare(String(b ?? ''), undefined, options);
}

async function load() {
  const dataSource = new URLSearchParams(window.location.search).get('data');
  if (dataSource !== 'json') {
    try {
      await loadFromSupabase();
      state.dataSource = 'supabase';
      state.selectedPlaceId = placesByName()[0]?.id || DATA.stores[0]?.id;
      initialize();
      return;
    } catch (error) {
      console.warn('Supabase read failed; falling back to JSON snapshot.', error);
      state.dataSource = 'json-fallback';
    }
  } else {
    state.dataSource = 'json';
  }
  await loadFromJson();
  state.selectedPlaceId = placesByName()[0]?.id || DATA.stores[0]?.id;
  initialize();
}

async function loadFromJson() {
  for (const key of ['stores', 'events', 'sources', 'changes']) {
    const response = await fetch(`${key}.json`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load ${key}.json`);
    DATA[key] = await response.json();
  }
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
    supabaseRows('research_changes')
  ]);
  const [venues, communities, sources, entitySources, series, occurrences, eventSources, evaluations, changes] = tables;
  const evaluationByEntity = new Map(evaluations.map((item) => [`${item.entity_type}:${item.entity_id}`, item]));
  const sourceIdsByEntity = groupValues(entitySources, (item) => `${item.entity_type}:${item.entity_id}`, (item) => item.source_id);
  const sourcesBySeries = groupValues(eventSources.filter((item) => item.series_id), (item) => item.series_id, (item) => item.source_id);
  const sourcesByOccurrence = groupValues(eventSources.filter((item) => item.occurrence_id), (item) => item.occurrence_id, (item) => item.source_id);
  const seriesById = new Map(series.map((item) => [item.id, item]));
  const occurrenceSeriesIds = new Set(occurrences.map((item) => item.series_id));

  DATA.stores = venues.map((item) => mapVenue(item, sourceIdsByEntity, evaluationByEntity));
  DATA.sources = sources.map(mapSource);
  DATA.changes = changes.map(mapResearchChange);
  DATA.events = [
    ...series.filter((item) => !occurrenceSeriesIds.has(item.id)).map((item) => mapEventSeries(item, sourcesBySeries)),
    ...occurrences.map((item) => mapEventOccurrence(item, seriesById.get(item.series_id), sourcesByOccurrence))
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
  const response = await fetch(`${SUPABASE.url}/rest/v1/${table}?select=*`, {
    headers: {
      apikey: SUPABASE.publishableKey,
      Authorization: `Bearer ${SUPABASE.publishableKey}`
    },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`Supabase could not load ${table}`);
  return response.json();
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

function mapVenue(item, sourceIdsByEntity, evaluationByEntity) {
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
    evaluation: mapEvaluation(evaluationByEntity.get(`venue:${item.id}`)),
    assessment: item.assessment || {},
    assessmentNotes: item.assessment_notes || '',
    sourceIds: sourceIdsByEntity.get(`venue:${item.id}`) || []
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
    reviewStatus: item.review_status
  };
}

function mapEventSeries(item, sourcesBySeries) {
  return {
    id: item.id,
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
    sourceIds: sourcesBySeries.get(item.id) || [],
    sourceId: (sourcesBySeries.get(item.id) || [])[0],
    lastVerified: item.last_verified || '',
    confidence: item.confidence,
    status: item.event_status
  };
}

function mapEventOccurrence(item, series, sourcesByOccurrence) {
  if (!series) return null;
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
    entryFee: item.entry_fee == null ? (series.entry_fee == null ? null : Number(series.entry_fee)) : Number(item.entry_fee),
    capacity: item.capacity,
    currency: series.currency || 'USD',
    details: item.details || series.details || '',
    sourceIds: sourcesByOccurrence.get(item.id) || [],
    sourceId: (sourcesByOccurrence.get(item.id) || [])[0],
    lastVerified: series.last_verified || '',
    confidence: occurrenceConfidence(item.evidence_state, series.confidence),
    status: series.event_status,
    occurrenceStatus: item.occurrence_status || null
  };
}

function normalizeRecurrence(value, defaultStartTime) {
  if (!value) return null;
  const recurrence = { ...value };
  if (!recurrence.startTime && defaultStartTime) recurrence.startTime = normalizeTime(defaultStartTime);
  return recurrence;
}

function normalizeTime(value) {
  if (!value) return null;
  return String(value).slice(0, 5);
}

function occurrenceConfidence(evidenceState, fallback) {
  if (/confirmed|multi|strong/i.test(evidenceState || '')) return 'high';
  return fallback || 'medium';
}

function initialize() {
  document.body.dataset.dataSource = state.dataSource;
  bindStaticEvents();
  routeFromHash();
  renderAll();
}

function bindStaticEvents() {
  document.addEventListener('click', handleClick);
  document.addEventListener('keydown', handleKeys);
  document.getElementById('globalSearch').addEventListener('input', (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderCurrentRoute();
  });
  document.getElementById('placeSearch').addEventListener('input', renderPlaces);
  document.getElementById('distanceFilter').addEventListener('input', (event) => {
    document.getElementById('distanceValue').textContent = `${event.target.value} miles`;
  });
  document.getElementById('fileImport').addEventListener('change', importFiles);
  window.addEventListener('hashchange', routeFromHash);
}

function handleClick(event) {
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
    document.querySelectorAll('[data-event-catalog-view]').forEach((button) => button.classList.toggle('active', button === catalogViewButton));
    renderEventCatalog();
    return;
  }

  const catalogFilterButton = event.target.closest('[data-event-catalog-filter]');
  if (catalogFilterButton) {
    state.eventCatalogFilter = toggledFilterValue(catalogFilterButton, 'eventCatalogFilter', 'all');
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

  const eventTrigger = event.target.closest('[data-event-id]');
  if (eventTrigger && !event.target.closest('[data-favorite]') && !event.target.closest('[data-place-id]')) {
    const occurrenceDate = eventTrigger.dataset.date;
    return openEvent(eventTrigger.dataset.eventId, occurrenceDate);
  }

  const placeTrigger = event.target.closest('[data-place-id]');
  if (placeTrigger && !event.target.closest('[data-favorite]') && !event.target.closest('[data-action]')) {
    if (placeTrigger.dataset.placeMode === 'drawer') return openPlaceDrawer(placeTrigger.dataset.placeId);
    if (state.selectedPlaceId !== placeTrigger.dataset.placeId) state.selectedPlaceTab = 'overview';
    state.selectedPlaceId = placeTrigger.dataset.placeId;
    navigate('places');
    renderPlaces();
    return;
  }

  const communityTrigger = event.target.closest('[data-community-id]');
  if (communityTrigger && !event.target.closest('[data-favorite]')) return openCommunity(communityTrigger.dataset.communityId);

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

  if (event.target.closest('#prevDate')) return moveDate(-1);
  if (event.target.closest('#nextDate')) return moveDate(1);
  if (event.target.closest('#resetToday')) { state.date = startOfDay(new Date()); state.agendaDays = 42; return renderCalendar(); }
  if (event.target.closest('#prevEventCatalogRange')) return moveEventCatalogDate(-1);
  if (event.target.closest('#nextEventCatalogRange')) return moveEventCatalogDate(1);
  if (event.target.closest('#resetEventCatalogRange')) { state.eventCatalogDate = startOfDay(new Date()); return renderEventCatalog(); }
  if (event.target.closest('#jumpWeekend')) return jumpToWeekend();
  if (event.target.closest('#openFilters') || event.target.closest('[data-action="open-filters"]')) return openFilters();
  if (event.target.closest('[data-close-filters]')) return closeFilters();
  if (event.target.closest('#applyFilters')) return applyFilters();
  if (event.target.closest('#clearFilters')) return resetFilters();
  if (event.target.closest('#favoritesToggle')) return toggleFavoritesOnly();
  if (event.target.closest('#coverageButton')) return navigate('research');
  if (event.target.closest('#toggleHighlights')) return toggleHighlightsRail();
  if (event.target.closest('#drawerClose') || event.target.id === 'drawerScrim') return closeDrawer();
  if (event.target.closest('.banner-close')) return document.getElementById('coverageBanner').remove();
  if (event.target.closest('#activityLogButton')) return openActivityLog();
  if (event.target.closest('#openQuickNote')) return openQuickNote();
  if (event.target.closest('#mobileMenu') || event.target.closest('#mobileMore')) return document.querySelector('.side-rail').classList.toggle('mobile-open');
}

function toggledFilterValue(button, datasetKey, defaultValue = 'all') {
  const value = button.dataset[datasetKey];
  return value !== defaultValue && button.classList.contains('active') ? defaultValue : value;
}

function handleKeys(event) {
  if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    event.preventDefault();
    document.getElementById('globalSearch').focus();
  }
  if (event.key === 'Escape') {
    closeDrawer();
    closeFilters();
    document.querySelector('.side-rail').classList.remove('mobile-open');
  }
}

function handleAction(action, element) {
  if (action === 'open-filters') return openFilters();
  if (action === 'day-popover') return openDay(element.dataset.dayDate);
  if (action === 'load-more') { state.agendaDays += 28; return renderCalendar(); }
  if (action === 'explain-scores') return openScoreExplanation(store(state.selectedPlaceId));
  if (action === 'show-highlights-hub') return openHighlightsHub();
  if (action === 'show-fresh-signals') return openFreshSignals();
  if (action === 'show-promising-nearby') return openPromisingNearby();
  if (action === 'show-discovery-queue') return openDiscoveryQueue();
  if (action === 'show-reviewed-places') return openReviewedPlaces();
  if (action === 'show-source-records') return navigate('places');
  if (action === 'show-format-balance') return navigate('events');
  if (action === 'save-note') return saveNote(element.dataset.entity, element.dataset.input);
  if (action === 'show-log') return openActivityLog();
  if (action === 'dismiss-drawer') return closeDrawer();
  if (action === 'toggle-place-hidden') return toggleHidden(`place:${element.dataset.placeId}`);
}

function navigate(route) {
  if (!document.querySelector(`[data-route-panel="${route}"]`)) return;
  state.route = route;
  if (route === 'changes') markChangesRead();
  history.replaceState(null, '', `#${route}`);
  document.querySelectorAll('[data-route-panel]').forEach((panel) => panel.classList.toggle('active', panel.dataset.routePanel === route));
  document.querySelectorAll('.nav-item[data-route], .mobile-nav [data-route]').forEach((button) => button.classList.toggle('active', button.dataset.route === route));
  document.querySelector('.side-rail').classList.remove('mobile-open');
  renderCurrentRoute();
  document.querySelector('.workspace').scrollTo?.(0, 0);
}

function routeFromHash() {
  const route = location.hash.replace('#', '') || 'today';
  navigate(document.querySelector(`[data-route-panel="${route}"]`) ? route : 'today');
}

function renderAll() {
  renderCalendar();
  renderHighlights();
  renderEventCatalog();
  renderPlaces();
  renderCommunities();
  renderChanges();
  renderResearch();
  updateChrome();
}

function renderCurrentRoute() {
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
  favoriteButton.title = favCount ? `${favCount} favorites` : 'No favorites yet';
  const unreadCount = unreadChangesCount();
  const changeNavCount = document.getElementById('changeNavCount');
  changeNavCount.textContent = unreadCount ? String(unreadCount) : '';
  changeNavCount.hidden = unreadCount === 0;
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
function updateFreshnessMini() {
  const container = document.getElementById('freshnessMini');
  if (!container) return;
  const latest = latestDataTimestamp();
  const sourceLabel = state.dataSource === 'supabase' ? 'Supabase live data' : state.dataSource === 'json' ? 'JSON fallback' : 'JSON recovery fallback';
  const latestLabel = latest ? formatFreshnessDateTime(latest) : 'No dated record';
  container.innerHTML = `<span class="status-dot"></span><span>${sourceLabel}<br><strong>${escapeHtml(latestLabel)}</strong></span>`;
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
function isSpecial(event) { return /prerelease|sealed|draft|limited|party|special/i.test(`${event.eventType} ${event.title} ${event.format}`); }
function isWeekend(date) { return [5, 6, 0].includes(date.getDay()); }

function eventMatchesSharedFilters(event, options = {}) {
  const { includePreset = true, includeSearch = true, hideCompetitive = state.route === 'today' && state.filters.hideCompetitive } = options;
  const place = store(event.storeId);
  if (!place) return false;
  if (!state.filters.research.includes(place.researchStatus)) return false;
  if (!state.filters.confidence.includes(event.confidence)) return false;
  if (numericDistance(place) != null && numericDistance(place) > state.filters.distance) return false;
  if (state.filters.onlyFree && Number(event.entryFee || 0) !== 0) return false;
  if (hideCompetitive && isCompetitive(event)) return false;
  if (state.favoritesOnly && !state.personal.favorites[`event:${event.id}`] && !state.personal.favorites[`place:${place.id}`]) return false;
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
      place.name,
      place.city,
      place.address,
      place.researchStatus,
      place.assessmentNotes,
      ...(place.tags || []),
      ...(place.communitySignals || [])
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
  if (preset === 'favorites') return !!state.personal.favorites[`event:${event.id}`] || !!state.personal.favorites[`place:${event.storeId}`];
  return true;
}

function rangeForView() {
  if (state.view === 'agenda') return { start: startOfDay(state.date), end: endOfDay(addDays(state.date, state.agendaDays)) };
  if (state.view === 'week') {
    const start = fridayWeekStart(state.date);
    return { start, end: endOfDay(addDays(start, 6)) };
  }
  return { start: new Date(state.date.getFullYear(), state.date.getMonth(), 1), end: endOfDay(new Date(state.date.getFullYear(), state.date.getMonth() + 1, 0)) };
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
      let cursor = startOfDay(start);
      while (cursor.getDay() !== event.recurrence.dayOfWeek) cursor = addDays(cursor, 1);
      const earliest = event.startDate ? startOfDay(parseDate(event.startDate)) : startOfDay(start);
      const latest = event.endDate ? endOfDay(parseDate(event.endDate)) : null;
      while (cursor <= end) {
        if (cursor >= earliest && (!latest || cursor <= latest)) items.push({ ...event, occurrenceDate: new Date(cursor), occurrenceStatus: 'projected' });
        cursor = addDays(cursor, 7);
      }
    } else if (event.date || event.startDate) {
      const date = parseDate(event.date || event.startDate);
      if (date >= start && date <= end) items.push({ ...event, occurrenceDate: date, occurrenceStatus: 'confirmed' });
    }
  }
  const filtered = applyFilters ? items.filter(matchesFilters) : items;
  return filtered.sort((a, b) => a.occurrenceDate - b.occurrenceDate || compareText(eventStartTime(a), eventStartTime(b)));
}

function matchesFilters(event) {
  return eventMatchesSharedFilters(event);
}

function fitScore(event) {
  const place = store(event.storeId);
  if (!place) return 0;
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
  if (/no prox/i.test(`${event.details} ${place.assessmentNotes}`)) score -= 12;
  if (isSpecial(event) && /prerelease|sealed/i.test(`${event.title} ${event.eventType}`)) score += 8;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function fitLabel(event) {
  const score = fitScore(event);
  if (isCompetitive(event)) return { label: 'Competitive lane', tone: 'coral' };
  if (score >= 78) return { label: 'Strong fit', tone: 'mint' };
  if (score >= 64) return { label: 'Promising', tone: 'sky' };
  return { label: 'Worth a look', tone: 'slate' };
}

function evidenceLabel(event) {
  const place = store(event.storeId);
  if (event.occurrenceStatus === 'confirmed') return { label: 'Dated listing', tone: 'mint' };
  if (event.confidence === 'high' && place?.researchStatus === 'partial') return { label: 'Supported routine', tone: 'sky' };
  if (place?.researchStatus === 'wizards-discovery') return { label: 'Discovery-level', tone: 'amber' };
  return { label: 'Expected routine', tone: 'amber' };
}

function renderCalendar() {
  const { start, end } = rangeForView();
  const events = buildOccurrences(start, end);
  const label = state.view === 'month'
    ? state.date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
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
  const bestBets = rankedTodayLeads(events).slice(0, 5);
  const bestIds = new Set(bestBets.map(todayLeadKey));
  let html = `<div class="agenda-intro"><div><span class="live-dot"></span><strong>${events.length} opportunities</strong> in this window</div><span>Scroll toward future dates</span></div>`;
  if (bestBets.length) {
    html += `<section class="today-best-bets" aria-label="Best near-term bets">
      <div class="today-section-heading"><div><p class="eyebrow mint">Best bets</p><h2>Strong near-term leads</h2></div><span>${bestBets.length} highlighted</span></div>
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
    .filter((event) => !isCompetitive(event))
    .sort((a, b) => todayLeadScore(b) - todayLeadScore(a) || a.occurrenceDate - b.occurrenceDate || compareText(eventStartTime(a), eventStartTime(b)));
}

function todayLeadScore(event) {
  const place = store(event.storeId);
  const daysAway = Math.max(0, Math.round((startOfDay(event.occurrenceDate) - startOfDay(new Date())) / 86400000));
  const favoriteBonus = state.personal.favorites[`event:${event.id}`] || state.personal.favorites[`place:${event.storeId}`] ? 18 : 0;
  const weekendBonus = isWeekend(event.occurrenceDate) ? 10 : 0;
  const reviewedBonus = place?.researchStatus === 'partial' ? 8 : 0;
  const confidenceBonus = event.confidence === 'high' ? 8 : event.confidence === 'medium' ? 3 : 0;
  const specialBonus = /prerelease|sealed|limited/i.test(`${event.title} ${event.format} ${event.eventType}`) ? 14 : isSpecial(event) ? 8 : 0;
  const commanderBonus = /commander|edh/i.test(`${event.title} ${event.format} ${event.eventType}`) ? 8 : 0;
  const draftBonus = /draft/i.test(`${event.title} ${event.format} ${event.eventType}`) ? 4 : 0;
  const discoveryPenalty = place?.researchStatus === 'wizards-discovery' ? 10 : 0;
  return fitScore(event) + favoriteBonus + weekendBonus + reviewedBonus + confidenceBonus + specialBonus + commanderBonus + draftBonus - discoveryPenalty - Math.min(daysAway, 21);
}

function todayLeadKey(event) {
  return `${event.id}:${dateKey(event.occurrenceDate)}`;
}

function eventCard(event, compact = false, options = {}) {
  const { showDate = false, emphasize = false, catalog = false } = options;
  const place = store(event.storeId);
  const fit = fitLabel(event);
  const evidence = evidenceLabel(event);
  const favoriteKey = `event:${event.id}`;
  const isFavorite = !!state.personal.favorites[favoriteKey];
  const fee = event.entryFee == null ? 'Fee unknown' : Number(event.entryFee) === 0 ? 'Free' : `$${event.entryFee}`;
  const occurrence = event.occurrenceDate || parseDate(event.date || event.startDate);
  const dateNote = occurrence ? occurrence.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : '';
  if (compact) {
    const cue = compactEventCue(event, fit, evidence);
    return `<button class="compact-event ${isCompetitive(event) ? 'competitive' : ''} ${cue.className}" data-event-id="${escapeHtml(event.id)}" data-date="${dateKey(event.occurrenceDate)}"><span class="compact-event-time">${formatTime(eventStartTime(event))}</span><strong>${escapeHtml(event.title)}</strong><small>${escapeHtml(place.name)}</small><em>${escapeHtml(cue.label)}</em></button>`;
  }
  return `<article class="event-card ${catalog ? 'catalog-event-card' : ''} ${isCompetitive(event) ? 'competitive' : ''} ${emphasize ? `fit-${fit.tone}` : ''}" data-event-id="${escapeHtml(event.id)}" data-date="${dateKey(event.occurrenceDate)}" tabindex="0">
    <div class="event-time"><strong>${formatTime(eventStartTime(event))}</strong><span>${event.recurrence?.frequency === 'weekly' ? 'Weekly' : 'One-off'}</span>${showDate && dateNote ? `<small>${dateNote}</small>` : ''}</div>
    <div class="event-main">
      <div class="event-topline"><span class="format-mark ${formatClass(event)}">${formatShort(event)}</span><h3>${escapeHtml(event.title)}</h3></div>
      <button class="place-inline" data-place-id="${escapeHtml(place.id)}" data-place-mode="drawer">${escapeHtml(place.name)} <span>· ${distanceLabel(place)}</span></button>
      <div class="event-chips"><span class="status-chip ${fit.tone}">${fit.label}</span><span class="status-chip ${evidence.tone}">${evidence.label}</span><span class="meta-chip">${fee}</span>${event.bracket && event.bracket !== 'unspecified' ? `<span class="meta-chip">Bracket ${escapeHtml(event.bracket)}</span>` : '<span class="meta-chip muted-chip">Bracket unknown</span>'}</div>
      <p>${escapeHtml(truncate(event.details || 'Details are limited in the current source.', 175))}</p>
    </div>
    <div class="event-actions"><button class="heart-button ${isFavorite ? 'active' : ''}" data-favorite="${favoriteKey}" aria-label="${isFavorite ? 'Remove from' : 'Add to'} favorites">${isFavorite ? '♥' : '♡'}</button><span class="open-cue">Open details →</span></div>
  </article>`;
}

function formatClass(event) {
  if (/prerelease|sealed|limited/i.test(`${event.format} ${event.eventType}`)) return 'format-limited';
  if (/draft/i.test(`${event.format} ${event.eventType}`)) return 'format-draft';
  if (isCompetitive(event)) return 'format-competitive';
  return 'format-commander';
}

function compactEventCue(event, fit, evidence) {
  if (isCompetitive(event)) return { label: 'Check first', className: 'cue-caution' };
  if (fit.tone === 'mint') return { label: 'Best fit', className: 'cue-best' };
  if (fit.tone === 'sky') return { label: 'Promising', className: 'cue-promising' };
  if (evidence.tone === 'amber') return { label: 'Verify', className: 'cue-verify' };
  return { label: 'Maybe', className: 'cue-neutral' };
}

function formatShort(event) {
  if (/prerelease/i.test(`${event.title} ${event.eventType}`)) return 'PR';
  if (/sealed|limited/i.test(`${event.format} ${event.eventType}`)) return 'SE';
  if (/draft/i.test(`${event.format} ${event.eventType}`)) return 'DR';
  if (isCompetitive(event)) return 'C4';
  return 'EDH';
}

function renderWeek(events, start) {
  const weekendCount = events.filter((event) => isWeekend(event.occurrenceDate)).length;
  document.getElementById('calendarContent').innerHTML = `<div class="week-helper"><span>${weekendCount} Fri-Sun matches this week</span><span>Weekend columns are emphasized for planning.</span></div><div class="week-grid">${Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    const dayEvents = events.filter((event) => dateKey(event.occurrenceDate) === dateKey(date));
    return `<section class="week-column ${isWeekend(date) ? 'weekend-column' : ''}"><header><span>${date.toLocaleDateString(undefined, { weekday: 'short' })}</span><strong>${date.getDate()}</strong>${dateKey(date) === dateKey(new Date()) ? '<em>Today</em>' : ''}</header><div>${dayEvents.map((event) => eventCard(event, true)).join('') || '<p class="no-events">No matching events</p>'}</div></section>`;
  }).join('')}</div>`;
}

function renderMonth(events) {
  const first = new Date(state.date.getFullYear(), state.date.getMonth(), 1);
  const gridStart = addDays(first, -first.getDay());
  let html = `<div class="month-grid">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => `<div class="month-label">${day}</div>`).join('')}`;
  for (let index = 0; index < 42; index++) {
    const date = addDays(gridStart, index);
    const dayEvents = events.filter((event) => dateKey(event.occurrenceDate) === dateKey(date));
    html += `<section class="month-cell ${date.getMonth() !== state.date.getMonth() ? 'outside' : ''} ${isWeekend(date) ? 'weekend-cell' : ''}"><header><span>${date.getDate()}</span>${dateKey(date) === dateKey(new Date()) ? '<em>Today</em>' : ''}</header><div>${dayEvents.slice(0, 3).map((event) => eventCard(event, true)).join('')}${dayEvents.length > 3 ? `<button class="more-day" data-action="day-popover" data-day-date="${dateKey(date)}">+${dayEvents.length - 3} more</button>` : ''}</div></section>`;
  }
  document.getElementById('calendarContent').innerHTML = `${html}</div>`;
}

function moveDate(direction) {
  if (state.view === 'month') state.date = new Date(state.date.getFullYear(), state.date.getMonth() + direction, 1);
  else if (state.view === 'week') state.date = addDays(state.date, direction * 7);
  else state.date = addDays(state.date, direction * 14);
  renderCalendar();
}

function moveEventCatalogDate(direction) {
  if (state.eventCatalogView === 'month') state.eventCatalogDate = new Date(state.eventCatalogDate.getFullYear(), state.eventCatalogDate.getMonth() + direction, 1);
  else state.eventCatalogDate = addDays(state.eventCatalogDate, direction * 7);
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
  const notable = [...events].sort((a, b) => Number(isSpecial(b)) - Number(isSpecial(a)) || freshnessDays(a.lastVerified) - freshnessDays(b.lastVerified)).slice(0, 3);
  document.getElementById('newHighlights').innerHTML = notable.map((event) => highlightEvent(event)).join('');
  const bestPlaces = rankedStores().filter((place) => place.researchStatus === 'partial').slice(0, 3);
  document.getElementById('fitHighlights').innerHTML = bestPlaces.map((place, index) => `<button class="place-highlight" data-place-id="${place.id}"><span class="rank-number">0${index + 1}</span><span><strong>${escapeHtml(place.name)}</strong><small>${distanceLabel(place)} · ${placeFitPhrase(place)}</small></span><span>→</span></button>`).join('');
  const discoveryCount = DATA.stores.filter((place) => place.researchStatus === 'wizards-discovery').length;
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
    .sort((a, b) => Number(isSpecial(b)) - Number(isSpecial(a)) || freshnessDays(a.lastVerified) - freshnessDays(b.lastVerified) || a.occurrenceDate - b.occurrenceDate)
    .slice(0, limit);
}

function rankedStores() {
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

function storeScore(place) {
  return fitScoreFor(place) * 20 - Math.min(numericDistance(place) ?? 28, 40) + (place.researchStatus === 'partial' ? 8 : 0);
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
  const hidden = !!state.personal.hidden[`place:${place.id}`];
  return `<div class="evaluation-summary" aria-label="Current place evaluation">
    <button class="evaluation-tile" data-action="explain-scores"><span>Personal fit</span><strong>${escapeHtml(evaluation.fitGrade)}</strong><small>${Number(evaluation.fitScore).toFixed(1)} / 5 · promise for you</small></button>
    <button class="evaluation-tile" data-action="explain-scores"><span>Confidence</span><strong>${escapeHtml(evaluation.confidence)}</strong><small>How strongly the evidence supports that read</small></button>
    <button class="evaluation-tile" data-action="explain-scores"><span>Research depth</span><strong>${escapeHtml(placeResearchLabel(place))}</strong><small>${evaluation.candidateStatus === 'promoted' ? 'Promoted candidate' : evaluation.candidateStatus === 'working' ? 'Working candidate' : 'Discovery candidate'}</small></button>
  </div>
  <section class="preference-note ${hidden ? 'warning' : ''}"><p><strong>${hidden ? 'You deprioritized this place.' : 'Research and preference are separate.'}</strong> ${hidden ? 'It stays in the research record and the Deprioritized bucket, but should not be treated as a default recommendation.' : 'Favorites, ratings, and deprioritize choices affect your view without changing the underlying venue assessment.'}</p></section>
  <section class="detail-section assessment-snapshot"><div><p class="eyebrow">Pluses</p><ul>${evaluation.positives.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join('') || '<li>No strong positive factors are recorded yet.</li>'}</ul></div><div><p class="eyebrow">Cautions</p><ul>${evaluation.cautions.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join('') || '<li>No specific caution has been recorded yet.</li>'}</ul></div><div><p class="eyebrow">Open questions</p><ul>${evaluation.openQuestions.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join('') || '<li>No open question is recorded yet.</li>'}</ul></div></section>`;
}

function renderEventCatalog() {
  const catalogRange = eventCatalogRange();
  const rawStart = state.eventCatalogView === 'list' ? startOfDay(new Date()) : catalogRange.start;
  const rawEnd = state.eventCatalogView === 'list' ? endOfDay(addDays(rawStart, 56)) : catalogRange.end;
  const rawEvents = buildOccurrences(rawStart, rawEnd);
  const events = eventCatalogMatches(rawEvents);
  updateEventCatalogDateNav(catalogRange);
  document.getElementById('eventSummary').innerHTML = `<div><strong>${events.length}</strong><span>upcoming occurrences shown</span></div><div><strong>${new Set(events.map((event) => event.storeId)).size}</strong><span>places represented</span></div><div><strong>${events.filter(isSpecial).length}</strong><span>special / limited signals</span></div><div class="warning-stat"><strong>${state.eventCatalogFilter === 'best' ? 'Best-fit ordering' : 'Recommended first'}</strong><span>${state.eventCatalogView === 'list' ? 'full catalog list' : state.eventCatalogView === 'week' ? 'weekly layout' : 'monthly layout'}</span></div>`;
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
  const recommended = events.slice(0, 6);
  document.getElementById('eventCatalog').innerHTML = `<section class="catalog-featured" aria-label="Recommended events">
    <div class="today-section-heading"><div><p class="eyebrow mint">Recommended first</p><h2>High-signal events to scan first</h2></div><span>${recommended.length} surfaced</span></div>
    <div class="catalog-grid prioritized-grid">${recommended.map((event) => eventCard(event, false, { showDate: true, emphasize: true, catalog: true })).join('')}</div>
  </section>
  <section class="catalog-all-events">
    <div class="today-section-heading"><div><p class="eyebrow">Full catalog</p><h2>All matching events</h2></div><span>${events.length} total</span></div>
    <div class="catalog-grid">${events.slice(0, 120).map((event) => eventCard(event, false, { showDate: true, emphasize: recommended.some((item) => todayLeadKey(item) === todayLeadKey(event)), catalog: true })).join('')}</div>
  </section>`;
}

function eventCatalogRange() {
  if (state.eventCatalogView === 'month') {
    const start = new Date(state.eventCatalogDate.getFullYear(), state.eventCatalogDate.getMonth(), 1);
    return { start, end: endOfDay(new Date(start.getFullYear(), start.getMonth() + 1, 0)) };
  }
  const start = fridayWeekStart(state.eventCatalogDate);
  return { start, end: endOfDay(addDays(start, 6)) };
}

function updateEventCatalogDateNav(range) {
  const nav = document.getElementById('eventCatalogDateNav');
  const label = document.getElementById('eventCatalogDateLabel');
  if (!nav || !label) return;
  nav.classList.toggle('hidden', state.eventCatalogView === 'list');
  if (state.eventCatalogView === 'month') label.textContent = range.start.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  else label.textContent = `${range.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${range.end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function eventCatalogMatches(events) {
  let filtered = events.filter((event) => eventMatchesSharedFilters(event, { includePreset: false, includeSearch: true, hideCompetitive: false }));
  if (state.eventCatalogFilter === 'commander') {
    filtered = filtered.filter((event) => /commander|edh/i.test(`${event.title} ${event.format} ${event.eventType}`));
  } else if (state.eventCatalogFilter === 'limited') {
    filtered = filtered.filter((event) => /prerelease|sealed|limited/i.test(`${event.title} ${event.format} ${event.eventType}`));
  } else if (state.eventCatalogFilter === 'draft') {
    filtered = filtered.filter((event) => /draft/i.test(`${event.title} ${event.format} ${event.eventType}`));
  }
  const sorter = state.eventCatalogFilter === 'all' || state.eventCatalogFilter === 'best'
    ? (a, b) => eventCatalogPriority(b) - eventCatalogPriority(a) || a.occurrenceDate - b.occurrenceDate
    : (a, b) => a.occurrenceDate - b.occurrenceDate || compareText(eventStartTime(a), eventStartTime(b));
  return [...filtered].sort(sorter);
}

function eventCatalogPriority(event) {
  const reviewedBonus = store(event.storeId)?.researchStatus === 'partial' ? 8 : 0;
  const specialBonus = isSpecial(event) ? 10 : 0;
  const favoriteBonus = state.personal.favorites[`place:${event.storeId}`] || state.personal.favorites[`event:${event.id}`] ? 14 : 0;
  const competitivePenalty = isCompetitive(event) ? 18 : 0;
  return fitScore(event) * 10 + reviewedBonus + specialBonus + favoriteBonus - competitivePenalty;
}

function renderEventCatalogWeek(events, start) {
  const weekStart = fridayWeekStart(start);
  return `<div class="week-grid event-catalog-week">${Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const dayEvents = events.filter((event) => dateKey(event.occurrenceDate) === dateKey(date));
    return `<section class="week-column ${isWeekend(date) ? 'weekend-column' : ''}"><header><span>${date.toLocaleDateString(undefined, { weekday: 'short' })}</span><strong>${date.getDate()}</strong>${dateKey(date) === dateKey(new Date()) ? '<em>Today</em>' : ''}</header><div>${dayEvents.map((event) => eventCard(event, true)).join('') || '<p class="no-events">No matching events</p>'}</div></section>`;
  }).join('')}</div>`;
}

function renderEventCatalogMonth(events, start) {
  const first = new Date(start.getFullYear(), start.getMonth(), 1);
  const gridStart = addDays(first, -first.getDay());
  let html = `<div class="month-grid event-catalog-month">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => `<div class="month-label">${day}</div>`).join('')}`;
  for (let index = 0; index < 42; index++) {
    const date = addDays(gridStart, index);
    const dayEvents = events.filter((event) => dateKey(event.occurrenceDate) === dateKey(date));
    html += `<section class="month-cell ${date.getMonth() !== start.getMonth() ? 'outside' : ''} ${isWeekend(date) ? 'weekend-cell' : ''}"><header><span>${date.getDate()}</span>${dateKey(date) === dateKey(new Date()) ? '<em>Today</em>' : ''}</header><div>${dayEvents.slice(0, 3).map((event) => eventCard(event, true)).join('')}${dayEvents.length > 3 ? `<button class="more-day" data-action="day-popover" data-day-date="${dateKey(date)}">+${dayEvents.length - 3} more</button>` : ''}</div></section>`;
  }
  return `${html}</div>`;
}

function renderPlaces() {
  const list = document.getElementById('placeList');
  const query = document.getElementById('placeSearch').value.trim().toLowerCase();
  const sortedPlaces = state.placeSort === 'distance' ? placesByDistance() : placesByName();
  let places = sortedPlaces.filter((place) => !query || `${place.name} ${place.city} ${place.assessmentNotes}`.toLowerCase().includes(query));
  if (state.placeFilter === 'partial') places = places.filter((place) => place.researchStatus === 'partial');
  if (state.placeFilter === 'favorites') places = places.filter((place) => state.personal.favorites[`place:${place.id}`]);
  if (state.placeFilter === 'hidden') places = places.filter((place) => state.personal.hidden[`place:${place.id}`]);
  if (state.favoritesOnly) places = places.filter((place) => state.personal.favorites[`place:${place.id}`]);
  if (!places.some((place) => place.id === state.selectedPlaceId)) state.selectedPlaceId = places[0]?.id;
  list.innerHTML = places.map((place) => {
    const active = place.id === state.selectedPlaceId;
    const favorite = state.personal.favorites[`place:${place.id}`];
    const hidden = state.personal.hidden[`place:${place.id}`];
    const evaluation = normalizedEvaluation(place);
    return `<button class="entity-list-item ${active ? 'active' : ''} ${hidden ? 'deprioritized' : ''}" data-place-id="${place.id}"><span class="entity-avatar">${initials(place.name)}</span><span><strong>${escapeHtml(place.name)}</strong><small>${escapeHtml(place.city)} · ${distanceLabel(place)}</small><em class="${place.researchStatus === 'partial' ? 'mint-text' : 'amber-text'}">${place.researchStatus === 'partial' ? 'Reviewed / partial' : 'Discovery-level'} · ${escapeHtml(evaluation.fitGrade)} · ${escapeHtml(evaluation.confidence)} confidence</em></span><span class="list-heart">${hidden ? '↓' : favorite ? '♥' : ''}</span></button>`;
  }).join('') || emptyState('No places match', 'Try another name or filter.');
  renderPlaceDetail(store(state.selectedPlaceId));
}

function renderPlaceDetail(place) {
  const container = document.getElementById('placeDetail');
  if (!place) return container.innerHTML = emptyState('Select a place', 'Choose a venue from the list.');
  const placeEvents = DATA.events.filter((event) => event.storeId === place.id);
  const sources = (place.sourceIds || []).map(source).filter(Boolean);
  const favorite = !!state.personal.favorites[`place:${place.id}`];
  const hidden = !!state.personal.hidden[`place:${place.id}`];
  const rating = state.personal.ratings[`place:${place.id}`] || 0;
  container.innerHTML = `<div class="detail-hero"><div class="detail-identity"><span class="large-avatar">${initials(place.name)}</span><div><div class="identity-flags"><span class="status-chip ${place.researchStatus === 'partial' ? 'mint' : 'amber'}">${place.researchStatus === 'partial' ? 'Reviewed / partial' : 'Discovery-level'}</span>${hidden ? '<span class="status-chip coral">Deprioritized by you</span>' : ''}${place.wpnPremium ? '<span class="status-chip violet">WPN Premium</span>' : ''}</div><h2>${escapeHtml(place.name)}</h2><p>${escapeHtml(place.city)} · ${distanceLabel(place, true)} from Los Alamitos</p></div></div><div class="detail-preference-actions"><button class="heart-button large ${favorite ? 'active' : ''}" data-favorite="place:${place.id}" aria-label="Favorite place" title="Favorite">${favorite ? '♥' : '♡'}</button><button class="thumb-button large ${hidden ? 'active' : ''}" data-action="toggle-place-hidden" data-place-id="${place.id}" aria-label="${hidden ? 'Restore priority' : 'Deprioritize place'}" title="${hidden ? 'Restore priority' : 'Deprioritize'}">👎︎</button></div></div>
    <div class="detail-actions"><a class="primary-button" href="${mapsUrl(place)}" target="_blank" rel="noreferrer">Directions ↗</a>${place.website ? `<a class="soft-button" href="${escapeHtml(place.website)}" target="_blank" rel="noreferrer">Website ↗</a>` : ''}${place.instagram ? `<a class="soft-button" href="${escapeHtml(place.instagram)}" target="_blank" rel="noreferrer">Instagram ↗</a>` : ''}</div>
    <div class="detail-tabs" role="tablist" aria-label="Place details"><button class="${state.selectedPlaceTab === 'overview' ? 'active' : ''}" data-place-tab="overview" role="tab" aria-selected="${state.selectedPlaceTab === 'overview'}">Overview</button><button class="${state.selectedPlaceTab === 'events' ? 'active' : ''}" data-place-tab="events" role="tab" aria-selected="${state.selectedPlaceTab === 'events'}">Events <span>${placeEvents.length}</span></button><button class="${state.selectedPlaceTab === 'evidence' ? 'active' : ''}" data-place-tab="evidence" role="tab" aria-selected="${state.selectedPlaceTab === 'evidence'}">Evidence <span>${sources.length}</span></button></div>
    <div class="place-tab-content">${placeTabContent(place, placeEvents, sources, rating)}</div>`;
}

function placeTabContent(place, placeEvents, sources, rating) {
  if (state.selectedPlaceTab === 'events') {
    const upcoming = buildOccurrences(startOfDay(new Date()), endOfDay(addDays(new Date(), 56)), false).filter((event) => event.storeId === place.id);
    return `<section class="detail-section tab-intro"><p class="eyebrow">Known schedule</p><h3>${placeEvents.length} normalized series · ${upcoming.length} projected occurrences</h3><p class="analysis-copy">Recurring listings are patterns, not promises. Open any occurrence to see whether it is dated or projected and what should be verified before leaving.</p></section><section class="detail-section"><div class="section-title-row"><div><p class="eyebrow">Event series</p><h3>Recurring and one-off records</h3></div></div><div class="series-list">${placeEvents.length ? placeEvents.map((event) => seriesRow(event)).join('') : '<p class="muted-copy">No normalized event series yet. This is not proof that the venue has no Magic events.</p>'}</div></section><section class="detail-section"><div class="section-title-row"><div><p class="eyebrow">Next eight weeks</p><h3>Upcoming occurrences</h3></div></div><div class="place-occurrences">${upcoming.length ? upcoming.slice(0, 24).map((event) => `<button class="occurrence-row" data-event-id="${event.id}" data-date="${dateKey(event.occurrenceDate)}"><time><strong>${event.occurrenceDate.getDate()}</strong>${event.occurrenceDate.toLocaleDateString(undefined,{month:'short'})}</time><span><strong>${escapeHtml(event.title)}</strong><small>${event.occurrenceDate.toLocaleDateString(undefined,{weekday:'long'})} · ${formatTime(event.recurrence?.startTime)}</small></span><span class="status-chip ${evidenceLabel(event).tone}">${evidenceLabel(event).label}</span></button>`).join('') : '<p class="muted-copy">No upcoming occurrence is generated in the current window.</p>'}</div></section>`;
  }
  if (state.selectedPlaceTab === 'evidence') {
    return `<section class="detail-section tab-intro"><p class="eyebrow">Evidence coverage</p><h3>${sources.length} connected sources</h3><p class="analysis-copy">Sources are retained separately from the analyst synthesis. A strong venue can have a weak social channel, and silence on one source is not proof that an event does not exist.</p></section><section class="detail-section"><div class="source-health-summary"><div><span>Research status</span><strong>${place.researchStatus === 'partial' ? 'Reviewed / partial' : 'Discovery-level'}</strong></div><div><span>Last venue check</span><strong>${escapeHtml(place.lastVerified || 'Unknown')}</strong></div><div><span>Source count</span><strong>${sources.length}</strong></div></div><div class="source-list evidence-list">${sources.length ? sources.map((item) => sourceRow(item, true)).join('') : '<p class="muted-copy">No normalized sources are linked yet.</p>'}</div></section><section class="detail-section"><p class="eyebrow">Interpretive boundary</p><h3>What remains uncertain</h3><p class="analysis-copy">Fields not stated by the connected sources remain unknown. In particular, proxy policy, pod formation, typical power level, and solo-arrival experience should not be inferred from silence.</p></section>`;
  }
  return `${placeEvaluationSummary(place)}<section class="detail-section"><div class="section-title-row"><div><p class="eyebrow">Analyst synthesis</p><h3>Why it’s on the radar</h3></div></div><p class="analysis-copy">${escapeHtml(place.assessmentNotes)}</p></section>
    <section class="detail-section"><div class="section-title-row"><div><p class="eyebrow">Fit dimensions</p><h3>Current working assessment</h3></div><button class="why-button" data-action="explain-scores">Why these scores?</button></div><div class="score-bars">${assessmentBars(place)}</div></section>
    <section class="detail-section"><div class="section-title-row"><div><p class="eyebrow">Known schedule</p><h3>Event series</h3></div><button class="text-button" data-place-tab="events">See all events</button></div><div class="series-list">${placeEvents.length ? placeEvents.slice(0, 4).map((event) => seriesRow(event)).join('') : '<p class="muted-copy">No normalized event series yet. This is not proof that the venue has no Magic events.</p>'}</div></section>
    <section class="detail-section two-column-section"><div><p class="eyebrow">Personal continuity</p><h3>Your rating & notes</h3><div class="rating-row" aria-label="Rate this place">${[1,2,3,4,5].map((value) => `<button class="star ${value <= rating ? 'active' : ''}" data-rating="${value}" data-entity="place:${place.id}" aria-label="${value} stars">★</button>`).join('')}</div>${noteComposer(`place:${place.id}`, 'What did it feel like in person?')}</div><div><p class="eyebrow">Source map</p><h3>${sources.length} connected sources</h3><div class="source-list">${sources.slice(0, 5).map((item) => sourceRow(item)).join('') || '<p class="muted-copy">Source mapping incomplete.</p>'}</div><button class="text-button evidence-jump" data-place-tab="evidence">Review all evidence →</button></div></section>`;
}

function assessmentBars(place) {
  const labels = { commanderActivity: 'Commander activity', meetupAccessibility: 'Solo-arrival access', communityContinuity: 'Community continuity', newPlayerIntegration: 'New-player integration', physicalEnvironment: 'Physical environment', scheduleReliability: 'Schedule reliability', homeGroupPotential: 'Home-pod potential' };
  return Object.entries(place.assessment || {}).map(([key, value]) => `<div class="score-row"><span>${labels[key] || key}</span><div class="score-track"><i style="width:${value * 20}%"></i></div><strong>${value}/5</strong></div>`).join('');
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
  return Object.entries(place.assessment || {}).map(([key, value]) => `
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
  const communities = state.favoritesOnly ? COMMUNITY_SEED.filter((community) => state.personal.favorites[`community:${community.id}`]) : COMMUNITY_SEED;
  const partial = COMMUNITY_SEED.filter((community) => community.status === 'partial').length;
  const discovery = COMMUNITY_SEED.length - partial;
  const followed = COMMUNITY_SEED.filter((community) => state.personal.favorites[`community:${community.id}`]).length;
  document.getElementById('communityGrid').innerHTML = `<div class="community-overview">
    <div><span>Coverage</span><strong>${partial} partial · ${discovery} discovery</strong><p>Communities are leads and synthesis, not venue records.</p></div>
    <div><span>Your follows</span><strong>${followed} followed</strong><p>Favorites keep promising groups visible when Favorites-only is on.</p></div>
    <div><span>Next useful pass</span><strong>Normalize cadence</strong><p>Current unknowns focus on meetup rhythm, hosts, and newcomer path.</p></div>
  </div>${communities.map((community) => {
    const favorite = state.personal.favorites[`community:${community.id}`];
    return `<article class="community-card" data-community-id="${community.id}" tabindex="0"><div class="community-card-top"><span class="community-symbol">◎</span><button class="heart-button ${favorite ? 'active' : ''}" data-favorite="community:${community.id}">${favorite ? '♥' : '♡'}</button></div><span class="status-chip ${community.status === 'partial' ? 'sky' : 'amber'}">${community.status === 'partial' ? 'Partial profile' : 'Discovery lead'}</span><h2>${escapeHtml(community.name)}</h2><p class="community-region">${escapeHtml(community.region)}</p><p>${escapeHtml(community.summary)}</p><div class="community-tags">${community.formats.map((format) => `<span class="meta-chip">${format}</span>`).join('')}<span class="meta-chip">${community.channel}</span></div><div class="community-signal"><span>Signal</span><strong>${escapeHtml(community.signal)}</strong></div><div class="community-next"><span>Next check</span><p>${escapeHtml(community.nextQuestion)}</p></div><span class="open-cue">Open community profile →</span></article>`;
  }).join('') || emptyState('No communities match', 'Try turning off Favorites or adding a community to your followed list first.')}`;
}

function renderChanges() {
  const allItems = [...DATA.changes].sort((a, b) => compareText(b.detectedAt, a.detectedAt));
  const items = allItems.filter((change) => changeMatchesFilter(change, state.changeFilter));
  const latestAccepted = latestAcceptedChangeTimestamp();
  const latest = latestAccepted ? formatFreshnessDate(latestAccepted) : allItems[0]?.detectedAt ? formatFreshnessDate(allItems[0].detectedAt) : 'None yet';
  document.getElementById('changeList').innerHTML = `<div class="change-summary">
    <div><span>Visible updates</span><strong>${items.length}<small> / ${allItems.length}</small></strong><p>Use filters to separate planning-relevant changes from background research.</p></div>
    <div><span>Latest accepted record</span><strong>${escapeHtml(latest)}</strong><p>Pending proposal rows remain labeled until accepted in the research workflow.</p></div>
    <div><span>Current filter</span><strong>${changeFilterLabel(state.changeFilter)}</strong><p>${changeFilterHelp(state.changeFilter)}</p></div>
  </div>${items.length ? items.map((change) => changeRow(change)).join('') : emptyState('No updates in this filter', 'Try All updates or a different triage category.')}`;
}

function changeRow(change) {
  const tone = changeTone(change);
  const route = changeRoute(change);
  const title = changeTitle(change);
  const status = reviewStatusDisplay(change);
  return `<article class="change-row"><div class="timeline-node ${tone}"></div><time><strong>${new Date(change.detectedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</strong><small>${new Date(change.detectedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</small></time><div class="change-body"><div class="change-title-row"><h3>${title}</h3><span class="change-type-chip">${escapeHtml(change.changeType?.replaceAll('_', ' ') || 'research update')}</span></div><p>${escapeHtml(change.details || 'The research record was updated.')}</p><div class="change-clicklets"><button class="change-action" data-route="${route}">${route === 'events' ? 'Events' : route === 'research' ? 'Coverage' : 'Places'} →</button></div></div><span class="review-state ${status.tone}">${status.label}</span></article>`;
}

function reviewStatusDisplay(change) {
  const value = (change.reviewStatus || '').toLowerCase();
  if (value === 'accepted') return { label: 'Accepted', tone: 'accepted' };
  if (value === 'proposed') return { label: 'Pending proposal', tone: 'pending' };
  if (value === 'rejected' || value === 'declined') return { label: 'Not accepted', tone: 'rejected' };
  return { label: value ? value.replaceAll('_', ' ') : 'Recorded', tone: 'recorded' };
}

function changeTitle(change) {
  const summary = escapeHtml(change.summary || 'Research record updated');
  if (change.entityType === 'venue' && store(change.entityId)) {
    return `<button class="change-title-link" data-place-id="${escapeHtml(change.entityId)}">${summary}</button>`;
  }
  if ((change.entityType === 'event' || change.entityType === 'event_series') && eventById(change.entityId)) {
    return `<button class="change-title-link" data-event-id="${escapeHtml(change.entityId)}">${summary}</button>`;
  }
  if (change.entityType === 'community' && DATA.communities.some((community) => community.id === change.entityId)) {
    return `<button class="change-title-link" data-community-id="${escapeHtml(change.entityId)}">${summary}</button>`;
  }
  return summary;
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
  const partial = DATA.stores.filter((place) => place.researchStatus === 'partial').length;
  const discovery = DATA.stores.length - partial;
  const formats = DATA.events.reduce((acc, event) => ((acc[event.format || 'Unknown'] = (acc[event.format || 'Unknown'] || 0) + 1), acc), {});
  const sourceTypes = DATA.sources.reduce((acc, item) => ((acc[item.type || 'other'] = (acc[item.type || 'other'] || 0) + 1), acc), {});
  document.getElementById('researchDashboard').innerHTML = `<div class="research-stats"><button class="research-stat primary clickable" data-action="show-reviewed-places"><span>Venue depth</span><strong>${partial}<small> / ${DATA.stores.length}</small></strong><p>have moved beyond raw discovery</p><div class="progress"><i style="width:${partial / DATA.stores.length * 100}%"></i></div></button><button class="research-stat clickable" data-action="show-discovery-queue"><span>Discovery queue</span><strong>${discovery}</strong><p>places remain lightly vetted</p></button><button class="research-stat clickable" data-action="show-source-records"><span>Source records</span><strong>${DATA.sources.length}</strong><p>connected evidence surfaces</p></button><button class="research-stat warning clickable" data-action="show-format-balance"><span>Event-format balance</span><strong>${formats.Commander || 0}<small> Commander</small></strong><p>${DATA.events.length - (formats.Commander || 0)} other-format record</p></button></div>
    <div class="research-grid"><section class="research-panel"><p class="eyebrow">Coverage truth</p><h2>What this snapshot can and cannot say</h2><div class="truth-list"><div><span class="truth-icon mint">✓</span><p><strong>Useful nearby Commander starting set</strong><br>Recurring listings and strong partial venue profiles can support real planning now.</p></div><div><span class="truth-icon amber">~</span><p><strong>Uneven venue depth</strong><br>${partial} places have qualitative work; ${discovery} remain discovery-level and need social/site corroboration.</p></div><div><span class="truth-icon coral">!</span><p><strong>Not a complete Magic calendar</strong><br>Draft, sealed, prerelease, and other formats have not received comparable normalization yet.</p></div><div><span class="truth-icon sky">i</span><p><strong>Recurring dates are expectations</strong><br>Weekly schedules are displayed as projected occurrences unless a date-specific source confirms them.</p></div></div></section>
    <section class="research-panel"><p class="eyebrow">Source mix</p><h2>Where the evidence comes from</h2><div class="source-bars">${Object.entries(sourceTypes).sort((a,b) => b[1]-a[1]).slice(0,8).map(([type,count]) => `<div><span>${escapeHtml(type.replaceAll(/([A-Z])/g, ' $1'))}</span><div><i style="width:${count / Math.max(...Object.values(sourceTypes)) * 100}%"></i></div><strong>${count}</strong></div>`).join('')}</div></section></div>
    <div class="research-panel methodology-card"><div><p class="eyebrow">Method in one line</p><h2>Catalog broadly. Classify carefully. Rank personally. Preserve the evidence.</h2></div><button class="soft-button" data-action="show-log">View activity log</button></div>`;
}

function openEvent(id, occurrenceDate) {
  const event = eventById(id);
  const place = store(event?.storeId);
  if (!event || !place) return;
  const occurrence = occurrenceDate ? parseDate(occurrenceDate) : parseDate(event.date || event.startDate);
  const src = source(event.sourceId);
  const fit = fitLabel({ ...event, occurrenceDate: occurrence });
  const evidence = evidenceLabel({ ...event, occurrenceDate: occurrence, occurrenceStatus: !event.recurrence && (event.date || event.startDate) ? 'confirmed' : 'projected' });
  const favorite = state.personal.favorites[`event:${event.id}`];
  const interested = state.personal.interested[`${event.id}:${dateKey(occurrence)}`];
  const calendarUrl = googleCalendarUrl(event, place, occurrence);
  openDrawer(`<div class="drawer-kicker"><span class="format-mark ${formatClass(event)}">${formatShort(event)}</span><span class="status-chip ${fit.tone}">${fit.label}</span><span class="status-chip ${evidence.tone}">${evidence.label}</span></div><h1 id="drawerTitle">${escapeHtml(event.title)}</h1><button class="drawer-place-link" data-place-id="${place.id}" data-place-mode="drawer">${escapeHtml(place.name)} · ${distanceLabel(place)} →</button>
    <div class="event-hero-meta"><div><span>Date</span><strong>${occurrence.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</strong></div><div><span>Time</span><strong>${formatTime(eventStartTime(event))}</strong></div><div><span>Entry</span><strong>${event.entryFee == null ? 'Unknown' : Number(event.entryFee) === 0 ? 'Free' : `$${event.entryFee}`}</strong></div><div><span>Power</span><strong>${event.bracket && event.bracket !== 'unspecified' ? `Bracket ${event.bracket}` : 'Not stated'}</strong></div></div>
    <div class="drawer-action-grid"><a class="primary-button" href="${calendarUrl}" target="_blank" rel="noreferrer">Add to Google Calendar ↗</a><a class="soft-button" href="${mapsUrl(place)}" target="_blank" rel="noreferrer">Directions ↗</a><button class="soft-button ${interested ? 'active' : ''}" data-interested="${event.id}:${dateKey(occurrence)}">${interested ? '✓ Interested' : '+ Interested'}</button><button class="heart-button labeled ${favorite ? 'active' : ''}" data-favorite="event:${event.id}">${favorite ? '♥ Following series' : '♡ Follow series'}</button></div>
    <section class="drawer-section"><p class="eyebrow">Source description</p><h2>What’s happening</h2><p>${escapeHtml(event.details || 'The current source provides only a minimal event listing.')}</p></section>
    <section class="drawer-section"><p class="eyebrow">Analyst read</p><h2>How to interpret it</h2><div class="interpretation-grid"><div><span class="interpret-icon ${fit.tone}">●</span><p><strong>${fit.label}</strong><br>${eventFitExplanation(event, place)}</p></div><div><span class="interpret-icon ${evidence.tone}">●</span><p><strong>${evidence.label}</strong><br>${evidenceExplanation(event, place)}</p></div>${isCompetitive(event) ? '<div><span class="interpret-icon coral">!</span><p><strong>Competitive signal</strong><br>This belongs in the complete catalog but is deprioritized from your casual default view.</p></div>' : ''}</div></section>
    <section class="drawer-section"><p class="eyebrow">Before you go</p><h2>Practical check</h2><div class="before-grid"><div><span>Address</span><strong>${escapeHtml(place.address)}</strong></div><div><span>Last verified</span><strong>${escapeHtml(event.lastVerified)}</strong></div><div><span>Pod formation</span><strong>${/pair|random pod/i.test(event.details) ? 'Structured signal found' : 'Not stated'}</strong></div><div><span>Proxy policy</span><strong>${/no prox/i.test(event.details) ? 'No proxies stated' : /prox/i.test(event.details) ? 'Policy mentioned' : 'Not stated'}</strong></div></div></section>
    <section class="drawer-section"><p class="eyebrow">Evidence</p><h2>Source trail</h2>${src ? sourceRow(src, true) : '<p class="muted-copy">No normalized source link is attached yet.</p>'}</section>
    <section class="drawer-section"><p class="eyebrow">Your memory</p><h2>Note on this series</h2>${noteComposer(`event:${event.id}`, 'What should future-you remember about this event?')}</section>`);
}

function openDay(dayDate) {
  if (!dayDate) return;
  const date = parseDate(dayDate);
  const events = buildOccurrences(startOfDay(date), endOfDay(date));
  openDrawer(`<div class="drawer-kicker"><span class="status-chip violet">Calendar day</span><span class="status-chip slate">${events.length} events</span></div><h1 id="drawerTitle">${date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h1><p class="drawer-lead">Every matching event currently visible for this date.</p><section class="drawer-section day-drawer-list">${events.length ? events.map((event) => eventCard(event)).join('') : '<p class="muted-copy">No events match the active filters for this day.</p>'}</section>`);
}

function eventFitExplanation(event, place) {
  if (isCompetitive(event)) return 'The wording suggests cEDH, optimized, or tournament-style play outside your usual Bracket 2/3 preference.';
  if (/open play|drop.?in|casual/i.test(`${event.title} ${event.details}`)) return 'The casual/open wording aligns with your preferred play style; solo-arrival mechanics may still be unknown.';
  if (isSpecial(event)) return 'This is the kind of infrequent limited or special event you asked to have highlighted.';
  return `The listing is relevant, but its power expectations and social structure need interpretation. ${distanceLabel(place, true)} keeps distance in the practical calculation.`;
}

function evidenceExplanation(event, place) {
  if (!event.recurrence && (event.date || event.startDate)) return 'A source names this specific date rather than only a recurring weekly pattern.';
  if (place.researchStatus === 'partial' && event.confidence === 'high') return 'The routine is supported by a stronger store pass, but this displayed date is still projected from recurrence.';
  return 'This occurrence is generated from a recurring listing. Verify the source before a longer drive.';
}

function openPlaceDrawer(id) {
  const place = store(id);
  if (!place) return;
  const events = DATA.events.filter((event) => event.storeId === id);
  openDrawer(`<div class="drawer-kicker"><span class="status-chip ${place.researchStatus === 'partial' ? 'mint' : 'amber'}">${place.researchStatus === 'partial' ? 'Reviewed / partial' : 'Discovery-level'}</span></div><h1 id="drawerTitle">${escapeHtml(place.name)}</h1><p class="drawer-lead">${escapeHtml(place.city)} · ${distanceLabel(place, true)} from Los Alamitos</p><div class="drawer-action-grid"><button class="primary-button" data-place-id="${place.id}">Open full profile</button><a class="soft-button" href="${mapsUrl(place)}" target="_blank" rel="noreferrer">Directions ↗</a></div><section class="drawer-section"><p class="eyebrow">Analyst synthesis</p><h2>Why it’s on the radar</h2><p>${escapeHtml(place.assessmentNotes)}</p></section><section class="drawer-section"><p class="eyebrow">Known schedule</p><h2>${events.length} event series</h2><div class="series-list">${events.map(seriesRow).join('') || '<p>No normalized series yet.</p>'}</div></section>`);
}

function openCommunity(id) {
  const community = COMMUNITY_SEED.find((item) => item.id === id);
  if (!community) return;
  const favorite = state.personal.favorites[`community:${id}`];
  openDrawer(`<div class="drawer-kicker"><span class="community-symbol small">◎</span><span class="status-chip ${community.status === 'partial' ? 'sky' : 'amber'}">${community.status === 'partial' ? 'Partial profile' : 'Discovery lead'}</span><span class="status-chip slate">Community record</span></div><h1 id="drawerTitle">${escapeHtml(community.name)}</h1><p class="drawer-lead">${escapeHtml(community.region)}</p><div class="drawer-action-grid"><button class="heart-button labeled ${favorite ? 'active' : ''}" data-favorite="community:${id}">${favorite ? '♥ Following community' : '♡ Follow community'}</button></div><section class="drawer-section"><p class="eyebrow">Current synthesis</p><h2>Why this group matters</h2><p>${escapeHtml(community.summary)}</p></section><section class="drawer-section"><p class="eyebrow">How to use this</p><h2>${escapeHtml(community.signal)}</h2><p>Community records help find people, organizers, and recurring social patterns. They stay separate from store records so a Discord or meetup group does not accidentally become a fake venue.</p></section><section class="drawer-section"><p class="eyebrow">Open research question</p><h2>What we still need</h2><p>${escapeHtml(community.nextQuestion)}</p></section>${noteComposer(`community:${id}`, 'Add a personal note about this community...')}`);
}

function openActivityLog() {
  const activity = state.personal.activity || [];
  openDrawer(`<div class="drawer-kicker"><span class="status-chip slate">Private on this device</span></div><h1 id="drawerTitle">Activity log</h1><p class="drawer-lead">A quiet record of favorites, ratings, notes, and planning actions.</p><section class="drawer-section"><div class="activity-list">${activity.length ? activity.map((item) => `<div class="activity-row"><span>${activityIcon(item.type)}</span><div><strong>${escapeHtml(item.label || item.type)}</strong><small>${new Date(item.at).toLocaleString()}</small></div></div>`).join('') : '<p class="muted-copy">No personal actions yet. Favorite a place or add a note and it will appear here.</p>'}</div></section><section class="drawer-section"><p class="field-help">For this initial build, personal state is stored in this browser. The interface is designed for the private cross-device persistence layer planned for hosting.</p></section>`);
}

function openQuickNote() {
  openDrawer(`<div class="drawer-kicker"><span class="status-chip violet">Personal</span></div><h1 id="drawerTitle">Quick note</h1><p class="drawer-lead">Capture something before it disappears from memory.</p><section class="drawer-section">${noteComposer('general:inbox', 'A store to revisit, a player-group clue, a future question...')}</section>`);
}

function activityIcon(type) { return type === 'favorite' ? '♥' : type === 'rating' ? '★' : type === 'note' ? '✎' : '✓'; }

function noteComposer(entity, placeholder) {
  const note = state.personal.notes[entity] || '';
  const id = `note-${entity.replace(/[^a-z0-9]/gi, '-')}`;
  return `<div class="note-composer"><textarea id="${id}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(note)}</textarea><div><span>${note ? 'Saved note · edit anytime' : 'Private working note'}</span><button class="soft-button" data-action="save-note" data-entity="${escapeHtml(entity)}" data-input="${id}">Save note</button></div></div>`;
}

function saveNote(entity, inputId) {
  const value = document.getElementById(inputId)?.value.trim() || '';
  state.personal.notes[entity] = value;
  savePersonal({ type: 'note', label: value ? `Updated note for ${entity.split(':')[1]}` : `Cleared note for ${entity.split(':')[1]}` });
  toast('Note saved');
}

function setRating(entity, rating) {
  state.personal.ratings[entity] = rating;
  savePersonal({ type: 'rating', label: `Rated ${entity.split(':')[1]} ${rating} stars` });
  renderPlaces();
  toast(`Rating saved: ${rating} stars`);
}

function toggleFavorite(key) {
  state.personal.favorites[key] = !state.personal.favorites[key];
  savePersonal({ type: 'favorite', label: `${state.personal.favorites[key] ? 'Followed' : 'Unfollowed'} ${key.split(':')[1]}` });
  renderCurrentRoute();
  toast(state.personal.favorites[key] ? 'Added to favorites' : 'Removed from favorites');
}

function toggleHidden(key) {
  state.personal.hidden[key] = !state.personal.hidden[key];
  savePersonal({ type: 'preference', label: `${state.personal.hidden[key] ? 'Deprioritized' : 'Restored'} ${key.split(':')[1]}` });
  renderCurrentRoute();
  toast(state.personal.hidden[key] ? 'Deprioritized in your view' : 'Restored to normal priority');
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
  const places = DATA.stores.filter((place) => place.researchStatus !== 'partial').sort((a, b) => (numericDistance(a) ?? 999) - (numericDistance(b) ?? 999));
  openDrawer(`<div class="drawer-kicker"><span class="status-chip amber">Discovery queue</span></div><h1 id="drawerTitle">Lightly vetted places</h1><p class="drawer-lead">These places are still in the queue for stronger corroboration before they should be treated as serious bets.</p><section class="drawer-section"><div class="place-occurrences">${places.map((place) => `<button class="occurrence-row" data-place-id="${place.id}"><time><strong>${numericDistance(place) == null ? '?' : numericDistance(place).toFixed(0)}</strong>mi</time><span><strong>${escapeHtml(place.name)}</strong><small>${escapeHtml(place.city)} · ${truncate(place.assessmentNotes || 'Needs synthesis', 110)}</small></span><span class="status-chip amber">Discovery-level</span></button>`).join('')}</div></section>`);
}

function openReviewedPlaces() {
  const places = DATA.stores.filter((place) => place.researchStatus === 'partial').sort((a, b) => storeScore(b) - storeScore(a));
  openDrawer(`<div class="drawer-kicker"><span class="status-chip mint">Reviewed places</span></div><h1 id="drawerTitle">Places with deeper work</h1><p class="drawer-lead">These places have moved beyond raw discovery and now support a real planning judgment.</p><section class="drawer-section"><div class="place-occurrences">${places.map((place) => { const evaluation = normalizedEvaluation(place); return `<button class="occurrence-row" data-place-id="${place.id}"><time><strong>${escapeHtml(evaluation.fitGrade)}</strong>${Number(evaluation.fitScore).toFixed(1)}</time><span><strong>${escapeHtml(place.name)}</strong><small>${escapeHtml(place.city)} · ${distanceLabel(place)}</small></span><span class="status-chip ${evaluation.candidateStatus === 'promoted' ? 'mint' : 'amber'}">${evaluation.candidateStatus === 'promoted' ? 'Promoted' : 'Working'}</span></button>`; }).join('')}</div></section>`);
}

function openFreshSignals() {
  const events = notableEvents();
  openDrawer(`<div class="drawer-kicker"><span class="status-chip amber">Fresh signals</span></div><h1 id="drawerTitle">New & notable</h1><p class="drawer-lead">A quieter shortlist of the most actionable or attention-worthy finds in the next four weeks.</p><section class="drawer-section"><div class="day-drawer-list">${events.length ? events.map((event) => eventCard(event)).join('') : '<p class="muted-copy">No notable upcoming items are visible in the current window.</p>'}</div></section><section class="drawer-section"><p class="eyebrow">Why these surfaced</p><div class="truth-list"><div><span class="truth-icon mint">★</span><p><strong>Special-event bias</strong><br>Prereleases, limited events, and unusual one-offs rise first because they are easy to miss and often matter most.</p></div><div><span class="truth-icon sky">i</span><p><strong>Freshness matters</strong><br>More recently verified items outrank older routine listings when the practical value is otherwise similar.</p></div></div></section>`);
}

function openHighlightsHub() {
  const events = notableEvents(6);
  const places = rankedStores().filter((place) => place.researchStatus === 'partial').slice(0, 6);
  const alerts = DATA.stores.filter((place) => place.researchStatus !== 'partial').slice(0, 5);
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
  document.getElementById('detailDrawer').classList.remove('open');
  document.getElementById('detailDrawer').setAttribute('aria-hidden', 'true');
  document.getElementById('drawerScrim').classList.add('hidden');
  document.body.classList.remove('drawer-open');
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
  state.filters.distance = Number(document.getElementById('distanceFilter').value);
  state.filters.hideCompetitive = document.getElementById('hideCompetitive').checked;
  state.filters.onlyFree = document.getElementById('onlyFree').checked;
  closeFilters();
  renderCurrentRoute();
}

function resetFilters() {
  state.filters = { research: ['partial', 'wizards-discovery'], confidence: ['high', 'medium', 'low'], distance: 30, hideCompetitive: true, onlyFree: false };
  document.querySelectorAll('input[name="research"], input[name="confidence"]').forEach((input) => input.checked = true);
  document.getElementById('distanceFilter').value = 30;
  document.getElementById('distanceValue').textContent = '30 miles';
  document.getElementById('hideCompetitive').checked = true;
  document.getElementById('onlyFree').checked = false;
}

function activeFilterCount() {
  let count = 0;
  if (state.filters.research.length < 2) count++;
  if (state.filters.confidence.length < 3) count++;
  if (state.filters.distance !== 30) count++;
  if (!state.filters.hideCompetitive) count++;
  if (state.filters.onlyFree) count++;
  return count;
}

function googleCalendarUrl(event, place, date) {
  const [hour = 18, minute = 0] = (eventStartTime(event) || '18:00').split(':').map(Number);
  const start = new Date(date); start.setHours(hour, minute, 0, 0);
  const end = new Date(start); end.setHours(end.getHours() + 3);
  const stamp = (value) => value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const params = new URLSearchParams({ action: 'TEMPLATE', text: event.title, dates: `${stamp(start)}/${stamp(end)}`, details: event.details || '', location: place.address });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function sourceRow(item, prominent = false) {
  return `<a class="source-row ${prominent ? 'prominent' : ''}" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer"><span class="source-icon">${sourceIcon(item.type)}</span><span><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.type || 'source')} · checked ${escapeHtml(item.lastChecked || 'date unknown')}</small></span><span>↗</span></a>`;
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
