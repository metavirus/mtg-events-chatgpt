// Reviewed September 6 hours correction. Generates a controlled proposal only.
import { writeFileSync } from 'node:fs';
const operations = [];
const add = (table, key, fields, reason) => {
  if (key.id) key.id = key.id.replaceAll(':', '-');
  if (table === 'signals') fields.captured_at = fields.observed_at;
  operations.push({ action: 'upsert', table, key, fields, reason });
};
const week = (pairs) => Object.fromEntries(pairs.map(([open, close], day) => [day, [{ open, close }]]));
const stores = [
  ['collectors-lounge-cypress', 'Collectors Lounge - Cypress', 'https://collectorslounge.us/', Array(7).fill(['12:00','22:00']), 'Official Cypress-address website publishes all seven days 12 PM-10 PM. This completes the saved weekend-only schedule; the August 29 weekend announcement remains historical evidence.'],
  ['projectccg-alhambra', 'ProjectCCG - Alhambra', 'https://projectccg.com/pages/contact', [['12:00','21:00'],['12:00','17:00'],['11:00','21:00'],['11:00','21:00'],['11:00','21:00'],['11:00','21:00'],['12:00','21:00']], 'Official contact page at 39 S Garfield: Monday noon-5 PM; Tuesday-Friday 11 AM-9 PM; Saturday/Sunday noon-9 PM.'],
  ['the-comic-bug', 'The Comic Bug', 'https://www.thecomicbug.com/locations/', [['10:00','18:00'],['11:00','18:00'],['11:00','18:00'],['09:00','20:00'],['11:00','18:00'],['11:00','18:00'],['10:00','18:00']], 'Official Manhattan Beach schedule for 1807 Manhattan Beach Blvd, not the Culver City or Game Hub listing.']
];
for (const [id, name, url, pairs, notes] of stores) {
  const sid = `src-hours-completion-${id}-2026-09-06`;
  add('sources', {id:sid}, {label:`${name}: official weekly hours`,url,source_type:'officialWebsite',health_status:'current',last_checked:'2026-09-06'}, 'Current official hours source inspected for approved gap correction.');
  add('entity_sources', {entity_type:'venue',entity_id:id,source_id:sid}, {relationship:'evidence'}, 'Link exact-location hours evidence.');
  add('venue_hours', {venue_id:id}, {status:'verified',weekly_hours:week(pairs),source_id:sid,last_verified:'2026-09-06',notes}, 'User approved completing missing weekly hours from the cited official schedule.');
  add('research_changes', {id:`hours-completion-${id}-2026-09-06`}, {detected_at:'2026-09-06T21:15:00Z',change_type:'hours_update',entity_type:'venue',entity_id:id,summary:`${name}: complete weekly hours added from the official website.`,review_status:'accepted'}, 'Material hours gap corrected.');
}
const id='the-game-chest-irvine';
const url='https://www.keepupcards.com/shop/the-game-chest-irvine-ca';
const sid='src-hours-review-game-chest-irvine-2026-09-06';
add('sources',{id:sid},{label:'Game Chest Irvine: current-address hours listing',url,source_type:'directory',health_status:'current',last_checked:'2026-09-06'},'Matched 5365 Alton Parkway; hours conflict with other same-address listings.');
add('entity_sources',{entity_type:'venue',entity_id:id,source_id:sid},{relationship:'evidence'},'Link review evidence.');
add('signals',{id:'hours-review:game-chest-irvine:2026-09-06'},{category:'operational',priority:'normal',status:'new',source_id:sid,observed_at:'2026-09-06T21:15:00Z',related_entity_type:'venue',related_entity_id:id,summary:'Confirm Game Chest Irvine hours at Alton Square.',details:'Same-address listings disagree. The shopping-center page confirms Alton Square but does not publish hours; older Spectrum schedules must not be assumed current.',evidence_url:url,confidence:'medium',suggested_action:'Review the linked schedules and approve the recommended schedule only if it matches what you know.',promotion_target:'venue_hours',proposed_change:{type:'venue_hours',weekly_hours:week([['10:00','21:00'],['10:00','21:00'],['10:00','21:00'],['10:00','21:00'],['10:00','21:00'],['10:00','22:00'],['10:00','22:00']]),note:'User reviewed conflicting current-address directory schedules for Game Chest Irvine.',review_reason:'Recommended listing agrees with Giftly and TCGList at the Alton address, but directory agreement is not independent confirmation. FindGlocal lists later opening on Friday-Sunday; Card Shop Finder lists much earlier closing.',review_options:[{source_label:'KeepUp / Alton address',source_url:url,summary:'Sun-Thu 10 AM-9 PM; Fri-Sat 10 AM-10 PM',recommended:true},{source_label:'FindGlocal / Alton address',source_url:'https://www.findglocal.com/US/Irvine/2207361186249713/The-Game-Chest---Irvine',summary:'Mon-Thu 10 AM-9 PM; Fri 11 AM-9 PM; Sat 11 AM-10 PM; Sun 11 AM-9 PM'},{source_label:'Card Shop Finder / Alton address',source_url:'https://thecardshopfinder.com/ca/irvine/the-game-chest/',summary:'Mon-Thu 10 AM-6 PM; Fri-Sat 10 AM-7 PM; Sun 11 AM-5 PM'}]}},'User approved an in-app source-linked review for the unresolved fourth hours gap.');
writeFileSync('work/hours-gap-correction.json', JSON.stringify({proposal_id:'hours-gap-correction-2026-09-06',description:'User-approved three official weekly schedules and one explicit conflict review.',created_at:'2026-09-06T21:15:00Z',author:'Codex',operations},null,2)+'\n');
