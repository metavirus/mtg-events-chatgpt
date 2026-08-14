import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const audit = fs.readFileSync(path.join(root, 'scripts', 'audit_event_integrity.py'), 'utf8');

const checks = [
  ['community event digest attribution', /relatedEntityType:\s*change\.entityType[\s\S]*summary:\s*`\$\{relatedName\} added/],
  ['community physical-location fallback', /event\?\.communityId[\s\S]*match\(\/\\b\(\?:at\|@\)/],
  ['event cards use normalized host labels', /function eventCard[\s\S]*const hostLabel = eventHostLabel\(event, place\)/],
  ['event drawer uses normalized host labels', /function openEvent[\s\S]*const hostLabel = eventHostLabel\(event, place\)/],
  ['community and venue event-delta matching', /\['venue',\s*'community'\]\.includes\(change\.entityType\)/],
  ['single-event updates navigate directly', /data-event-id="\$\{escapeHtml\(event\.id\)\}"/],
  ['integrity audit accepts community ownership', /series_without_owner/],
  ['integrity audit checks community update attribution', /community_event_updates_misattributed_as_venues/],
];

const failures = checks.filter(([label, pattern]) => !pattern.test(label.startsWith('integrity') ? audit : app));
if (failures.length) {
  for (const [label] of failures) console.error(`FAIL ${label}`);
  process.exit(1);
}

for (const [label] of checks) console.log(`PASS ${label}`);
