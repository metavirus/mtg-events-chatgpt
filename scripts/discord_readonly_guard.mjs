const mutationMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const defaultMutationSelector = [
  '[data-message-composer]',
  '[data-mutation-control]',
  '[contenteditable="true"]',
  '[role="textbox"]',
  '[data-slate-editor="true"]',
  'textarea',
  'input',
  'button',
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

const discordMutationPathPatterns = [
  /\/api\/v\d+\/channels\/[^/]+\/messages(?:\/|$)/i,
  /\/api\/v\d+\/channels\/[^/]+\/typing(?:\/|$)/i,
  /\/api\/v\d+\/channels\/[^/]+\/invites(?:\/|$)/i,
  /\/api\/v\d+\/channels\/[^/]+\/webhooks(?:\/|$)/i,
  /\/api\/v\d+\/channels\/[^/]+\/recipients(?:\/|$)/i,
  /\/api\/v\d+\/channels\/[^/]+\/pins(?:\/|$)/i,
  /\/api\/v\d+\/channels\/[^/]+\/threads(?:\/|$)/i,
  /\/api\/v\d+\/interactions(?:\/|$)/i,
  /\/api\/v\d+\/invites(?:\/|$)/i,
  /\/api\/v\d+\/guilds\/[^/]+\/members(?:\/|$)/i,
  /\/api\/v\d+\/guilds\/[^/]+\/roles(?:\/|$)/i,
  /\/api\/v\d+\/users\/@me(?:\/|$)/i,
  /\/api\/v\d+\/users\/@me\/settings(?:\/|$)/i,
  /\/api\/v\d+\/attachments(?:\/|$)/i,
  /\/api\/v\d+\/science(?:\/|$)/i
];

function readonlyPageGuardBootstrap({ selector, guardVersion }) {
  const matchesMutationTarget = (target) => {
    if (!(target instanceof Element)) return false;
    return Boolean(target.closest(selector));
  };

  const block = (event) => {
    if (!matchesMutationTarget(event.target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  [
    'beforeinput',
    'input',
    'paste',
    'drop',
    'keydown',
    'keyup',
    'keypress',
    'submit',
    'click',
    'dblclick',
    'pointerdown',
    'pointerup',
    'mousedown',
    'mouseup',
    'dragstart'
  ].forEach((name) => document.addEventListener(name, block, true));

  const disableMutationSurface = () => {
    document.querySelectorAll(selector).forEach((element) => {
      if (element.getAttribute('aria-disabled') !== 'true') element.setAttribute('aria-disabled', 'true');
      if (element.getAttribute('data-discord-readonly-disabled') !== guardVersion) {
        element.setAttribute('data-discord-readonly-disabled', guardVersion);
      }
      if ('disabled' in element && !element.disabled) element.disabled = true;
      if (element.getAttribute('contenteditable') === 'true') {
        element.setAttribute('contenteditable', 'false');
      }
      if ('value' in element && element.value !== '') element.value = '';
      if (element.matches('[data-message-composer], [role="textbox"], [data-slate-editor="true"]')) {
        element.textContent = '';
      }
      if (element.tabIndex !== -1) element.tabIndex = -1;
    });
  };

  new MutationObserver(disableMutationSurface).observe(document, {
    subtree: true,
    childList: true,
    attributes: true
  });
  document.addEventListener('DOMContentLoaded', disableMutationSurface, { once: true });
  disableMutationSurface();

  window.__discordReadonlyGuard = Object.freeze({
    version: guardVersion,
    active: true,
    installedAt: new Date().toISOString()
  });
}

function isDiscordMutationRequest(requestUrl, method) {
  const normalizedMethod = method.toUpperCase();
  if (!mutationMethods.has(normalizedMethod)) return false;

  let parsed;
  try {
    parsed = new URL(requestUrl);
  } catch {
    return mutationMethods.has(normalizedMethod);
  }

  if (!/(^|\.)discord(app)?\.com$/i.test(parsed.hostname)) return false;
  return discordMutationPathPatterns.some((pattern) => pattern.test(parsed.pathname));
}

function isAllowedDiscordReadinessRequest(requestUrl, method, options = {}) {
  if (method.toUpperCase() !== 'PUT') return false;
  let parsed;
  try {
    parsed = new URL(requestUrl);
  } catch {
    return false;
  }
  if (!/(^|\.)discord(app)?\.com$/i.test(parsed.hostname)) return false;
  const match = parsed.pathname.match(/^\/api\/v\d+\/guilds\/(\d+)\/members\/@me$/i);
  if (!match || parsed.searchParams.get('lurker') !== 'true') return false;
  const expectedRoute = options.expectedRoute || null;
  if (expectedRoute?.guildId && expectedRoute.guildId !== match[1]) return false;
  return true;
}

function classifyDiscordBlockedRequest(entry) {
  let parsed;
  try {
    parsed = new URL(entry.url);
  } catch {
    return { classification: 'blocked_unknown_or_prohibited_mutation', mutationType: 'unparseable', normalizedEndpoint: 'unparseable' };
  }
  const ackMatch = parsed.pathname.match(/^\/api\/v\d+\/channels\/(\d+)\/messages\/(\d+)\/ack$/i);
  if (entry.method === 'POST' && ackMatch) {
    return {
      classification: 'blocked_expected_ack',
      normalizedEndpoint: '/api/v*/channels/{channel_id}/messages/{message_id}/ack',
      channelId: ackMatch[1],
      messageId: ackMatch[2]
    };
  }
  if (entry.method === 'PATCH' && /^\/api\/v\d+\/users\/@me\/settings-proto\/\d+$/i.test(parsed.pathname) && !parsed.search) {
    return {
      classification: 'blocked_expected_client_setting',
      normalizedEndpoint: '/api/v*/users/@me/settings-proto/{version}'
    };
  }
  if (/\/guilds\/\d+\/members\/@me$/i.test(parsed.pathname) && parsed.searchParams.get('lurker') === 'true') {
    return { classification: 'blocked_unknown_or_prohibited_mutation', mutationType: 'membership_or_lurker', normalizedEndpoint: '/api/v*/guilds/{guild_id}/members/@me?lurker=true' };
  }
  if (/\/api\/v\d+\/science(?:\/|$)/i.test(parsed.pathname)) {
    return { classification: 'telemetry', normalizedEndpoint: '/api/v*/science' };
  }
  if (/\/reactions(?:\/|$)/i.test(parsed.pathname)) {
    return { classification: 'blocked_unknown_or_prohibited_mutation', mutationType: 'reaction', normalizedEndpoint: '/api/v*/channels/{channel_id}/messages/{message_id}/reactions/...' };
  }
  if (/\/messages(?:\/|$)/i.test(parsed.pathname)) {
    return { classification: 'blocked_unknown_or_prohibited_mutation', mutationType: 'message_reply_or_edit', normalizedEndpoint: '/api/v*/channels/{channel_id}/messages/...' };
  }
  if (/\/attachments(?:\/|$)/i.test(parsed.pathname)) {
    return { classification: 'blocked_unknown_or_prohibited_mutation', mutationType: 'upload', normalizedEndpoint: '/api/v*/attachments/...' };
  }
  if (/\/invites(?:\/|$)/i.test(parsed.pathname)) {
    return { classification: 'blocked_unknown_or_prohibited_mutation', mutationType: 'invite', normalizedEndpoint: '/api/v*/invites/...' };
  }
  if (/\/roles(?:\/|$)/i.test(parsed.pathname)) {
    return { classification: 'blocked_unknown_or_prohibited_mutation', mutationType: 'role', normalizedEndpoint: '/api/v*/guilds/{guild_id}/roles/...' };
  }
  if (/\/users\/@me\/settings(?:-proto)?(?:\/|$)/i.test(parsed.pathname)) {
    return { classification: 'blocked_unknown_or_prohibited_mutation', mutationType: 'other_settings', normalizedEndpoint: '/api/v*/users/@me/settings/...' };
  }
  return { classification: 'blocked_unknown_or_prohibited_mutation', mutationType: 'unknown', normalizedEndpoint: parsed.pathname };
}

async function installDiscordReadOnlyGuards(context, options = {}) {
  const guardVersion = options.guardVersion || 'discord-readonly-v1';
  const selector = options.selector || defaultMutationSelector;
  const networkBlocks = options.networkBlocks || [];
  const allowedReadinessRequests = options.allowedReadinessRequests || [];
  const expectedRoute = options.expectedRoute || null;
  const getRequestContext = typeof options.getRequestContext === 'function'
    ? options.getRequestContext
    : () => null;

  await context.addInitScript(readonlyPageGuardBootstrap, { selector, guardVersion });
  for (const pattern of ['**://discord.com/**', '**://*.discord.com/**', '**://discordapp.com/**', '**://*.discordapp.com/**']) {
    await context.route(pattern, async (route) => {
      const request = route.request();
      if (isAllowedDiscordReadinessRequest(request.url(), request.method(), { expectedRoute })) {
        const bodyBuffer = request.postDataBuffer();
        allowedReadinessRequests.push({
          method: request.method().toUpperCase(),
          url: request.url(),
          hasBody: Boolean(bodyBuffer?.length),
          bodyByteLength: bodyBuffer?.length ?? 0,
          requestContext: getRequestContext(),
          allowedAt: new Date().toISOString(),
          classification: 'allowed_discord_lurker_readiness_ack'
        });
        await route.continue();
        return;
      }
      if (isDiscordMutationRequest(request.url(), request.method())) {
        const bodyBuffer = request.postDataBuffer();
        networkBlocks.push({
          method: request.method().toUpperCase(),
          url: request.url(),
          hasBody: Boolean(bodyBuffer?.length),
          bodyByteLength: bodyBuffer?.length ?? 0,
          requestContext: getRequestContext(),
          blockedAt: new Date().toISOString()
        });
        await route.abort('blockedbyclient');
        return;
      }
      await route.continue();
    });
  }

  return { guardVersion, selector, networkBlocks };
}

async function readDiscordSafetyState(page, options = {}) {
  const selector = options.selector || defaultMutationSelector;
  return page.evaluate((mutationSelector) => {
    const active = document.activeElement;
    const activeEditable = active instanceof Element && (
      active.matches('input, textarea, [contenteditable="true"], [role="textbox"], [data-slate-editor="true"]')
    );
    const enabledMutators = [...document.querySelectorAll(mutationSelector)].filter((element) => {
      const editable = element.getAttribute('contenteditable') === 'true';
      const disabled = 'disabled' in element ? element.disabled : element.getAttribute('aria-disabled') === 'true';
      return editable || !disabled;
    });
    return {
      url: location.href,
      host: location.hostname,
      title: document.title,
      heartbeat: window.__discordReadonlyGuard || null,
      activeEditable,
      enabledMutatorCount: enabledMutators.length,
      enabledMutatorLabels: enabledMutators.slice(0, 10).map((element) => (
        element.getAttribute('aria-label') ||
        element.getAttribute('data-mutation-control') ||
        element.tagName
      )),
      hasLoginGate: Boolean(document.querySelector('[name="email"], [name="password"]')),
      hasInviteGate: Boolean(document.body?.innerText?.match(/\b(join|accept invite|claim account|verify|captcha|role)\b/i))
    };
  }, selector);
}

async function readDiscordShellSafetyState(page, options = {}) {
  const selector = options.selector || defaultMutationSelector;
  const expectedRoute = options.expectedRoute || null;
  return page.evaluate(({ mutationSelector, expectedRoute }) => {
    const active = document.activeElement;
    const activeEditable = active instanceof Element && (
      active.matches('input, textarea, [contenteditable="true"], [role="textbox"], [data-slate-editor="true"]')
    );
    const enabledMutators = [...document.querySelectorAll(mutationSelector)].filter((element) => {
      const editable = element.getAttribute('contenteditable') === 'true';
      const disabled = 'disabled' in element ? element.disabled : element.getAttribute('aria-disabled') === 'true';
      return editable || !disabled;
    });
    const loginGate = Boolean(document.querySelector('[name="email"], [name="password"], form[action*="login" i]'));
    const visibleText = (element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      if (rect.width <= 0 || rect.height <= 0 || style.visibility === 'hidden' || style.display === 'none') return '';
      return [
        element.getAttribute('aria-label') || '',
        element.textContent || ''
      ].join(' ').replace(/\s+/g, ' ').trim();
    };
    const visibleGateLabels = [...document.querySelectorAll('button, a, [role="button"], [role="dialog"], main, [role="main"]')]
      .map(visibleText)
      .filter(Boolean)
      .filter((label) => /\b(join server|accept invite|complete verification|verify your account|captcha|claim account|continue to discord)\b/i.test(label));
    const inviteOrRoleGate = visibleGateLabels.length > 0;
    const shellMarkers = {
      appMount: Boolean(document.querySelector('#app-mount')),
      guildShell: Boolean(document.querySelector('[aria-label*="Servers" i], [data-list-id*="guilds" i]')),
      channelShell: Boolean(document.querySelector('[aria-label*="Channels" i], [data-list-id*="channels" i]')),
      mainShell: Boolean(document.querySelector('main, [role="main"], [aria-label*="Messages" i]')),
      documentReady: document.readyState === 'complete' || document.readyState === 'interactive'
    };
    const routeMatch = location.pathname.match(/^\/channels\/(\d+)\/(\d+)/i);
    const actualRoute = routeMatch ? {
      guildId: routeMatch[1],
      channelId: routeMatch[2]
    } : null;
    const routeIdentity = {
      expected: expectedRoute,
      actual: actualRoute,
      matches: Boolean(
        expectedRoute &&
        actualRoute &&
        expectedRoute.guildId === actualRoute.guildId &&
        expectedRoute.channelId === actualRoute.channelId
      )
    };
    return {
      url: location.href,
      host: location.hostname,
      title: document.title,
      heartbeat: window.__discordReadonlyGuard || null,
      activeEditable,
      enabledMutatorCount: enabledMutators.length,
      enabledMutatorLabels: enabledMutators.slice(0, 10).map((element) => (
        element.getAttribute('aria-label') ||
        element.getAttribute('data-mutation-control') ||
        element.tagName
      )),
      hasLoginGate: loginGate,
      hasInviteGate: inviteOrRoleGate,
      gateLabels: visibleGateLabels.slice(0, 10),
      shellMarkers,
      routeIdentity
    };
  }, { mutationSelector: selector, expectedRoute });
}

async function extractDiscordVisibleMessages(page, options = {}) {
  const limit = options.limit || 10;
  const maxCharactersPerMessage = options.maxCharactersPerMessage || 1000;
  return page.evaluate(({ limit, maxCharactersPerMessage }) => {
    const isVisible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        style.visibility !== 'hidden' &&
        style.display !== 'none';
    };
    const normalize = (value) => value.replace(/\s+/g, ' ').trim();
    const candidates = [
      ...document.querySelectorAll('[id^="chat-messages-"], [role="article"]')
    ].filter(isVisible);

    const seen = new Set();
    return candidates.map((element) => {
      const idValue = element.id || element.getAttribute('data-list-item-id') || '';
      const messageId = idValue.match(/(?:chat-messages-|chat-messages___)(?:\d+-)?(\d{15,})$/)?.[1] ||
        idValue.match(/(\d{15,})$/)?.[1] ||
        null;
      const text = normalize(element.innerText || '');
      const timestamp = element.querySelector('time')?.getAttribute('datetime') ||
        element.querySelector('time')?.textContent?.trim() ||
        null;
      const author = element.querySelector('[class*="username"], [data-author-id], h3 span')?.textContent?.trim() || null;
      return {
        messageId,
        timestamp,
        author,
        text: text.slice(0, maxCharactersPerMessage),
        truncated: text.length > maxCharactersPerMessage
      };
    }).filter((message) => {
      if (!message.text) return false;
      const key = message.messageId || message.text;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(-limit);
  }, { limit, maxCharactersPerMessage });
}

function assertDiscordReadOnlyState(state, options = {}) {
  const guardVersion = options.guardVersion || 'discord-readonly-v1';
  const requireDiscordHost = options.requireDiscordHost !== false;
  const failOnGate = options.failOnGate !== false;
  if (requireDiscordHost && !/(^|\.)discord(app)?\.com$/i.test(state.host || '')) {
    throw new Error(`unexpected host: ${state.host || 'unknown'}`);
  }
  if (!state.heartbeat?.active || state.heartbeat.version !== guardVersion) {
    throw new Error('missing or mismatched read-only guard heartbeat');
  }
  if (state.activeEditable) throw new Error('editable element has focus');
  if (state.enabledMutatorCount !== 0) {
    throw new Error(`enabled mutating controls: ${state.enabledMutatorCount}`);
  }
  if (failOnGate && (state.hasLoginGate || state.hasInviteGate)) {
    throw new Error('login, invite, role, verification, or gated state detected');
  }
  return state;
}

function createReadOnlySurveySurface(context, options = {}) {
  const selector = options.selector || defaultMutationSelector;
  const guardVersion = options.guardVersion || 'discord-readonly-v1';

  const openShell = async (url) => {
    if (!/^https:\/\/discord(app)?\.com\/channels\//i.test(url)) {
      throw new Error('target must be an exact Discord channel URL');
    }
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const safety = await readDiscordSafetyState(page, { selector });
    assertDiscordReadOnlyState(safety, { guardVersion });
    return {
      url: safety.url,
      host: safety.host,
      title: safety.title,
      guardVersion: safety.heartbeat.version
    };
  };

  return Object.freeze({ openShell });
}

export {
  classifyDiscordBlockedRequest,
  createReadOnlySurveySurface,
  defaultMutationSelector,
  discordMutationPathPatterns,
  installDiscordReadOnlyGuards,
  isAllowedDiscordReadinessRequest,
  isDiscordMutationRequest,
  extractDiscordVisibleMessages,
  readDiscordSafetyState,
  readDiscordShellSafetyState,
  readonlyPageGuardBootstrap,
  assertDiscordReadOnlyState
};
