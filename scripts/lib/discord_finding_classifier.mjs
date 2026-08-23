const NON_PLANNING_CHATTER = /\b(?:lost|missing|misplaced|left behind|return(?:ed|ing)? it|return .* to the store|found item|anyone find|anyone seen)\b/i;
const EVENT_TERMS = /\b(?:event|commander|draft|prerelease|sealed|fnm|tournament|meet ?up)\b/i;
const SCHEDULE_FACTS = /\b(?:sign[ -]?ups?|register|registration|entry|starts?|starting|scheduled|schedule|doors|check[ -]?in|rounds?|seats?|spots?|capacity|at \d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?))\b/i;
const FUTURE_CUES = /\b(?:tomorrow|tonight|today|this (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekend)|next (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekend|week))\b/i;

function candidateTimestampMs(candidate) {
  const parsed = Date.parse(candidate?.timestamp || '');
  return Number.isFinite(parsed) ? parsed : null;
}

function ageHours(candidate, nowMs) {
  const timestampMs = candidateTimestampMs(candidate);
  return timestampMs === null ? null : Math.max(0, (nowMs - timestampMs) / 3_600_000);
}

function relativeCueIsStillActionable(text, candidate, nowMs) {
  const timestampMs = candidateTimestampMs(candidate);
  if (timestampMs === null) return false;
  if (/\btomorrow\b/i.test(text)) return nowMs <= timestampMs + 36 * 3_600_000;
  if (/\b(?:today|tonight)\b/i.test(text)) return nowMs <= timestampMs + 24 * 3_600_000;
  if (/\b(?:this|next) (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekend|week)\b/i.test(text)) {
    return nowMs <= timestampMs + 8 * 24 * 3_600_000;
  }
  return false;
}

export function isActionableEventCandidate(candidate, nowMs = Date.now()) {
  const text = String(candidate?.text || '');
  const categories = new Set(candidate?.categories || []);
  if (!categories.has('event') || !EVENT_TERMS.test(text)) return false;
  if (NON_PLANNING_CHATTER.test(text)) return false;
  if (FUTURE_CUES.test(text)) return relativeCueIsStillActionable(text, candidate, nowMs);
  const hours = ageHours(candidate, nowMs);
  return SCHEDULE_FACTS.test(text) && hours !== null && hours <= 7 * 24;
}

function isCurrentCommunitySignal(candidate, nowMs) {
  const categories = candidate?.categories || [];
  const hours = ageHours(candidate, nowMs);
  if (hours === null || NON_PLANNING_CHATTER.test(String(candidate?.text || ''))) return false;
  if (categories.includes('user_involvement')) return hours <= 7 * 24;
  if (categories.includes('cancellation_or_change')) return hours <= 48;
  if (categories.includes('community_or_lfg')) return hours <= 48;
  if (categories.includes('fit_or_power')) return hours <= 7 * 24;
  return false;
}

export function classifyDiscordFindings(harness, nowMs = Date.now()) {
  const rawCandidates = harness?.findingCandidates || [];
  const eventCandidates = rawCandidates.filter((candidate) => isActionableEventCandidate(candidate, nowMs));
  const signalCandidates = rawCandidates.filter((candidate) => !eventCandidates.includes(candidate) && isCurrentCommunitySignal(candidate, nowMs));
  const materialCandidates = [...eventCandidates, ...signalCandidates];
  const usefulCategories = [...new Set(materialCandidates.flatMap((candidate) => candidate.categories || []))];
  if (eventCandidates.length) return { outcome: 'event_candidate', usefulCategories, materialCandidates };
  if (signalCandidates.length) return { outcome: 'accepted_signal', usefulCategories, materialCandidates };
  return { outcome: 'quiet_coverage', usefulCategories: [], materialCandidates: [] };
}

export function conciseDiscordFinding(candidate, maxLength = 190) {
  const text = String(candidate?.text || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}
