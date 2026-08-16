# Logo Sourcing SOP

This document governs logo/avatar work for Places and Communities.

The goal is not "any image." The goal is a clean, intentional avatar that reads
well at small sizes in the app's existing dark UI.

## Source ladder

Use the first workable source in this order:

1. official square avatar or organizer/profile image
2. official icon/favicons/app icons from the official site
3. official wordmark or crest that can be cleanly isolated
4. high-quality official/social/event organizer image supplied by the user
5. intentional generated fallback badge from the entity name

Do not prefer a nominally "official" source if it performs worse at avatar size
 than a cleaner official organizer/social square image.

## Required rules

- Preserve a separate source asset whenever we use an external image.
- Save the app-ready avatar as `assets/logos/<id>-icon.png`.
- Never overwrite the only source image with a processed icon.
- Verify both the standalone icon and the in-app rendering before considering
  the pass done.

## Composition rules

- The avatar must fill the rounded container cleanly.
- There must be no pasted inner tile, square, card, or chip shape inside the
  rounded avatar border.
- If the source has a uniform or near-uniform background, either:
  - remove it and place the mark on the app avatar background, or
  - extend that source background to the avatar edge so it fills the frame.
- Do not leave weird edge vestiges from circular text, posters, banners, or
  scenic backgrounds.
- Prefer the emblem/crest/mascot over tiny wordmark text when the full text
  becomes unreadable at avatar size.
- For transparent or isolated marks, use the app's dark avatar surface rather
  than forcing a black square behind the mark.

## Things to reject

- a rectangular screenshot pasted inside the rounded avatar
- a white or black card floating inside the avatar
- partial letters or circular text vestiges at the edges
- scenic/background art that is more dominant than the actual brand mark
- tiny text-first crops that only look correct when zoomed in

## Fallback policy

When no good source is available, create a deliberate full-bleed badge avatar
from the entity name instead of using raw initials.

Fallback badges should:

- use the full avatar area
- keep strong contrast at small sizes
- use one or two meaningful name fragments, not arbitrary initials when a
  better shorthand exists
- remain visually consistent with the app's existing Places/Communities surfaces

The current helper is `scripts/generate_logo_fallbacks.py`.

## Verification loop

Before closing a logo pass:

1. inspect the processed icon directly
2. inspect a proof sheet of the current icon set
3. inspect the real app rendering for the touched entities
4. only then commit and push

If a result still reads like a tile, poster crop, or damaged mark, reject it
and try another source or a better fallback.
