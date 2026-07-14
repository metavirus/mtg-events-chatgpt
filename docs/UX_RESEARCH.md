# UX/UI Research Direction

This design brief translates current UX guidance and the preserved interface
artifacts into a concrete direction for the Southern California Commander
Intelligence app.

## Recommended visual concept

Build a **visual research instrument**, not a generic business dashboard.

Combine:

- the functional light interface's evidence-first calendar and store-detail structure;
- the MTG Event Atlas prototype's dark navy shell, violet accents, navigation rail,
  quick filters, KPI summaries, and colorful status panels;
- modern cards, borders, chips, icons, timelines, and contextual drawers;
- progressive disclosure so the first screen remains legible while almost every
  meaningful element supports a deeper investigation.

The result should feel rich, modern, slightly game-adjacent, and highly usable
without imitating card art or allowing decoration to compete with evidence.

## Visual system

### Palette

Use a dark ink/navy foundation with layered blue-gray surfaces rather than pure
black. Violet is the primary interactive accent. Use semantic colors consistently:

- mint/green: strong personal fit, verified, healthy source;
- sky/cyan: informational, registration, navigation;
- amber/gold: new, prerelease, needs attention, medium confidence;
- coral/red: conflict, cancellation, broken source, explicit poor fit;
- magenta: special event or unusual discovery;
- muted slate: historical, inactive, unknown, low-priority context.

Every colored state also needs a text label, icon, border treatment, or pattern;
color alone cannot carry meaning.

### Surfaces and borders

- Use three surface levels: page background, primary panels, and raised/interactive cards.
- Prefer crisp 1px borders plus restrained shadows over floating shadow-heavy cards.
- Use a stronger left border or top accent to communicate the card's primary state.
- Reserve glows and gradients for the most important moments: a prerelease alert,
  selected navigation item, or top recommendation.
- Use 10–14px corner radii consistently; avoid making every control pill-shaped.

### Typography and density

- Use a highly legible sans-serif with a clear type ladder and tabular numerals for dates/fees.
- Keep scan-level metadata compact, but never force core descriptions into tiny text.
- Use whitespace to group related evidence rather than spreading every component far apart.
- Allow user-selectable comfortable and compact density later; start with comfortable-dense.

## Information architecture

Desktop primary navigation should use a persistent left rail:

1. Home
2. Calendar
3. Events
4. Stores
5. New & Changed
6. Research

Secondary utilities belong at the bottom: personal notes, data freshness, settings,
and source health.

On mobile, use a bottom bar for the four most-used destinations and a More drawer
for research/settings. Do not reproduce the entire desktop rail as tiny icons.

## Home dashboard

The home page answers “What should I consider doing?” rather than merely showing totals.

Recommended order:

1. **Friday–Sunday focus:** large visual strip of the upcoming weekend.
2. **New for two weeks:** prereleases, new events, schedule changes, and newly found stores.
3. **Best fits:** ranked event cards with an explicit “Why this fits” explanation.
4. **Worth a look:** interesting draft, sealed, distant, or ambiguous opportunities.
5. **Research alerts:** broken links, conflicts, stale high-priority sources, and open questions.
6. **Personal continuity:** recent visits, rating changes, and stores worth revisiting.

KPI cards should be clickable and represent useful sets, such as “5 new events,”
not decorative totals. Clicking filters or drills into the records behind the number.

## Calendar design

- The default application page is the calendar in a chronological scrolling agenda
  from today forward. Group events by date and continue toward future dates as the
  user scrolls. Use sticky date/week landmarks so orientation is never lost.
- Keep agenda, week, and month views; default to the scrolling agenda rather than
  forcing dense month cells to carry all event detail.
- Add a prominent Friday–Sunday focus within the conventional week.
- In month view, show concise event markers and use a day popover/drawer for overflow.
- In agenda/week views, event cards show time, title, store, miles, format, likely fit,
  fee, confidence, and critical unknowns.
- Use event color primarily for format/family and a separate border/icon/text treatment
  for confidence or status. Do not overload one color with several meanings.
- Keep confirmed occurrences visually distinct from recurring availability.
- Every event is keyboard-focusable and opens a deep-linkable detail drawer/page.

### Calendar shell and information pane

On wide screens, the agenda/week/month calendar occupies the primary center pane.
A persistent but collapsible right rail shows high-value context:

- new events and materially changed events;
- upcoming prereleases and notable special events;
- best-fit opportunities this weekend;
- conflicts, cancellations, and urgent verification warnings;
- recently updated stores or sources.

The right rail must not become a second competing feed. Keep it concise, ranked,
and clickable. On narrower screens, move it above the calendar as a collapsible
Highlights panel or open it from a visible badge/button.

### Compact calendar titles

Store both the exact source title and a generated concise display title. Never
overwrite source wording merely to fit the calendar.

Display titles should use recognizable, scan-friendly language such as:

