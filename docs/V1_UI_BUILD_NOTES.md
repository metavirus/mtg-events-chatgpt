# V1 UI Build Notes

Last updated: 2026-07-15

## Structural direction now implemented

- `Today` is the landing destination and the calendar surface, not a separate
  dashboard competing with Calendar.
- The default view is a chronological upcoming timeline from today forward.
- Week and month are alternate views of the same calendar state.
- A persistent/collapsible Highlights layer surfaces fresh signals, promising
  nearby places, and research cautions.
- Brief explanation belongs in chips and popovers; rich investigation belongs
  in a right-side drawer so the calendar position is preserved.
- Places and Communities are distinct destinations and entity types.
- Discovery-level records remain visible with explicit status and coverage
  language instead of being hidden or presented as fully researched.
- Competitive Commander remains in the complete Events catalog but is removed
  from the default Today surface when competitive deprioritization is active.

## Implemented first-pass capabilities

- Upcoming, week, and month calendar modes
- Friday-Sunday quick focus
- Best-fit and special-event presets
- Distance, confidence, research-status, cost, and competitive filters
- Event detail drawers with analyst interpretation, source trail, before-you-go
  fields, directions, and Google Calendar action
- Place master-detail surface with assessment bars, event series, sources,
  directions, rating, favorite, and notes
- Separate lightly seeded Communities surface
- New & Changed timeline
- Research coverage dashboard that plainly discloses the Commander-heavy seed
- Favorites, ratings, interested state, notes, and activity-log interaction
- Desktop rail, mobile bottom navigation, and responsive layout

## Deliberate temporary boundary

Personal state currently uses a small browser-backed adapter so interaction can
be evaluated immediately. It is explicitly not the final cross-device storage
solution. The v1 structure assumes this adapter will be replaced by the private
hosted persistence layer without changing the interaction model.

Community cards are lightly seeded from established project context. They are
structural examples and remain labeled partial/discovery until community data is
normalized into its own evidence-backed file.

## Next build pass

- Review the visible design with the user and tune information density, labels,
  and hierarchy without changing the settled architecture.
- Add explicit occurrence/series presentation data rather than deriving every
  recurring occurrence directly from the legacy seed schema.
- Connect private cross-device persistence before treating notes and favorites
  as durable hosted state.
- Prepare the validated private hosted deployment after the first design review.
