-- Scent profile quiz results on customer profiles
alter table public.profiles
  add column if not exists scent_profile jsonb;

comment on column public.profiles.scent_profile is
  'Scent quiz: label, answers, recommended product slugs and snapshot metadata';
