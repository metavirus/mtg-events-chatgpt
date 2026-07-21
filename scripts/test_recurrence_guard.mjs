import assert from 'node:assert/strict';

const WEEKDAY_INDEX = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  tues: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  thurs: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6
};

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function normalizeTime(value) {
  if (!value) return null;
  return String(value).slice(0, 5);
}

function normalizeRecurrence(value, defaultStartTime) {
  if (!value) return null;
  const recurrence = { ...value };
  if (recurrence.dayOfWeek == null && typeof recurrence.weekday === 'string') {
    const normalizedWeekday = recurrence.weekday.trim().toLowerCase();
    if (Object.hasOwn(WEEKDAY_INDEX, normalizedWeekday)) recurrence.dayOfWeek = WEEKDAY_INDEX[normalizedWeekday];
  }
  if (recurrence.dayOfWeek != null) recurrence.dayOfWeek = Number(recurrence.dayOfWeek);
  if (!recurrence.startTime && defaultStartTime) recurrence.startTime = normalizeTime(defaultStartTime);
  return recurrence;
}

function validWeeklyDayOfWeek(event, warnings) {
  const dayOfWeek = event.recurrence?.dayOfWeek;
  if (Number.isInteger(dayOfWeek) && dayOfWeek >= 0 && dayOfWeek <= 6) return dayOfWeek;
  warnings.push(`Skipping event series with invalid weekly recurrence: ${event.id} (${event.title})`);
  return null;
}

function firstWeeklyOccurrence(event, start, warnings = []) {
  const dayOfWeek = validWeeklyDayOfWeek(event, warnings);
  if (dayOfWeek == null) return null;
  const firstOffset = (dayOfWeek - start.getDay() + 7) % 7;
  return addDays(startOfDay(start), firstOffset);
}

const monday = new Date(2026, 6, 20);

const canonical = {
  id: 'canonical-friday',
  title: 'Canonical Friday',
  recurrence: normalizeRecurrence({ frequency: 'weekly', dayOfWeek: 5 }, '18:00')
};
assert.equal(canonical.recurrence.dayOfWeek, 5);
assert.equal(canonical.recurrence.startTime, '18:00');
assert.equal(firstWeeklyOccurrence(canonical, monday).getDay(), 5);

const legacy = {
  id: 'legacy-friday',
  title: 'Legacy Friday',
  recurrence: normalizeRecurrence({ frequency: 'weekly', weekday: 'friday' }, '18:00')
};
assert.equal(legacy.recurrence.dayOfWeek, 5);
assert.equal(firstWeeklyOccurrence(legacy, monday).getDay(), 5);

const invalidWarnings = [];
const invalid = {
  id: 'invalid-weekly',
  title: 'Invalid Weekly',
  recurrence: normalizeRecurrence({ frequency: 'weekly', weekday: 'noday' }, '18:00')
};
assert.equal(firstWeeklyOccurrence(invalid, monday, invalidWarnings), null);
assert.equal(invalidWarnings.length, 1);
assert.match(invalidWarnings[0], /invalid-weekly/);

console.log('Recurrence guard tests passed.');
