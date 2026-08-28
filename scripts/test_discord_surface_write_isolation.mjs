import assert from 'node:assert/strict';
import {
  buildSurfaceCheckStatement,
  deriveOverallOutcome,
  writeSurfaceChecks
} from './run_discord_daily_survey.mjs';

function result(entityId, rowId, lastSeenMessageId) {
  return {
    entityType: 'venue',
    entityId,
    rowId,
    profileSourceId: `source-${entityId}`,
    channelSourceId: null,
    channelName: '#events',
    serverName: entityId,
    outcome: 'quiet_coverage',
    usefulCategories: [],
    materialFindingCandidates: [],
    messageWindow: {
      lastSeenMessageId,
      lastSeenMessageAt: '2026-08-28T00:00:00.000Z'
    }
  };
}

const inputs = [
  result('venue-one', 'row-one', 'message-one'),
  result('venue-two', 'row-two', 'message-two'),
  result('venue-three', 'row-three', 'message-three')
];
const attempted = [];
const writeResult = await writeSurfaceChecks(inputs, async (sql, item) => {
  attempted.push(item.entityId);
  if (item.entityId === 'venue-two') throw new Error('simulated terminal-row rejection');
  return [{ surface_check_result: `written-${item.entityId}` }];
});

assert.deepEqual(attempted, ['venue-one', 'venue-two', 'venue-three']);
assert.equal(writeResult.status, 'partial_success');
assert.equal(writeResult.attempted, 3);
assert.equal(writeResult.succeeded, 2);
assert.equal(writeResult.failed, 1);
assert.deepEqual(writeResult.entities.map((item) => item.entityId), ['venue-one', 'venue-three']);
assert.equal(writeResult.failures[0].entityId, 'venue-two');
assert.match(writeResult.failures[0].error, /simulated terminal-row rejection/);

const recurringSql = buildSurfaceCheckStatement(inputs[0]);
assert.match(recurringSql, /'daily'/);
assert.match(recurringSql, /0::smallint/);
assert.equal(
  deriveOverallOutcome({
    surfaceCheckWrite: writeResult,
    watchlistWrite: { status: 'success' }
  }),
  'partial_success'
);
assert.equal(
  deriveOverallOutcome({
    surfaceCheckWrite: { status: 'failed' },
    watchlistWrite: { status: 'success' }
  }),
  'failed'
);

console.log('Discord surface-write isolation tests passed.');
