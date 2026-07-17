# Research run: review-source evidence backfill

Date checked: 2026-07-17

Scope:

- The Game Cellar
- Next-Gen Games
- It's GameTime!
- The Crimson Guild - South El Monte
- Turn Zero Games
- CoreTCG
- Comic Quest

Boundary:

- Evidence/provenance backfill only.
- No event records.
- No grade, score, or assessment-note changes.
- No canonical JSON edits.
- Review and mirror sources are used for store-quality, fit, confidence, and
  caution support, not primary event truth.

## Why this pass exists

Recent assessment passes correctly used review-derived signals to inform store
fit, confidence, positives, cautions, and open questions. However, several of
those sources were preserved only in run notes or proposal reasoning rather
than as clickable Evidence on the Places page.

That is not good enough for the product. If a Yelp-derived or Google-derived
source materially influences how a store is assessed, the user should be able
to open that source from the store's Evidence tab.

## Backfill decisions

### The Game Cellar

Add Yahoo Local as Yelp-derived review evidence.

Why:

- supports welcoming/community signal;
- includes Magic/newcomer references;
- preserves the operating-hours reliability caution.

Do not treat this as event proof.

### Next-Gen Games

Add Yahoo Local and Roadtrippers as review/mirror evidence.

Why:

- supports strong Magic presence, open rooms/play space, staff/community, and
  review-scale signal;
- preserves recent service/pricing complaint texture.

Do not use the review mirrors to infer additional event records.

### It's GameTime!

Add Yahoo Local as Yelp-derived review evidence.

Why:

- supports stocked CCG activity and helpful staff signals;
- preserves limited play-space and customer-experience cautions.

Do not treat Friday Night Magic as Commander without separate format evidence.

### The Crimson Guild

Keep the existing Yahoo Local evidence and add Apple Maps as an additional
Yelp-derived mirror.

Why:

- Apple Maps currently exposes a very direct review-derived Commander Friday
  signal and strong space/staff/pricing signals.
- This strengthens the Places-page evidence trail while leaving official event
  facts tied to Wizards/EventLink.

Do not use it to change address or branch identity.

### Turn Zero Games

Add Roadtrippers and Loc8NearMe as review/mirror evidence.

Why:

- supports active TCG/Magic footprint, free play-space, welcoming/community, and
  staff/new-player signals;
- supports the assessment that Turn Zero is a real Magic hub whose remaining
  question is Commander-specific solo fit.

### CoreTCG

Add MapQuest and BBB review/complaint evidence.

Why:

- MapQuest preserves Yelp-derived broad store/review signal for the physical
  Pasadena storefront.
- BBB preserves a separate caution source around commerce/service complaints.

Do not treat either as proof of Commander community quality.

### Comic Quest

Add Roadtrippers and Loc8NearMe as review/mirror evidence.

Why:

- supports broad store quality, helpful staff, physical place, and community
  texture;
- complements the already-attached official homepage/calendar evidence.

The prior locals-only caution remains preserved in assessment reasoning, but
the strongest currently attached review evidence in this light pass is general
store-quality support rather than a direct source for that exact caution.

## Proposed write/no-write decision

Prepare and apply a lean controlled Supabase proposal for source/evidence
backfill only:

1. Insert missing review/mirror sources.
2. Attach each source to the relevant venue through `entity_sources`.
3. Add one research-change marker.
4. Do not touch events, evaluations, grades, venue assessments, schema, auth, or
   canonical JSON.