- `Casual Commander`
- `Optimized Commander`
- `Commander — Bracket 3`
- `FNM Commander`
- `Draft — [Set]`
- `Prerelease — [Set]`
- `Sealed — [Set]`
- `Commander Party — [Set]`

Month view may use the concise title plus time or store abbreviation. Agenda and
detail views can show richer metadata. The full store-authored title and description
remain available in the event drawer/detail page.

## Primary store pane

Stores are the second primary application destination. Desktop should support a
master-detail layout: a searchable/filterable store list on the left and the
selected store detail on the right. Mobile uses a store list followed by a full
detail page.

Store detail includes:

- identity, address, map/directions, distance, contact, and current source health;
- why it is ranked where it is and the evidence behind that rank;
- recurring event series, upcoming occurrences, specials, and historical events;
- communication channels and pre-visit guidance;
- personal star rating, note history, and visit log;
- open research questions, conflicts, and source timeline.

Clicking a store name anywhere in the calendar opens this store context without
losing the selected calendar date/filter state.

## Event series, occurrences, and personal notes

Model a recurring event series separately from dated occurrences:

- **Series:** stable identity, normal schedule, store, format, bracket/power signals,
  ordinary fee/rules, recurrence evidence, active/inactive state, and source history.
- **Occurrence:** a specific date/time with registration, capacity, fee/rule overrides,
  cancellation state, special theme/set, and occurrence-specific evidence.
- **One-off:** an occurrence with no recurring parent series.
- **Special occurrence:** a dated member or exception of a normal series, such as a
  Commander Party replacing an ordinary Commander night.

The app must not generate falsely precise future occurrences from weak recurrence
evidence. Inferred schedule availability may appear as provisional and visually
distinct from a source-confirmed dated occurrence.

When a sufficiently reliable source explicitly indicates recurrence but does not
publish dated occurrences, generate a rolling eight-week set of projected
occurrences. Mark every projection `Expected from recurring schedule`, link it to
the recurrence evidence, and keep it visually distinct from a confirmed dated
listing. A later source-confirmed occurrence replaces or confirms the projection;
cancellations and exceptions override it without rewriting the series history.

Private personal notes can attach to:

- the store overall;
- the recurring series (for example, the regular crowd is consistently too competitive);
- one occurrence/visit (for example, one particular night had only Bracket 4 decks).

When entering a note from an occurrence, ask whether it applies to this occurrence
only or to the whole series. Preserve dated note history and let later experience
revise the analytical fit without erasing earlier observations.

## Quality-of-life interaction layer

### Favorites and following

Use a heart icon for a simple, reversible favorite/follow action:

- favorite a store;
- favorite a recurring event series;
- filter to favorites;
- surface upcoming favorite occurrences on Home and Calendar;
- prioritize new or changed information from favorites in Highlights;
- show a small count of unseen changes affecting favorites.

Favoriting is not the same as rating. A heart means “keep this easy to find and
tell me when it changes.” The one-to-five stars record personal experience and fit.
Use Add to Calendar or an `Interested` state for a single occurrence rather than
overloading the heart.

### Personal event states

Allow lightweight private states on an occurrence:

- Interested
- Added to calendar
- Attended
- Skipped

These states support planning and visit history without making the user complete a
form. After an attended event, offer a short optional prompt for rating/note entry.

### Quick actions

Event cards should expose a restrained action menu:

- Add to Google Calendar
- Directions
- Register / open event source
- Favorite series
- Mark interested
- Add note

Store cards/details should provide Favorite, Directions, Open primary channel,
Add note, and Compare. Keep the whole card clickable for detail while ensuring
individual actions have separate accessible targets.

### Persistent personal context

- Remember the last calendar view, date, filters, density, and scroll position.
- Preserve state when moving between an event and its store.
- Provide Recently viewed and an easy way back to the prior calendar context.
- Make personal actions optimistic and reversible with Undo feedback.
- Keep saved filters optional; offer useful presets such as Weekend, Best Fits,
  Favorites, Prereleases, Needs Verification, and All Events.

### Before-you-go card

For an event happening soon, generate a compact preparation card containing:

- confirmed versus projected status;
- last verification time and source;
- address and directions;
- start time, fee, registration, and capacity;
- bracket/power and proxy expectations;
- pod formation or solo-arrival information;
- recommended deck range;
- unresolved questions worth checking before departure.

If a high-impact field is stale or conflicting, show a `Verify before leaving`
warning with the best current source link.

### Compare and explain

Allow two or three stores or events to be added to a temporary comparison tray.
Use aligned rows for miles, next opportunity, bracket fit, solo accessibility,
schedule reliability, evidence confidence, proxy policy, and personal rating.

Every recommendation, rank, fit badge, or confidence indicator should have a
clickable `Why?` explanation showing inputs, evidence, unknowns, and analytical
reasoning.

### Non-destructive control

