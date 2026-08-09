import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const require = createRequire(import.meta.url);

function parseArgs(argv) {
  const parsed = {
    platform: 'instagram',
    url: '',
    maxLinks: 12,
    maxScrolls: 1,
    output: ''
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--platform') parsed.platform = argv[++index];
    else if (arg === '--url') parsed.url = argv[++index];
    else if (arg === '--max-links') parsed.maxLinks = Number(argv[++index]);
    else if (arg === '--max-scrolls') parsed.maxScrolls = Number(argv[++index]);
    else if (arg === '--output') parsed.output = argv[++index];
    else if (arg === '--help' || arg === '-h') {
      console.log(`Usage:
  node scripts/social_surface_probe.mjs --platform instagram --url https://www.instagram.com/example/

Purpose:
  Reuse the ignored social auth browser profile and capture a bounded visible
  source-review slice. This is a personal assistant review aid, not broad
  scraping: it does not post, react, follow, message, or write Supabase.
`);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!['instagram', 'facebook'].includes(parsed.platform)) {
    throw new Error('--platform must be instagram or facebook');
  }
  if (!parsed.url) throw new Error('--url is required');
  if (!Number.isInteger(parsed.maxLinks) || parsed.maxLinks < 1 || parsed.maxLinks > 30) {
    throw new Error('--max-links must be an integer from 1 to 30');
  }
  if (!Number.isInteger(parsed.maxScrolls) || parsed.maxScrolls < 0 || parsed.maxScrolls > 3) {
    throw new Error('--max-scrolls must be an integer from 0 to 3');
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
  throw new Error(
    `Playwright was not found in the configured/known node_modules paths: ${candidates.join('; ')}`
  );
}

function defaultChromePath() {
  if (process.platform === 'win32') {
    return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  }
  return undefined;
}

function normalizeUrl(href, platform) {
  if (!href) return '';
  try {
    return new URL(href, platform === 'instagram' ? 'https://www.instagram.com' : 'https://www.facebook.com').toString();
  } catch {
    return '';
  }
}

function isCandidateUrl(url, platform) {
  if (platform === 'instagram') {
    return /instagram\.com\/(p|reel|stories)\//i.test(url);
  }
  return /facebook\.com\/.*\/(posts|events|photos|videos)\//i.test(url)
    || /facebook\.com\/events\//i.test(url);
}

function classifySurface(text, links, platform) {
  const compact = text.toLowerCase();
  const loginTerms = platform === 'instagram'
    ? ['log in', 'sign up', 'never miss a post']
    : ['log in', 'create new account'];
  const hasLoginChrome = loginTerms.some((term) => compact.includes(term));
  if (hasLoginChrome && links.length === 0) {
    return 'login_or_public_shell';
  }
  if (links.length > 0) {
    return 'candidate_posts_visible';
  }
  return 'readable_profile_only';
}

function classifyProbe(text, links) {
  const compact = text.toLowerCase();
  const mtgTerms = [
    'magic', 'mtg', 'commander', 'edh', 'draft', 'sealed', 'prerelease',
    'standard', 'modern', 'pauper', 'eventlink', 'fnm', 'avatar',
    'strixhaven', 'hobbit'
  ];
  const operationalTerms = [
    'today', 'tonight', 'tomorrow', 'closed', 'hours', 'schedule',
    'cancel', 'registration', 'league', 'tournament'
  ];
  const matchedMtgTerms = mtgTerms.filter((term) => compact.includes(term));
  const matchedOperationalTerms = operationalTerms.filter((term) => compact.includes(term));
  let disposition = 'no_visible_mtg_signal';
  if (matchedMtgTerms.length > 0 && matchedOperationalTerms.length > 0) {
    disposition = 'possible_operational_mtg_signal';
  } else if (matchedMtgTerms.length > 0) {
    disposition = 'possible_mtg_signal';
  } else if (links.length > 0) {
    disposition = 'candidate_links_no_text_signal';
  }
  return {
    disposition,
    matchedMtgTerms,
    matchedOperationalTerms
  };
}

async function collectVisibleSlice(page, platform, maxLinks) {
  const bodyText = await page.locator('body').innerText({ timeout: 8000 }).catch(() => '');
  const anchors = await page.locator('a[href]').evaluateAll((elements) =>
    elements.map((element) => ({
      href: element.getAttribute('href') || '',
      text: (element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200)
    }))
  );

  const seen = new Set();
  const candidateLinks = [];
  for (const anchor of anchors) {
    const url = normalizeUrl(anchor.href, platform);
    if (!url || seen.has(url) || !isCandidateUrl(url, platform)) continue;
    seen.add(url);
    candidateLinks.push({ url, text: anchor.text });
    if (candidateLinks.length >= maxLinks) break;
  }

  return {
    bodyTextSample: bodyText.replace(/\s+/g, ' ').trim().slice(0, 2500),
    candidateLinks
  };
}

const args = parseArgs(process.argv.slice(2));
const { chromium } = resolvePlaywright();
const root = process.cwd();
const profileDir = path.resolve(root, 'work/social-auth', args.platform, 'profile');
const outputPath = args.output
  ? path.resolve(root, args.output)
  : path.resolve(root, 'work/social-probes', `${args.platform}-${Date.now()}.json`);

let context;
try {
  context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    executablePath: process.env.SOCIAL_AUTH_BROWSER || defaultChromePath(),
    viewport: { width: 1280, height: 900 },
    args: ['--no-proxy-server']
  });
} catch (error) {
  if (`${error.message || error}`.includes('ProcessSingleton')) {
    throw new Error(
      `The ${args.platform} social-auth profile is already open. Close the dedicated ${args.platform} browser window, then rerun this command. Profile: ${profileDir}`
    );
  }
  throw error;
}

try {
  const page = context.pages()[0] || await context.newPage();
  await page.goto(args.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  for (let index = 0; index < args.maxScrolls; index += 1) {
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(1500);
  }

  const visibleSlice = await collectVisibleSlice(page, args.platform, args.maxLinks);
  const surfaceStatus = classifySurface(
    visibleSlice.bodyTextSample,
    visibleSlice.candidateLinks,
    args.platform
  );
  const classification = classifyProbe(visibleSlice.bodyTextSample, visibleSlice.candidateLinks);
  const result = {
    platform: args.platform,
    targetUrl: args.url,
    checkedAt: new Date().toISOString(),
    profileDir,
    bounds: {
      maxLinks: args.maxLinks,
      maxScrolls: args.maxScrolls
    },
    surfaceStatus,
    classification,
    visibleSlice,
    nextAllowedStep:
      surfaceStatus === 'login_or_public_shell'
        ? 'run_interactive_auth_repair_then_probe_again'
        : classification.disposition === 'possible_operational_mtg_signal'
          ? 'manual_or_agent_review_for_artifact_ingest_or_signal'
          : 'record_surface_check_or_stop'
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    status: 'ok',
    outputPath,
    surfaceStatus,
    disposition: classification.disposition,
    candidateLinks: visibleSlice.candidateLinks.length,
    matchedMtgTerms: classification.matchedMtgTerms,
    matchedOperationalTerms: classification.matchedOperationalTerms
  }, null, 2));
} finally {
  await context.close().catch(() => {});
}
