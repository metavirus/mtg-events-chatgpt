import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import {
  assertDiscordReadOnlyState,
  classifyDiscordBlockedRequest,
  extractDiscordVisibleMessages,
  installDiscordReadOnlyGuards,
  isDiscordMutationRequest,
  readDiscordShellSafetyState
} from './discord_readonly_guard.mjs';

const require = createRequire(import.meta.url);
const nodeModules = process.env.CODEX_NODE_MODULES;
if (!nodeModules) throw new Error('CODEX_NODE_MODULES is required');
const { chromium } = require(path.join(nodeModules, 'playwright'));

const targetUrl = process.argv[2];
const mode = process.argv[3] || 'shell';
const serverName = process.argv[4] || '';
const folderName = process.argv[5] || '';
const channelName = process.argv[6] || '';
const targetRoute = targetUrl?.match(/^https:\/\/discord(app)?\.com\/channels\/(\d+)\/(\d+)$/i);
if (!targetRoute) throw new Error('Pass one exact mapped Discord channel URL');
if (!['shell', 'content'].includes(mode)) throw new Error('Mode must be shell or content');

const expectedRoute = { guildId: targetRoute[2], channelId: targetRoute[3] };
const homeUrl = 'https://discord.com/channels/@me';
const workspaceRoot = path.resolve('work/discord-readonly');
const profileDir = path.join(workspaceRoot, 'profile');
const logDir = path.join(workspaceRoot, 'logs');
await fs.mkdir(logDir, { recursive: true });

// Unlike the cold-link guard, this selector does not disable every button.
// It disables message/content mutation surfaces while the runner exposes only
// three ID-proven navigation clicks: folder, guild, and channel.
const uiNativeMutationSelector = [
  '[data-message-composer]',
  '[class*="channelTextArea" i]',
  '[contenteditable="true"]',
  '[role="textbox"]',
  '[data-slate-editor="true"]',
  'textarea',
  'input',
  '[role="main"] button',
  'main button',
  '[id^="chat-messages-"] button',
  '[aria-label*="Messages" i] button',
  '[aria-label*="Send" i]',
  '[aria-label*="Reply" i]',
  '[aria-label*="React" i]',
  '[aria-label*="Reaction" i]',
  '[aria-label*="Upload" i]',
  '[aria-label*="Attach" i]',
  '[aria-label*="Join" i]',
  '[aria-label*="Invite" i]',
  '[aria-label*="Role" i]',
  '[aria-label*="Settings" i]'
].join(',');

const browserExecutable = process.env.DISCORD_PROOF_BROWSER ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const networkBlocks = [];
const prohibitedResponses = [];
const startedAt = new Date().toISOString();
let requestStage = 'context_initialization';

const result = {
  test: 'discord-readonly-ui-native-navigation',
  mode,
  startedAt,
  homeUrl,
  targetUrl,
  expectedRoute,
  serverName,
  folderName,
  channelName,
  dedicatedProfileUsed: true,
  accessModality: 'discord_home_then_structural_sidebar_navigation',
  coldDeepLinkUsed: false,
  typingOrPastingUsed: false,
  keyboardNavigationUsed: false,
  coordinateGuessingUsed: false,
  messageAreaInteractionUsed: false,
  messageContentInspected: false,
  externalDiscordStateChanged: false,
  folderExpansionRequired: false,
  stages: [],
  blockedRequests: [],
  blockedExpectedAcks: [],
  routeState: 'blocked_for_this_run',
  guildIndicatorBefore: null,
  guildIndicatorAfter: null,
  guildIndicatorUnchanged: null,
  prohibitedSuccessfulResponses: [],
  messageWindow: null,
  usefulFindingPresent: null,
  usefulCategories: [],
  findingCandidates: [],
  status: 'unknown',
  failureStage: null,
  failureReason: null
};

const context = await chromium.launchPersistentContext(profileDir, {
  headless: true,
  executablePath: browserExecutable,
  args: ['--no-proxy-server']
});

await installDiscordReadOnlyGuards(context, {
  guardVersion: 'discord-readonly-ui-native-v1',
  selector: uiNativeMutationSelector,
  networkBlocks,
  getRequestContext: () => requestStage
});

