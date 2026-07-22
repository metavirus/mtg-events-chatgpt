import assert from 'node:assert/strict';

import { classifyDiscordBlockedRequest } from './discord_readonly_guard.mjs';

const cases = [
  ['POST', 'https://discord.com/api/v9/channels/123/messages/456/ack', 'blocked_expected_ack'],
  ['POST', 'https://discord.com/api/v9/channels/123/messages', 'message_reply_or_edit_mutation'],
  ['PUT', 'https://discord.com/api/v9/channels/123/messages/456/reactions/x/@me', 'reaction_mutation'],
  ['POST', 'https://discord.com/api/v9/attachments', 'upload_mutation'],
  ['PUT', 'https://discord.com/api/v9/guilds/123/members/@me?lurker=true', 'membership_or_lurker'],
  ['POST', 'https://discord.com/api/v9/invites/abc', 'invite_mutation'],
  ['PATCH', 'https://discord.com/api/v9/guilds/123/roles/456', 'role_mutation'],
  ['PATCH', 'https://discord.com/api/v9/users/@me/settings', 'settings_mutation'],
  ['PATCH', 'https://discord.com/api/v9/users/@me/settings-proto/2', 'settings_mutation'],
  ['POST', 'https://discord.com/api/v9/science', 'telemetry']
];

for (const [method, url, expected] of cases) {
  assert.equal(classifyDiscordBlockedRequest({ method, url }).classification, expected, `${method} ${url}`);
}

const ack = classifyDiscordBlockedRequest({
  method: 'POST',
  url: 'https://discord.com/api/v9/channels/928555906017398785/messages/1511055000611066007/ack'
});
assert.deepEqual(ack, {
  classification: 'blocked_expected_ack',
  normalizedEndpoint: '/api/v*/channels/{channel_id}/messages/{message_id}/ack',
  channelId: '928555906017398785',
  messageId: '1511055000611066007'
});

console.log(`Discord blocked-request classification passed: ${cases.length} categories`);
