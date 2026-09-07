import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const code = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const names = ['eventTimeIsEstimated', 'eventTimeLabel', 'todayAvailability', 'currentHoursLabel'];
const context = vm.createContext({ Date, eventStartTime: e => e.startTime, parseDate: s => new Date(s), formatTime: s => s });
for (const name of names) {
  const start = code.indexOf(`function ${name}(`);
  const end = code.indexOf('\nfunction ', start + 1);
  vm.runInContext(code.slice(start, end), context);
}
const now = new Date(2026, 8, 6, 17, 30);
const event = (title, startTime, extra = {}) => ({ title, startTime, occurrenceDate: new Date(2026, 8, 6), ...extra });
const group = e => context.todayAvailability(e, now).group;
assert.equal(group(event('Commander tournament', '11:30')), 'earlier');
assert.equal(group(event('Casual Commander', '19:00')), 'later');
assert.equal(group(event('Casual Commander', '12:00')), 'dropin');
assert.equal(group(event('Casual Commander', '12:00', {endTime: '16:00'})), 'earlier');
assert.equal(group(event('Casual Draft', '12:00')), 'earlier');
assert.equal(group(event('Casual Play', '12:00', {details: '12:00 PM is a planning proxy'})), 'unknown');
assert.equal(group(event('Commander', null)), 'unknown');
assert.equal(context.eventTimeLabel(event('Casual Play', '12:00', {details: '12:00 PM is a planning proxy'})), 'Time to confirm');
assert.equal(context.eventTimeLabel(event('Commander', '19:00')), '19:00');
assert.equal(context.eventTimeLabel(event('Commander', null)), 'Time to confirm');
// No event surface may bypass the shared certainty-aware time label.
assert.equal(code.includes('${formatTime(eventStartTime(event))}'), false);
assert.equal(code.includes('${formatTime(event.recurrence?.startTime)}'), false);
assert.equal(code.includes('${formatTime(event.recurrence.startTime)}'), false);
assert.equal(context.currentHoursLabel([{open:'12:00', close:'22:00'}], now), 'Open until 22:00');
assert.equal(context.currentHoursLabel([{open:'19:00', close:'23:00'}], now), 'Opens 19:00');
assert.equal(context.currentHoursLabel([{closed:true}], now), 'Closed today');
assert.equal(context.currentHoursLabel([{open:'12:00',close:'00:00'}], now), 'Open until 00:00');
assert.equal(context.currentHoursLabel([{open:'12:00',close:'16:00'}], now), 'Closed for today');
console.log('PASS focused Today: elapsed, future, drop-in, ended, estimated, unknown, and opening hours');
