-- Original Instagram graphic visually re-read September 6, 2026:
-- NEW WEEKEND HOURS / 12PM-10PM / EFFECTIVE 8/29 / *PERMANENT CHANGE.
-- Caption: New Permanent Store Hours For The Weekend.
-- https://www.instagram.com/collectors.lounge/p/Dcoh9lcvaXH/
begin;
update public.signals
set proposed_change = proposed_change || jsonb_build_object(
      'extraction', 'visually_verified',
      'note', 'Original official Instagram graphic visually verified September 6, 2026: permanent Saturday and Sunday hours 12 PM–10 PM, effective August 29. Other days unchanged.'),
    details = 'Original graphic: NEW WEEKEND HOURS / 12PM-10PM / EFFECTIVE 8/29 / PERMANENT CHANGE. Caption confirms permanent weekend store hours. Direct visual reread resolved duplicated Instagram image-description text.',
    summary = 'Collectors Lounge - Cypress: weekend hours updated to 12 PM–10 PM.'
where id = 'social:instagram:src-social-collectors-instagram-2026-07-14:operational:acc39461a41f';
select public.promote_venue_hours_signal('social:instagram:src-social-collectors-instagram-2026-07-14:operational:acc39461a41f');
commit;
