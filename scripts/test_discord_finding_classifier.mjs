import assert from 'node:assert/strict';
import { classifyDiscordFindings, isActionableEventCandidate } from './lib/discord_finding_classifier.mjs';

const now = Date.parse('2026-08-23T14:45:00Z');
const candidate = (timestamp, text, categories = ['direct_question_or_request', 'event']) => ({ timestamp, text, categories });

assert.equal(isActionableEventCandidate(candidate('2026-08-23T13:00:00Z', 'Commander night is tomorrow at 7 PM. Sign-ups are open.'), now), true);
assert.equal(isActionableEventCandidate(candidate('2026-08-20T18:39:14Z', 'Are colored pencils provided for the event tomorrow?'), now), false);
assert.equal(isActionableEventCandidate(candidate('2026-08-23T07:43:06Z', "My buddy lost a Generous Gift during Friday night's commander event. Please return it to the store."), now), false);
assert.equal(classifyDiscordFindings({ findingCandidates: [candidate('2026-08-23T07:43:06Z', "My buddy lost a Generous Gift during Friday night's commander event. Please return it to the store.")] }, now).outcome, 'quiet_coverage');
assert.equal(classifyDiscordFindings({ findingCandidates: [candidate('2026-08-23T13:00:00Z', 'Commander night is cancelled tonight due to the power outage.', ['event', 'cancellation_or_change'])] }, now).outcome, 'event_candidate');
assert.equal(classifyDiscordFindings({ findingCandidates: [candidate('2026-08-23T13:00:00Z', 'Anyone want to play Commander tonight?', ['event', 'direct_question_or_request', 'community_or_lfg'])] }, now).outcome, 'event_candidate');

console.log('PASS Discord finding classifier regression tests');