Allow the user to mute or deprioritize a store/series without deleting it. Muted
records remain in All Events and research history. Favoriting, muting, rating, and
personal notes are private overlays and never alter the underlying evidence.

### Background activity log

Add a quiet `Log` link in the footer or bottom utility area. The log is not a
primary navigation destination and should not compete with Calendar, Stores, or
Highlights. It exists for traceability when the user wants to understand what
happened or undo/reconstruct a decision.

Keep three log streams conceptually separate and filterable:

1. **My activity:** favorited/unfavorited store or series, rating changed, note
   added/edited, event marked interested/attended/skipped, calendar action used,
   store/series muted or restored.
2. **Research changes:** event/store discovered, source added or failed, schedule
   changed, record reclassified, confidence changed, projection confirmed or
   invalidated, duplicate reconciled.
3. **System runs:** collector started/completed/failed, records processed, source
   access errors, validation result, and publication/generation result.

Use concise human-readable entries with timestamp, icon, action, entity link, and
optional before/after summary. Clicking an entity opens its detail; clicking a
research/system entry can reveal technical evidence only when requested.

Avoid excessive volume:

- do not log ordinary page views, scrolling, hover, filter toggles, or drawer opens;
- combine repetitive collector details into one run summary with an expandable body;
- combine bulk changes when they share one operation;
- retain detailed diagnostics in run artifacts while keeping the UI entry short;
- provide filters for My activity / Research / System plus search and date range.

Personal-log entries are private. Note text should not be duplicated into the log;
record that a note changed and link to its version history. Preserve append-only
history where practical and use compensating entries for undo rather than silently
removing the original action.

## Store and event cards

Use a consistent three-layer pattern:

1. **Glance:** name, date/time, location, miles, format, best-fit label, and top warning.
2. **Context drawer:** richer description, why it fits, ambiguity, registration,
   sources, map, and quick actions without losing the list/calendar context.
3. **Full detail:** complete evidence, source timeline, normalized facts, analytical
   interpretation, rating history, visits, and research questions.

Cards should expose a clear primary click target while keeping distinct actions such
as Add to Calendar, Directions, Register, and Open Source separately labeled.

## Tabs, filters, and disclosure

- Use tabs only for a small set of parallel sections that users switch between
  frequently, such as Overview / Events / Evidence on a store page.
- Keep tab labels short, place the most-used section first, store selection in the
  URL, and avoid tabs when users need side-by-side comparison.
- Use accordions/details for secondary explanations, raw descriptions, and long
  source histories—not for essential current facts.
- Show primary filters visibly on desktop. Put less-common filters in a More Filters
  panel; show all active filters as removable chips.
- Use explicit Apply and Clear controls for complex filter sets, with live result counts.
- Default filter logic across categories should narrow results (AND); multiple values
  inside a category may broaden that category (OR).

## Visual explanations

For a visual learner, prefer small repeated visual structures over walls of prose:

- labeled score bars for the seven store-assessment dimensions;
- source timelines with platform icons and freshness states;
- bracket ladder showing explicit, inferred, and preferred ranges;
- compact evidence-confidence meters with text labels;
- a map preview popover and directions action;
- before/after change blocks;
- rating-history timeline;
- icons for format, pairing model, proxies, fee, prizes, and solo-arrival support.

Avoid radar charts for primary comparison because exact values and evidence confidence
are harder to compare. Use aligned bars or compact comparison rows instead.

## Interaction requirements

- Anything styled as interactive must work; anything clickable needs hover, focus,
  and pressed states.
- Preserve browser back behavior and deep links for tabs, drawers, filters, stores,
  events, and selected dates.
- Drawers/popovers must close with Escape, trap focus when modal, restore focus to the
  trigger, and never obscure the focused control.
- Do not require dragging; provide click/tap alternatives.
- Prefer 44x44 CSS-pixel touch targets where practical and never fall below WCAG's
  24x24 minimum without sufficient spacing or an equivalent target.
- Use a strong two-color focus ring that remains visible across varied card colors.
- Respect reduced-motion settings and keep motion short and purposeful.

## Mobile strategy

Mobile is a lookup and action surface, not a reduced replica of the desktop research lab.

- Prioritize weekend events, Best Fits, search, filters, directions, calendar export,
  and personal notes.
- Convert wide comparison panels to stacked cards or horizontally scrollable summaries
  with explicit controls; do not shrink desktop tables until unreadable.
- Use bottom sheets for event/store context when they preserve orientation.
- Keep complete evidence accessible on full detail pages.

## Sources consulted

- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- W3C WCAG 2.2 techniques: https://www.w3.org/WAI/WCAG22/Techniques/
- GOV.UK tabs guidance: https://design-system.service.gov.uk/components/tabs/
- DWP filter research: https://design-system.dwp.gov.uk/contribute/filters/summary
- Android adaptive navigation guidance: https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns
- FullCalendar display and accessibility documentation: https://fullcalendar.io/docs