context.on('response', (response) => {
  const request = response.request();
  if (!isDiscordMutationRequest(response.url(), request.method())) return;
  prohibitedResponses.push({
    method: request.method().toUpperCase(),
    url: response.url(),
    status: response.status(),
    observedAt: new Date().toISOString()
  });
});

function isLurkerRequest(entry) {
  if (entry.method !== 'PUT') return false;
  try {
    const parsed = new URL(entry.url);
    return parsed.pathname === `/api/v9/guilds/${expectedRoute.guildId}/members/@me` &&
      parsed.searchParams.get('lurker') === 'true';
  } catch {
    return false;
  }
}

function isTelemetryOnly(entry) {
  try {
    return /\/api\/v\d+\/science(?:\/|$)/i.test(new URL(entry.url).pathname);
  } catch {
    return false;
  }
}

async function expectedAckIsRouteBound(page, entry) {
  const detail = classifyDiscordBlockedRequest(entry);
  if (detail.classification !== 'blocked_expected_ack') return false;
  if (!['server_selection', 'channel_selection', 'message_rendering'].includes(entry.requestContext)) return false;
  return page.evaluate(({ guildId, channelId }) => {
    const current = location.pathname.match(/^\/channels\/(\d+)\/(\d+)/);
    if (current?.[1] === guildId && current?.[2] === channelId) return true;
    return Boolean(document.querySelector(`a[href="/channels/${guildId}/${channelId}"]`));
  }, { guildId: expectedRoute.guildId, channelId: detail.channelId });
}

async function readGuildIndicator(page) {
  return page.evaluate((guildId) => {
    const target = document.querySelector(`[role="treeitem"][data-list-item-id="guildsnav___${guildId}"]`) ||
      document.querySelector(`a[href^="/channels/${guildId}"]`);
    if (!target) return { observable: false };
    const labels = [...target.querySelectorAll('[aria-label], [title], [role="status"]')]
      .map((element) => element.getAttribute('aria-label') || element.getAttribute('title') || element.textContent || '')
      .map((value) => value.replace(/\s+/g, ' ').trim())
      .filter((value) => /unread|mention|\b\d+\b/i.test(value))
      .slice(0, 10);
    return {
      observable: true,
      ariaLabel: target.getAttribute('aria-label') || null,
      title: target.getAttribute('title') || null,
      indicatorLabels: labels,
      unreadMarkerCount: target.querySelectorAll('[class*="unread" i], [class*="mention" i], [class*="badge" i]').length
    };
  }, expectedRoute.guildId);
}

async function visibleGateLabels(page) {
  return page.evaluate(() => {
    const isVisible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    return [...document.querySelectorAll('button, a, [role="button"]')]
      .filter(isVisible)
      .map((element) => element.getAttribute('aria-label') || element.getAttribute('title') || element.textContent || '')
      .map((value) => value.replace(/\s+/g, ' ').trim())
      .filter((value) => /^(join server|accept invite|verify|complete setup|select roles?|get started)$/i.test(value))
      .slice(0, 10);
  });
}

