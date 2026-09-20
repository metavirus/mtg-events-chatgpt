import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const code = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const start = code.indexOf('function communityConversationExcerpt(');
assert.notEqual(start, -1);
const end = code.indexOf('\nfunction ', start + 1);
const context = vm.createContext({});
vm.runInContext(code.slice(start, end), context);
const excerpt = context.communityConversationExcerpt;
const prefix = "Possible event update from JJ's Collectibles #commander-night: ";

const cases = [
  [prefix + 'apex414 — 5:24 AM Tuesday, September 15, 2026 at 5:24 AM Anyone down for some commander tuesday night at orange?',
    'Anyone down for some commander tuesday night at orange?'],
  ['Possible event update from Collectors Lounge - Cypress Discord #mtg-announcements-and-events: Luis V — Yesterday at 2:37 AM Friday, September 18, 2026 at 2:37 AM how much will the jace commander deck be priced at',
    'how much will the jace commander deck be priced at'],
  ['Useful Discord activity from Kingslayer #commander: Hive Mind Jorge [KG], Server Tag: KG KG — Today at 4:52 PM Sunday, September 6, 2026 at 4:52 PM Anyone need another player?',
    'Anyone need another player?'],
  [prefix + 'Player — Tuesday, September 15, 2026 at 5:24 AM Bring two decks — 7 PM works.\nNew players welcome.',
    'Bring two decks — 7 PM works.\nNew players welcome.'],
  [prefix + 'Player — 5:24 AM Anyone down for Commander?',
    'Player — 5:24 AM Anyone down for Commander?'],
  [prefix + 'Player — an unfamiliar timestamp: keep this invitation.',
    'Player — an unfamiliar timestamp: keep this invitation.'],
  ['Check #commander: anyone around — Today at 5 PM?',
    'Check #commander: anyone around — Today at 5 PM?'],
  [prefix + 'Player — Tuesday, September 15, 2026 at 5:24 AM',
    'Player — Tuesday, September 15, 2026 at 5:24 AM'],
  [null, ''],
];
for (const [input, expected] of cases) assert.equal(excerpt(input), expected);
assert.match(code, /const excerpt = signal\.id\.startsWith\('conversation:'\) \? communityConversationExcerpt\(signal\.details\) : signal\.details;/);
console.log(`PASS community excerpts: ${cases.length} header, message-preservation, and fallback cases`);
