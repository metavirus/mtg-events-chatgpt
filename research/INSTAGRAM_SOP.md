# Instagram SOP

This is the mandatory operating procedure for using Instagram in this project.

The main goal is to stop wasting time on noisy profile browsing and to extract
the exact kinds of signals Instagram is unusually good at.

## Core principle

Instagram is not a general browsing surface here.

Use it for a few specific jobs:

- weekly schedule graphics
- specials and prereleases
- cancellations / reminders / same-day notices
- current MTG prominence
- source routing such as Linktree / Discord / website references
- quick visual scale/activity clues when obvious

If Instagram is not helping with one of those jobs, stop.

When login state is needed, treat it as a platform capability to establish once,
not a reason to keep retrying from a blank browser. Use the ignored local
profile created by `scripts/setup_social_auth_profile.ps1` and run a bounded
probe before any post-level inspection:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup_social_auth_profile.ps1 -Platform instagram -ProfileUrl https://www.instagram.com/example/
```

The helper opens a dedicated local browser profile under `work/social-auth/`,
lets the user complete login or checkpoints once, and records only a small
manifest. It also saves an ignored `storage-state.json` beside the profile as
a belt-and-suspenders restore point for cookies/local storage when a later
Playwright persistent-context launch does not carry a session cookie forward.
It must not post, like, follow, message, scrape broadly, or commit session
state. A `public_readable_auth_unclear` result means the surface can be used
for a bounded public-read check, but it does not prove a durable logged-in
session. For Instagram, the helper should report
`durabilityStatus: durable_session_likely` after a close/reopen probe before
treating the profile as durably authenticated. If the profile still reports
`login_required`,
`challenge_or_checkpoint`, or `blocked_or_unreadable` after one repair attempt,
record that exact surface state and stop.

After auth is healthy, use the bounded surface probe before post-level ingest:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/probe_social_surface.ps1 -Platform instagram -ProfileUrl https://www.instagram.com/example/
```

The probe restores the ignored `storage-state.json`, writes an ignored preview
under `work/social-probes/`, and refreshes the storage-state file after a
successful check. It should be used only to decide whether a small recent
visible slice contains candidate MTG posts, graphics, schedule notices,
cancellations, or source-routing changes. Do not promote profile chrome such
as Instagram's own `Log In` / `Sign Up` text into operational event evidence.

## Pass types

### 1. Strict first pass

Goal: determine whether Instagram is operationally useful for the place.

Do only this:

1. confirm official profile
2. read bio
3. inspect a very small recent sample
4. capture one or two high-value findings
5. classify source role

Stop once the profile's usefulness is clear.

### 2. Promoted Instagram deepening

Goal: use Instagram as a meaningful event/corroboration source for a promising
place.

Allowed:

- deeper recent post scan
- special-event extraction
- weekly lineup corroboration
- stronger routing capture
- quick image-based play-space or turnout clues if obvious

Do not do this unless the place has been promoted.

For promoted passes, Instagram is not only a profile-classification surface.
It is also an event-seeking surface. Explicitly look for:

- upcoming prerelease / sealed / draft / Commander special posts
- weekly schedule graphics with MTG lanes
- corrections or reminders that materially change event interpretation

## First-pass workflow

### Step 1: confirm the profile

Confirm whether the profile is:

- official branch profile
- official multi-location brand profile
- likely unofficial / fan / stale

Record branch-vs-brand ambiguity immediately. Do not silently treat a brand
profile as branch-specific truth.

### Step 2: read the bio

Check for:

- MTG mention
- Commander / TCG emphasis
- location or branch list
- Discord / Linktree / website routing
- event / weekly schedule language

Bio often answers source-routing questions faster than posts do.

### Step 3: inspect only a bounded recent sample

Use a small sample, enough to answer:

- does the profile actively promote events?
- is Magic prominent, secondary, or rare?
- does it post routine weekly schedules?
- does it mostly do branding/product hype instead of operational updates?

Do not keep scrolling once these are clear.

## What to extract

Extract only the highest-value fields:

- event name
- event date if visible
- start time if visible
- format
- fee if visible
- special branded wording
- cancellation / correction wording
- whether the post is a weekly lineup, one-off special, prerelease, or generic promo

For first pass, one or two strong examples are enough.

## Classification outcomes

After the bounded pass, classify the profile as one of:

- **primary operational surface**  
  Instagram is actively used for weekly schedules, specials, or corrections.

- **secondary corroboration surface**  
  Instagram is real and useful but not the main event source.

- **branding-heavy / low operational value**  
  Instagram mostly shows products, vibes, or generic promotion with little usable event data.

- **routing-only surface**  
  Instagram matters mostly because it leads to Discord, Linktree, website, etc.

## Daily/weekly monitoring rules

### Daily light sweep

Use Instagram daily only for:

- favorites
- top promising venues
- places where Instagram is already classified as a primary operational surface

Daily sweep should look only for:

- new event graphics
- cancellation / correction posts
- prerelease or special-event announcements
- clearly new MTG programming

### Weekly sweep

Weekly sweep may:

- refresh recent post sample
- confirm whether routine schedule pattern still holds
- catch newly visible routing changes

## Anti-rabbit-hole rules

- Do not deep-scroll reels.
- Do not inspect comments unless they visibly contain operational information.
- Do not chase story-only content as a normal requirement.
- Do not spend a pass trying to perfectly decode every visual post.
- If the visible sample is mostly non-MTG, record that and move on.

## Signs Instagram should be promoted

Promote Instagram into the primary monitoring set when:

- it regularly posts weekly Magic lineups
- it is clearly where specials/prereleases are announced first
- it consistently adds event detail not present on Wizards or the website
- it materially corrects or clarifies weaker sources

## Required self-check

Before leaving Instagram, ask:

- Did I determine whether this profile is branch-specific or brand-level?
- Did I decide whether Instagram is primary, secondary, branding-heavy, or routing-only?
- Did I explicitly check whether recent posts contain any high-interest MTG
  events that should be normalized or used to correct weaker sources?
- Did I stop once that answer was clear?

If yes, the pass is complete.
