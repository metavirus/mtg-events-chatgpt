# Discord browser safety incident and protocol correction

- Date: 2026-07-20
- Mode: incident note / safety correction
- Trigger: accidental external social-state mutation during a bounded Discord
  survey attempt
- Status: Discord browser surveying paused until a safe direct-navigation method
  is available and preflighted

## What happened

After the direct-channel recovery checkpoint, a bounded Discord survey was
started from the monitoring map. The intended scope was read-only inspection of
mapped Collectors Lounge, Krazy Nick's, and Kingslayer channels.

During navigation, the browser-control path attempted to use keyboard-based
address navigation from an already focused Discord tab. The focus was not
reliably verified. Discord retained focus in or near the message composer, so
the attempted channel URLs / channel references were entered into the live
Discord message box and posted into Krazy Nick's `#commander` from the user's
account.

The user deleted the accidental messages. Codex did not attempt cleanup.

## Why this invalidated the pass

This changed external social state from the user's account. It also risked
exposing the user's activity and project context to a third-party Discord
server. Because the survey was no longer read-only, no research conclusions
should be drawn from that attempted pass.

The incident shows that a live Discord tab cannot be treated like an ordinary
webpage where keyboard navigation is harmless. A social composer is a write
surface.

## Operational rule added

`research/DISCORD_SWEEP_SOP.md` now includes a read-only social-surface safety
protocol:

- no typed or pasted Discord URLs inside an already focused Discord page;
- no keyboard/page-body navigation as a Discord navigation method;
- channel URLs must be opened only by true direct browser navigation or another
  API that cannot submit text into the Discord page body;
- focus must be verified as not being a message composer before inspection;
- if focus or direct navigation cannot be verified, the route is blocked/TBD;
- if Discord asks for an interaction that could write, join, react, upload,
  reply, expose the account, or mutate state, stop and ask.

## Safe path required before future Discord inspection

Before any future Discord browser pass, Codex must be able to explain the exact
safe navigation method it will use. Acceptable methods are limited to direct URL
open/navigation APIs or read-only page inspection APIs that do not synthesize
typing into Discord.

If the available browser-control surface only supports keyboard shortcuts,
typing, or paste into the active Discord context, Discord surveying remains
paused.

## Scope not changed

This note does not downgrade Discord's research value. Discord remains a
high-value community and event-reliability source. The change is only about
access safety: the route may be valuable, but the interaction method must be
mechanically read-only.
