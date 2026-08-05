alter table public.event_settings
  add column if not exists event_headline text,
  add column if not exists event_description text,
  add column if not exists couple_photo_url text,
  add column if not exists couple_photo_alt text,
  add column if not exists ultrasound_photo_url text,
  add column if not exists ultrasound_photo_alt text;

update public.event_settings
set
  event_date = '2026-08-22 15:00:00-03',
  event_time = '15h',
  event_headline = coalesce(event_headline, 'Um encontro leve e cheio de afeto'),
  event_description = coalesce(event_description, 'Confira data, horario, local e orientacoes do cha de bebe.'),
  couple_photo_alt = coalesce(couple_photo_alt, 'Foto da familia do Manoel'),
  ultrasound_photo_alt = coalesce(ultrasound_photo_alt, 'Ultrassom do Manoel')
where id = '00000000-0000-0000-0000-000000000001';
