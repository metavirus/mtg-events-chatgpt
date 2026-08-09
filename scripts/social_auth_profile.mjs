import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const require = createRequire(import.meta.url);

function parseArgs(argv) {
  const parsed = { platform: 'instagram', url: '', probeOnly: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--platform') parsed.platform = argv[++index];
    else if (arg === '--url') parsed.url = argv[++index];
    else if (arg === '--probe-only') parsed.probeOnly = true;
    else if (arg === '--help' || arg === '-h') {
      console.log(`Usage:
  node scripts/social_auth_profile.mjs --platform instagram --url https://www.instagram.com/example/
  node scripts/social_auth_profile.mjs --platform instagram --probe-only --url https://www.instagram.com/example/

Purpose:
  Create or reuse an ignored persistent browser profile for a hostile social
  surface and report whether the logged-in state is usable. This helper does
  not scrape broadly, write Supabase, post, react, follow, like, or message.

Environment:
  CODEX_NODE_MODULES or SOCIAL_PLAYWRIGHT_NODE_MODULES must point at a
  node_modules folder containing Playwright.
`);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!['instagram', 'facebook'].includes(parsed.platform)) {
    throw new Error('--platform must be instagram or facebook');
  }
  return parsed;
}

function resolvePlaywright() {
  const candidates = [
    process.env.SOCIAL_PLAYWRIGHT_NODE_MODULES,
    process.env.CODEX_NODE_MODULES,
    'C:\\Users\\kavig\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules'
  ].filter(Boolean);

  for (const nodeModules of candidates) {
    try {
      return require(path.join(nodeModules, 'playwright'));
    } catch {
      // Try the next known runtime path.
    }
  }

  if (candidates.length === 0) {
    throw new Error(
      'Playwright node_modules path is not configured. Set SOCIAL_PLAYWRIGHT_NODE_MODULES or CODEX_NODE_MODULES to a node_modules directory containing playwright.'
    );
  }
  throw new Error(
    `Playwright was not found in the configured/known node_modules paths: ${candidates.join('; ')}`
  );
}

function defaultUrl(platform) {
  return platform === 'instagram' ? 'https://www.instagram.com/' : 'https://www.facebook.com/';
}

function defaultChromePath() {
  if (process.platform === 'win32') {
    return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  }
  return undefined;
}

async function classifyPage(page, platform) {
  const url = page.url();
  const title = await page.title().catch(() => '');
  const text = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
  const compactText = text.replace(/\s+/g, ' ').trim().slice(0, 2000);

  const loginPatterns = platform === 'instagram'
    ? [/log in/i, /sign up/i, /forgot password/i, /accounts\/login/i]
    : [/log in/i, /create new account/i, /forgot password/i, /login\.php/i];
  const challengePatterns = [
    /suspicious/i,
    /confirm.*account/i,
    /security check/i,
    /checkpoint/i,
    /temporarily blocked/i,
    /try again later/i
  ];
  const blockedPatterns = [
    /page isn't available/i,
    /content isn't available/i,
    /something went wrong/i,
    /not available/i
  ];

  const hasLoginGate = loginPatterns.some((pattern) => pattern.test(url) || pattern.test(compactText));
  const hasChallenge = challengePatterns.some((pattern) => pattern.test(url) || pattern.test(compactText));
  const hasBlock = blockedPatterns.some((pattern) => pattern.test(compactText));

  const instagramSignals = platform === 'instagram'
    ? await page.locator('article, header, a[href*="/p/"], a[href*="/reel/"]').count().catch(() => 0)
    : 0;
  const facebookSignals = platform === 'facebook'
    ? await page.locator('[role="feed"], [role="article"], a[href*="/posts/"], a[href*="/events/"]').count().catch(() => 0)
    : 0;
  const signalCount = instagramSignals + facebookSignals;

  let status = 'unknown';
  if (hasChallenge) status = 'challenge_or_checkpoint';
  else if (hasLoginGate && signalCount === 0) status = 'login_required';
  else if (hasBlock && signalCount === 0) status = 'blocked_or_unreadable';
  else if (hasLoginGate && signalCount > 0) status = 'public_readable_auth_unclear';
  else if (signalCount > 0) status = 'session_usable';
  else status = 'loaded_but_no_readable_surface';

  return {
    status,
    url,
    title,
    signalCount,
    textSample: compactText.slice(0, 500)
  };
}

async function writeManifest(manifestPath, payload) {
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(manifestPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

async function launchAndProbe({ chromium, executablePath, profileDir, targetUrl, platform }) {
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    executablePath,
    viewport: { width: 1280, height: 900 },
    args: ['--no-proxy-server']
  });

  try {
    const page = context.pages()[0] || await context.newPage();
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    const classification = await classifyPage(page, platform);
    return { context, classification };
  } catch (error) {
    await context.close().catch(() => {});
    throw error;
  }
}

const args = parseArgs(process.argv.slice(2));
const { chromium } = resolvePlaywright();
const workspaceRoot = path.resolve('work/social-auth', args.platform);
const profileDir = path.join(workspaceRoot, 'profile');
const logsDir = path.join(workspaceRoot, 'logs');
const manifestPath = path.join(workspaceRoot, 'profile-manifest.json');
await fs.mkdir(profileDir, { recursive: true });
await fs.mkdir(logsDir, { recursive: true });

const targetUrl = args.url || defaultUrl(args.platform);
const executablePath = process.env.SOCIAL_AUTH_BROWSER || defaultChromePath();
const launchedAt = new Date().toISOString();

let { context, classification } = await launchAndProbe({
  chromium,
  executablePath,
  profileDir,
  targetUrl,
  platform: args.platform
});

if (!args.probeOnly && classification.status !== 'session_usable') {
  console.log(JSON.stringify({
    platform: args.platform,
    profileDir,
    targetUrl,
    status: classification.status,
    nextStep: 'Complete login or any visible checkpoint in the opened browser window, then return to this terminal and press Enter.'
  }, null, 2));

  const rl = readline.createInterface({ input, output });
  await rl.question('After login/checkpoint is complete in the opened browser, press Enter to probe again...');
  rl.close();

  await context.close().catch(() => {});
  ({ context, classification } = await launchAndProbe({
    chromium,
    executablePath,
    profileDir,
    targetUrl,
    platform: args.platform
  }));
}

const result = {
  platform: args.platform,
  targetUrl,
  launchedAt,
  checkedAt: new Date().toISOString(),
  profileDir,
  profileIgnoredByGit: true,
  purpose: [
    'personal assisted source review',
    'bounded login-state smoke tests',
    'future small MTG-relevant post/artifact inspection'
  ],
  forbidden: [
    'posting',
    'liking',
    'following',
    'messaging',
    'broad scraping',
    'committing cookies or session state'
  ],
  classification
};

await writeManifest(manifestPath, result);
console.log(JSON.stringify(result, null, 2));

await context.close();
