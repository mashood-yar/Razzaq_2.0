-- Fix signup: ensure profiles.gender exists before handle_new_user references it.
-- Symptom: Auth signUp returns "Database error saving new user" when the trigger inserts gender.

alter table public.profiles
  add column if not exists gender text;

alter table public.profiles drop constraint if exists profiles_gender_check;

alter table public.profiles
  add constraint profiles_gender_check
  check (gender is null or gender in ('male', 'female', 'other'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, gender, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'avatar_url',
    case
      when (new.raw_user_meta_data->>'gender') in ('male', 'female', 'other')
      then new.raw_user_meta_data->>'gender'
      else null
    end,
    'customer'
  )
  on conflict (id) do update
    set email      = excluded.email,
        full_name  = coalesce(excluded.full_name, public.profiles.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        gender     = coalesce(excluded.gender, public.profiles.gender),
        role       = case
          when public.profiles.role in ('admin', 'staff') then public.profiles.role
          else coalesce(public.profiles.role, 'customer')
        end,
        updated_at = now();
  return new;
end;
$$;