async function verifyStage(page, stageName, options = {}) {
  await page.waitForTimeout(options.waitMs ?? 1800);
  const safety = await readDiscordShellSafetyState(page, {
    selector: uiNativeMutationSelector,
    expectedRoute: options.expectExactRoute ? expectedRoute : null
  });
  assertDiscordReadOnlyState(safety, {
    guardVersion: 'discord-readonly-ui-native-v1',
    failOnGate: false
  });
  if (safety.hasLoginGate) throw new Error('isolated profile is not authenticated');
  const gateLabels = await visibleGateLabels(page);
  if (gateLabels.length) throw new Error(`visible join/verification gate: ${gateLabels.join(', ')}`);
  if (options.expectExactRoute && !safety.routeIdentity?.matches) {
    throw new Error('expected guild/channel route identity not reached');
  }
  if (options.expectExactRoute) {
    const normalizeLabel = (value) => value.toLowerCase()
      .replace(/discord/g, '')
      .replace(/^#/, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
    const title = normalizeLabel(safety.title || '');
    const expectedServer = normalizeLabel(serverName);
    const expectedChannel = normalizeLabel(channelName);
    if (!expectedServer || !title.includes(expectedServer)) {
      throw new Error(`expected server label not proven in shell title: ${serverName}`);
    }
    if (!expectedChannel || !title.includes(expectedChannel)) {
      throw new Error(`expected channel label not proven in shell title: ${channelName}`);
    }
  }
  const lurker = networkBlocks.find(isLurkerRequest);
  if (lurker) throw new Error('members/@me?lurker=true request blocked');
  for (const entry of networkBlocks.filter((candidate) => classifyDiscordBlockedRequest(candidate).classification === 'blocked_expected_ack')) {
    if (!await expectedAckIsRouteBound(page, entry)) {
      throw new Error('read-state acknowledgement could not be bound to the selected guild shell');
    }
  }
  const unexpectedBlocked = networkBlocks.find((entry) => {
    const classification = classifyDiscordBlockedRequest(entry).classification;
    return !['telemetry', 'blocked_expected_ack'].includes(classification) && !isLurkerRequest(entry);
  });
  if (unexpectedBlocked) throw new Error(`unexpected mutation request blocked: ${unexpectedBlocked.method} ${unexpectedBlocked.url}`);
  if (prohibitedResponses.length) throw new Error('a prohibited mutation request received a response');
  const stage = {
    name: stageName,
    url: safety.url,
    title: safety.title,
    heartbeat: safety.heartbeat,
    activeEditable: safety.activeEditable,
    enabledMutatorCount: safety.enabledMutatorCount,
    routeIdentity: safety.routeIdentity,
    gateLabels,
    blockedRequestCount: networkBlocks.length,
    blockedExpectedAckCount: networkBlocks.filter((entry) => classifyDiscordBlockedRequest(entry).classification === 'blocked_expected_ack').length,
    lurkerRequestObserved: false
  };
  result.stages.push(stage);
  return safety;
}

async function markAndInspectNavigation(page) {
  return page.evaluate(({ guildId, channelId, serverName }) => {
    const isVisible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const outsideMessages = (element) => !element.closest('main, [role="main"], [aria-label*="Messages" i], [data-message-composer], [role="textbox"]');
    const exactGuildPrefix = `/channels/${guildId}`;
    const exactChannelPath = `/channels/${guildId}/${channelId}`;
    const anchors = [...document.querySelectorAll('a[href]')].filter(outsideMessages);
    const guildAnchors = anchors.filter((anchor) => {
      const href = anchor.getAttribute('href') || '';
      return href === exactGuildPrefix || href.startsWith(`${exactGuildPrefix}/`);
    });
    const guildTreeitems = [...document.querySelectorAll(`[role="treeitem"][data-list-item-id="guildsnav___${guildId}"]`)]
      .filter(outsideMessages);
    const channelAnchors = anchors.filter((anchor) => anchor.getAttribute('href') === exactChannelPath);
    const folderControls = [...document.querySelectorAll('button, [role="button"], [role="treeitem"][aria-expanded]')].filter((element) => {
      if (!outsideMessages(element)) return false;
      const label = `${element.getAttribute('aria-label') || ''} ${element.getAttribute('title') || ''}`.trim();
      const hasFolderShape = element.hasAttribute('aria-expanded') || /folder/i.test(label) || Boolean(element.querySelector('[class*="folder" i]'));
      if (!hasFolderShape) return false;
      if (!serverName) return false;
      const normalized = serverName.toLowerCase().replace(/discord/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
      const tokens = normalized.split(' ').filter((token) => token.length >= 4);
      const descendantLabels = [...element.querySelectorAll('[aria-label], [title], img[alt]')]
        .map((child) => `${child.getAttribute('aria-label') || ''} ${child.getAttribute('title') || ''} ${child.getAttribute('alt') || ''}`)
        .join(' ');
      const haystack = `${label} ${element.textContent || ''} ${descendantLabels}`.toLowerCase();
      return tokens.length > 0 && tokens.some((token) => haystack.includes(token));
    });
    const guildNavigationRoot = document.querySelector('[aria-label*="Servers" i], [data-list-id*="guilds" i]');
    const structuralCandidates = guildNavigationRoot
      ? [...guildNavigationRoot.querySelectorAll('a[href], button, [role="button"], [role="treeitem"]')]
        .filter(outsideMessages)
        .slice(0, 40)
        .map((element) => ({
          tag: element.tagName,
          role: element.getAttribute('role'),
          href: element.getAttribute('href'),
          ariaLabel: element.getAttribute('aria-label'),
          title: element.getAttribute('title'),
          dataListItemId: element.getAttribute('data-list-item-id'),
          ariaExpanded: element.getAttribute('aria-expanded'),
          visible: isVisible(element),
          descendantLabels: [...element.querySelectorAll('[aria-label], [title], img[alt]')]
            .map((child) => `${child.getAttribute('aria-label') || ''} ${child.getAttribute('title') || ''} ${child.getAttribute('alt') || ''}`.replace(/\s+/g, ' ').trim())
            .filter(Boolean)
            .slice(0, 12)
        }))
      : [];

    document.querySelectorAll('[data-discord-readonly-nav-target]').forEach((element) => element.removeAttribute('data-discord-readonly-nav-target'));
    const visibleGuildAnchors = [...new Set([...guildAnchors, ...guildTreeitems])].filter(isVisible);
    const visibleChannelAnchors = channelAnchors.filter(isVisible);
    if (visibleGuildAnchors.length === 1) visibleGuildAnchors[0].setAttribute('data-discord-readonly-nav-target', 'guild');
    if (visibleChannelAnchors.length === 1) visibleChannelAnchors[0].setAttribute('data-discord-readonly-nav-target', 'channel');

    let folderControl = null;
    if (visibleGuildAnchors.length === 0 && guildAnchors.length === 1) {
      let cursor = guildAnchors[0].parentElement;
      while (cursor && !folderControl) {
        const candidate = cursor.matches('button, [role="button"]') ? cursor : cursor.querySelector(':scope > button, :scope > [role="button"]');
        if (candidate && outsideMessages(candidate)) folderControl = candidate;
        cursor = cursor.parentElement;
      }
    }
    if (!folderControl && folderControls.length === 1) folderControl = folderControls[0];
    if (folderControl) folderControl.setAttribute('data-discord-readonly-nav-target', 'folder');

    return {
      guildAnchorCount: guildAnchors.length,
      visibleGuildAnchorCount: visibleGuildAnchors.length,
      channelAnchorCount: channelAnchors.length,
      visibleChannelAnchorCount: visibleChannelAnchors.length,
      relevantFolderControlCount: folderControls.length,
      folderControlProven: Boolean(folderControl),
      folderControlLabel: folderControl ? (folderControl.getAttribute('aria-label') || folderControl.getAttribute('title') || '').trim() : null,
      guildNavigationRootFound: Boolean(guildNavigationRoot),
      structuralCandidates
    };
  }, { ...expectedRoute, serverName });
}

async function controlledNavigationClick(page, target, expectedHref = null) {
  const selector = `[data-discord-readonly-nav-target="${target}"]`;
  const locator = page.locator(selector);
  if (await locator.count() !== 1) throw new Error(`${target} navigation target is not uniquely proven`);
  const proof = await locator.evaluate((element) => ({
    tag: element.tagName,
    href: element.getAttribute('href'),
    dataListItemId: element.getAttribute('data-list-item-id'),
    ariaLabel: element.getAttribute('aria-label'),
    title: element.getAttribute('title'),
    insideMessageArea: Boolean(element.closest('main, [role="main"], [aria-label*="Messages" i], [data-message-composer], [role="textbox"]')),
    disabled: 'disabled' in element ? element.disabled : element.getAttribute('aria-disabled') === 'true'
  }));
  if (proof.insideMessageArea) throw new Error(`${target} target is inside message/composer area`);
  if (proof.disabled) throw new Error(`${target} navigation target is disabled`);
  const expectedGuildTreeitem = target === 'guild' &&
    proof.dataListItemId === `guildsnav___${expectedRoute.guildId}`;
  if (expectedHref && !expectedGuildTreeitem && proof.href !== expectedHref && !proof.href?.startsWith(`${expectedHref}/`)) {
    throw new Error(`${target} href does not match mapped identity`);
  }
  await locator.click();
  return proof;
}

async function probeFolderTooltips(page) {
  const folders = page.locator('[aria-label*="Servers" i] [role="treeitem"][aria-expanded], [data-list-id*="guilds" i] [role="treeitem"][aria-expanded]');
  const count = await folders.count();
  if (count < 1 || count > 12) throw new Error(`unexpected folder-control count: ${count}`);
  const expectedTooltip = folderName.trim().toLowerCase();
  const normalized = serverName.toLowerCase().replace(/discord/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const tokens = normalized.split(' ').filter((token) => token.length >= 4);
  const probes = [];
  const matches = [];
  for (let index = 0; index < count; index += 1) {
    const folder = folders.nth(index);
    const structural = await folder.evaluate((element) => ({
      id: element.getAttribute('data-list-item-id'),
      insideMessageArea: Boolean(element.closest('main, [role="main"], [aria-label*="Messages" i], [data-message-composer], [role="textbox"]')),
      expanded: element.getAttribute('aria-expanded')
    }));
    if (!structural.id || structural.insideMessageArea) throw new Error('folder hover target is not a stable server-navigation treeitem');
    await folder.hover();
    await page.waitForTimeout(500);
    const tooltips = await page.locator('[role="tooltip"]').evaluateAll((elements) => elements
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      })
      .map((element) => (element.textContent || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean));
    const tooltip = tooltips.at(-1) || null;
    const matched = Boolean(tooltip && (
      (expectedTooltip && tooltip.toLowerCase() === expectedTooltip) ||
      (!expectedTooltip && tokens.some((token) => tooltip.toLowerCase().includes(token)))
    ));
    probes.push({ ...structural, tooltip, matched });
    if (matched) matches.push({ index, id: structural.id, tooltip });
    await verifyStage(page, `folder_hover_${index + 1}`, { waitMs: 50 });
  }
  if (matches.length === 1) {
    await folders.nth(matches[0].index).evaluate((element) => element.setAttribute('data-discord-readonly-nav-target', 'folder'));
  }
  return { count, probes, matches, uniqueMatch: matches.length === 1 };
}

async function classifyTinyWindow(page) {
  const messages = await extractDiscordVisibleMessages(page, {
    limit: 5,
    maxCharactersPerMessage: 1200
  });
  const patterns = [
    ['event', /\b(event|commander|draft|prerelease|sealed|fnm|tournament)\b/],
    ['cancellation_or_change', /\b(cancel|closed|closure|reschedul|changed?|tonight)\b/],
    ['fit_or_power', /\b(proxy|proxies|cedh|bracket|power level|casual|competitive)\b/],
    ['community_or_lfg', /\b(lfg|looking for|anyone want|pod|turnout|new player|beginner)\b/]
  ];
  const findingCandidates = messages.flatMap((message) => {
    const text = message.text.toLowerCase();
    const categories = patterns.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
    if (!categories.length) return [];
    return [{
      messageId: message.messageId || null,
      timestamp: message.timestamp || null,
      categories,
      text: message.text.slice(0, 500)
    }];
  }).slice(0, 3);
  const categories = [...new Set(findingCandidates.flatMap((candidate) => candidate.categories))];
  const timestamps = messages.map((message) => message.timestamp).filter(Boolean);
  return {
    messageCount: messages.length,
    firstSeenMessageId: messages[0]?.messageId || null,
    lastSeenMessageId: messages.at(-1)?.messageId || null,
    firstSeenMessageAt: timestamps[0] || null,
    lastSeenMessageAt: timestamps.at(-1) || null,
    usefulFindingPresent: categories.length > 0,
    usefulCategories: categories,
    findingCandidates
  };
}

let page = null;
try {
  page = await context.newPage();
  requestStage = 'home_load';
  await page.goto(homeUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await verifyStage(page, 'discord_home_loaded');

  let navigation = await markAndInspectNavigation(page);
  result.stages.at(-1).navigation = navigation;

  if (navigation.visibleGuildAnchorCount !== 1) {
    if (!navigation.folderControlProven) {
      const hoverProof = await probeFolderTooltips(page);
      result.folderTooltipProbes = hoverProof;
      if (!hoverProof.uniqueMatch) throw new Error('mapped guild is not visible and folder tooltips do not uniquely prove its folder');
      navigation = { ...navigation, folderControlProven: true, folderControlLabel: hoverProof.matches[0].tooltip };
    }
    result.folderExpansionRequired = true;
    result.stages.push({ name: 'folder_navigation_proof', navigation });
    requestStage = 'folder_navigation';
    await controlledNavigationClick(page, 'folder');
    await verifyStage(page, 'folder_expanded');
    navigation = await markAndInspectNavigation(page);
    result.stages.at(-1).navigation = navigation;
  }

  if (navigation.visibleGuildAnchorCount !== 1) throw new Error('mapped guild anchor is not uniquely visible after folder handling');
  result.guildIndicatorBefore = await readGuildIndicator(page);
  if (!result.guildIndicatorBefore.observable) throw new Error('target guild unread/mention state is not observable before navigation');
  requestStage = 'server_selection';
  await controlledNavigationClick(page, 'guild', `/channels/${expectedRoute.guildId}`);
  await verifyStage(page, 'guild_selected');

  navigation = await markAndInspectNavigation(page);
  result.stages.at(-1).navigation = navigation;
  if (navigation.visibleChannelAnchorCount !== 1) throw new Error('mapped channel anchor is not uniquely visible after guild selection');
  requestStage = 'channel_selection';
  await controlledNavigationClick(page, 'channel', `/channels/${expectedRoute.guildId}/${expectedRoute.channelId}`);
  await verifyStage(page, 'channel_selected', { expectExactRoute: true, waitMs: 2500 });

  if (mode === 'content') {
    requestStage = 'message_rendering';
    const windowResult = await classifyTinyWindow(page);
    result.messageContentInspected = true;
    result.messageWindow = {
      messageCount: windowResult.messageCount,
      firstSeenMessageId: windowResult.firstSeenMessageId,
      lastSeenMessageId: windowResult.lastSeenMessageId,
      firstSeenMessageAt: windowResult.firstSeenMessageAt,
      lastSeenMessageAt: windowResult.lastSeenMessageAt
    };
    result.usefulFindingPresent = windowResult.usefulFindingPresent;
    result.usefulCategories = windowResult.usefulCategories;
    result.findingCandidates = windowResult.findingCandidates;
    result.status = 'content_read_succeeded_safely';
    result.routeState = 'ui_native_read_verified';
  } else {
    result.status = 'shell_reached_safely';
    result.routeState = 'ui_native_shell_only';
  }
  result.guildIndicatorAfter = await readGuildIndicator(page);
  result.guildIndicatorUnchanged = JSON.stringify(result.guildIndicatorBefore) === JSON.stringify(result.guildIndicatorAfter);
  if (!result.guildIndicatorUnchanged) throw new Error('target guild unread/mention state changed during guarded read');
} catch (error) {
  result.status = 'failed_closed';
  result.routeState = 'blocked_for_this_run';
  result.failureStage = result.stages.at(-1)?.name || 'before_home_preflight';
  result.failureReason = error.message;
  const blockedClassifications = networkBlocks.map((entry) => classifyDiscordBlockedRequest(entry).classification);
  if (blockedClassifications.includes('blocked_expected_ack')) result.routeState = 'blocked_ack_prevents_render';
  else if (/lurker|gate|join|verification/.test(error.message)) result.routeState = 'onboarding_required';
  else if (/mutation request/.test(error.message)) result.routeState = 'blocked_unexpected_mutation';
  if (page && result.guildIndicatorBefore?.observable && !result.guildIndicatorAfter) {
    result.guildIndicatorAfter = await readGuildIndicator(page).catch(() => ({ observable: false }));
    result.guildIndicatorUnchanged = JSON.stringify(result.guildIndicatorBefore) === JSON.stringify(result.guildIndicatorAfter);
  }
  if (result.guildIndicatorUnchanged === false) result.externalDiscordStateChanged = true;
} finally {
  result.blockedRequests = networkBlocks.map((entry) => ({
    ...classifyDiscordBlockedRequest(entry),
    method: entry.method,
    hasBody: Boolean(entry.hasBody),
    requestStage: entry.requestContext || null,
    blockedAt: entry.blockedAt,
    lurkerRequest: isLurkerRequest(entry)
  }));
  result.blockedExpectedAcks = result.blockedRequests.filter((entry) => entry.classification === 'blocked_expected_ack');
  result.prohibitedSuccessfulResponses = prohibitedResponses.map((entry) => ({
    method: entry.method,
    path: (() => { try { return `${new URL(entry.url).pathname}${new URL(entry.url).search}`; } catch { return entry.url; } })(),
    status: entry.status,
    observedAt: entry.observedAt
  }));
  await context.close();
  const logPath = path.join(logDir, `ui-native-${mode}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  await fs.writeFile(logPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ ...result, logPath }, null, 2));
  if (result.status === 'failed_closed') process.exitCode = 2;
}
