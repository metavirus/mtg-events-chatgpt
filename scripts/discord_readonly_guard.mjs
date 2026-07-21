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

async function installDiscordReadOnlyGuards(context, options = {}) {
  const guardVersion = options.guardVersion || 'discord-readonly-v1';
  const selector = options.selector || defaultMutationSelector;
  const networkBlocks = options.networkBlocks || [];

  await context.addInitScript(readonlyPageGuardBootstrap, { selector, guardVersion });
  for (const pattern of ['**://discord.com/**', '**://*.discord.com/**', '**://discordapp.com/**', '**://*.discordapp.com/**']) {
    await context.route(pattern, async (route) => {
      const request = route.request();
      if (isDiscordMutationRequest(request.url(), request.method())) {
        networkBlocks.push({
          method: request.method().toUpperCase(),
          url: request.url(),
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
    const inviteOrRoleGate = Boolean(document.querySelector([
      '[aria-label*="Join" i]',
      '[aria-label*="Accept Invite" i]',
      '[aria-label*="Invite" i]',
      '[aria-label*="Role" i]',
      '[aria-label*="Verify" i]',
      '[data-list-item-id*="roles" i]'
    ].join(',')));
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
      shellMarkers,
      routeIdentity
    };
  }, { mutationSelector: selector, expectedRoute });
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
  createReadOnlySurveySurface,
  defaultMutationSelector,
  discordMutationPathPatterns,
  installDiscordReadOnlyGuards,
  isDiscordMutationRequest,
  readDiscordSafetyState,
  readDiscordShellSafetyState,
  readonlyPageGuardBootstrap,
  assertDiscordReadOnlyState
};
