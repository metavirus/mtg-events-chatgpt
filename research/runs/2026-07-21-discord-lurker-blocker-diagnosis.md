# Discord membership/lurker blocker diagnosis

- Date: 2026-07-21
- Pass type: safety/access diagnosis only
- Discord message content inspected: no
- Discord research performed: no
- External Discord state changed by Codex: no
- Signals, events, sources, or Places records created: no

## Question

Determine whether Discord's attempted
`PUT /api/v9/guilds/{guild_id}/members/@me?lurker=true` request is merely a
one-time isolated-profile setup problem, a server-specific gate, or a common
client hydration behavior that would require a separate safety decision.

The request remained blocked throughout. No allowlist was added.

## Evidence

The guarded content/shell work has now observed the same request on five exact
mapped server/channel routes:

| Server | Shell identity proven | Request observed | Important context |
| --- | --- | --- | --- |
| Paper Hero's Games | Yes | Yes | First post-login content pilot; request appeared before content extraction. |
| JJ's Collectibles | Yes, twice | Yes, twice | The user had already joined this Discord. The approved close-and-reopen retry did not clear the request. |
| Magic & Monsters | Yes, twice | Yes, twice | The approved retry did not clear the request. |
| Collectors Lounge Cypress | Yes, twice | Yes, twice | The user manually opened this exact channel in the isolated profile; a later direct-URL guarded run still attempted the request. |
| Krazy Nick's Games | Yes | Yes | Shell-only diagnostic; this account previously had enough access to post in the server during the safety incident. |

For the Krazy Nick's diagnostic specifically:

- the dedicated isolated profile opened an authenticated Discord shell;
- the final guild/channel IDs exactly matched the mapped route;
- the title identified the expected server and `#commander` channel;
- the channel-navigation shell and an exact channel link were present;
- the read-only guard heartbeat was active;
- no editable element had focus;
- no mutating control remained enabled;
- the membership/lurker request was blocked before any message inspection.

The diagnostic recorder retained only target-membership endpoint metadata. It
did not inspect response bodies, session credentials, tokens, message endpoints,
or message content.

## What this establishes

The blocker is not limited to one server, one broken channel URL, a logged-out
profile, or a shell that has never been opened manually. Merely opening a
channel once does not make later guarded direct navigation stop attempting the
request.

The evidence also makes a simple "the account has not joined these servers"
explanation unlikely: JJ's was already joined by the user, and the same account
previously had posting access in Krazy Nick's. The route shells are authenticated
and identify the expected channels.

However, this pass cannot prove whether the undocumented web-client request is:

- a preview/lurker membership refresh;
- ordinary lazy hydration of a server/channel shell;
- or another client-side membership-state synchronization step.

Discord's public developer documentation distinguishes current-user guild
membership and membership-screening state, but it does not document this exact
web-client `lurker=true` endpoint contract. A `PUT` to the current user's guild
member resource remains state-changing-looking and is not demonstrably read-only.

## Decision

Classification: **blocked/TBD**.

Do not allowlist the request. Do not repeat generic "open the channel once"
setup, because that has already failed to change later behavior. Do not interpret
this as evidence that Discord surveying is impossible; it means the current
zero-mutation browser path cannot yet cross Discord's membership/hydration step.

Accepted boundary `5e055e8`: browser-driven Discord content-read is now
blocked/TBD for near-term work. Do not spend more implementation time trying to
route around `members/@me?lurker=true` under the current browser-driven
approach. Carry forward the route/channel map, route priorities, expected signal
types, isolated profile concept, read-only guard/harness, blocker diagnosis, and
the rule that quiet/blocked runs do not reduce long-term route value.

Near-term Discord input should be limited to user-supplied screenshots/pastes or
user-opened visible-content analysis. A future Discord lane may still pursue a
genuinely non-mutating capture path or obtain stronger independent evidence
about this exact endpoint before proposing an allowlist. If a later allowlist is
ever proposed, it must be separately approved, limited to the exact expected
guild/current-user/lurker request, logged, reversible, and tested first without
message extraction.

## Result against tranche acceptance

- No message content read: pass.
- No Discord external state changed by Codex: pass.
- No join, role, reaction, settings, or composer interaction: pass.
- Blocker classified across multiple servers: pass.
- Clear recommendation: keep content-read blocked/TBD; no allowlist yet.
