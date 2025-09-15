-- 0.1) bookings: add auto_assign + status (text status for flexibility)
alter table if exists public.bookings
  add column if not exists auto_assign boolean not null default false,
  add column if not exists status text not null default 'draft';  -- draft|pending_assignment|confirmed|cancelled

-- 0.2) Update existing cleaners table to add phone field if not exists
alter table if exists public.cleaners
  add column if not exists phone text,
  add column if not exists jobs_count integer default 0;

-- 0.3) Create cleaner_service_areas table for many-to-many cleaners ↔ suburbs/areas
-- This extends the existing cleaner_locations table with area names
create table if not exists public.cleaner_service_areas (
  id bigserial primary key,
  cleaner_id uuid not null references public.cleaners(id) on delete cascade,
  area text not null
);

-- 0.4) Create cleaner_services table for which services a cleaner can do
create table if not exists public.cleaner_services (
  id bigserial primary key,
  cleaner_id uuid not null references public.cleaners(id) on delete cascade,
  service_slug text not null  -- e.g. 'standard-cleaning','deep-cleaning','move-in-out-cleaning'
);

-- 0.5) Update availability_slots table to add weekday field if not exists
alter table if exists public.availability_slots
  add column if not exists weekday smallint check (weekday between 0 and 6); -- 0=Sun

-- 0.6) helper: detect overlap
create or replace function public.time_ranges_overlap(t1_start timestamptz, t1_end timestamptz, t2_start timestamptz, t2_end timestamptz)
returns boolean language sql immutable as $$
  select not (t1_end <= t2_start or t1_start >= t2_end);
$$;

-- 0.7) RPC: find best cleaner for a booking (updated for existing schema)
create or replace function public.find_best_cleaner(p_area text, p_service_slug text, p_start timestamptz, p_end timestamptz)
returns uuid
language plpgsql as $$
declare
  v_best uuid;
begin
  -- Choose active cleaners who cover the area + service and are available on the weekday/time
  with base as (
    select c.id
    from public.cleaners c
    join public.cleaner_service_areas a on a.cleaner_id = c.id and a.area = p_area
    join public.cleaner_services s on s.cleaner_id = c.id and s.service_slug = p_service_slug
    where c.is_available = true
  ),
  avail as (
    select b.id
    from base b
    join public.availability_slots ca on ca.cleaner_id = b.id
    where ca.day_of_week = extract(dow from p_start)
      and to_char(p_start::time, 'HH24:MI') >= to_char(ca.start_time, 'HH24:MI')
      and to_char(p_end::time,   'HH24:MI') <= to_char(ca.end_time,   'HH24:MI')
      and ca.is_active = true
  ),
  not_busy as (
    -- cleaner has no overlapping confirmed bookings
    select a.id
    from avail a
    where not exists (
      select 1 from public.bookings b
      where b.cleaner_id = a.id
        and b.status in ('pending_assignment','confirmed','CONFIRMED','IN_PROGRESS')
        and public.time_ranges_overlap(
          (b.booking_date + b.start_time)::timestamptz, 
          (b.booking_date + b.end_time)::timestamptz, 
          p_start, 
          p_end
        )
    )
  )
  select c.id into v_best
  from public.cleaners c
  where c.id in (select id from not_busy)
  order by c.rating desc, c.jobs_count asc, c.created_at asc
  limit 1;

  return v_best;
end
$$;

-- 0.8) RPC: assign a cleaner to an existing booking if possible (updated for existing schema)
create or replace function public.try_auto_assign(booking_id uuid)
returns table (assigned boolean, cleaner_id uuid)
language plpgsql as $$
declare
  v_area text;
  v_slug text;
  v_start timestamptz;
  v_end timestamptz;
  v_found uuid;
begin
  -- Get booking details - need to map to existing schema
  select 
    s.name,  -- service name as area for now
    s.name,  -- service name as slug for now
    (b.booking_date + b.start_time)::timestamptz,
    (b.booking_date + b.end_time)::timestamptz
    into v_area, v_slug, v_start, v_end
  from public.bookings b
  join public.services s on s.id = b.service_id
  where b.id = booking_id;

  if v_area is null or v_slug is null or v_start is null or v_end is null then
    return query select false, null::uuid;
    return;
  end if;

  v_found := public.find_best_cleaner(v_area, v_slug, v_start, v_end);

  if v_found is not null then
    update public.bookings
      set cleaner_id = v_found,
          status = 'confirmed'
      where id = booking_id;
    return query select true, v_found;
  else
    update public.bookings
      set status = 'pending_assignment'
      where id = booking_id;
    return query select false, null::uuid;
  end if;
end
$$;

-- 0.9) RLS (basic read for public, write restricted — adjust to your model)
alter table public.cleaner_service_areas enable row level security;
alter table public.cleaner_services enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='cleaner_service_areas' and policyname='public_read_areas') then
    create policy public_read_areas on public.cleaner_service_areas for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='cleaner_services' and policyname='public_read_services') then
    create policy public_read_services on public.cleaner_services for select using (true);
  end if;
end $$;

-- 0.10) Seed sample cleaners (Cape Town areas) - using existing schema
-- First, create profiles for the cleaners
insert into public.profiles (id, email, first_name, last_name, phone, role) values
  (gen_random_uuid(), 'ayanda@shalean.com', 'Ayanda', 'M.', '+27 82 000 0001', 'CLEANER'),
  (gen_random_uuid(), 'sarah@shalean.com', 'Sarah', 'K.', '+27 82 000 0002', 'CLEANER'),
  (gen_random_uuid(), 'thabo@shalean.com', 'Thabo', 'N.', '+27 82 000 0003', 'CLEANER'),
  (gen_random_uuid(), 'lisa@shalean.com', 'Lisa', 'P.', '+27 82 000 0004', 'CLEANER'),
  (gen_random_uuid(), 'nomsa@shalean.com', 'Nomsa', 'D.', '+27 82 000 0005', 'CLEANER')
on conflict (email) do nothing;

-- Then create cleaner records
insert into public.cleaners (profile_id, bio, experience_years, rating, total_ratings, phone, jobs_count)
select 
  p.id,
  'Professional cleaner with ' || (floor(random() * 5) + 3) || ' years experience',
  floor(random() * 5) + 3,
  (4.5 + random() * 0.5)::numeric(3,2),
  floor(random() * 200) + 50,
  p.phone,
  floor(random() * 200) + 50
from public.profiles p
where p.role = 'CLEANER' and p.email like '%@shalean.com'
on conflict do nothing;

-- Map services (using service names as slugs for now)
insert into public.cleaner_services (cleaner_id, service_slug)
select c.id, s.name
from public.cleaners c
cross join (select name from public.services limit 3) as svc(s)
on conflict do nothing;

-- Map service areas (using suburb names)
with c as (select c.id, p.first_name, p.last_name from public.cleaners c join public.profiles p on p.id = c.profile_id)
insert into public.cleaner_service_areas (cleaner_id, area) values
  ((select id from c where first_name='Ayanda'), 'Sea Point'),
  ((select id from c where first_name='Ayanda'), 'CBD'),
  ((select id from c where first_name='Sarah'),  'Claremont'),
  ((select id from c where first_name='Sarah'),  'Rondebosch'),
  ((select id from c where first_name='Thabo'),  'CBD'),
  ((select id from c where first_name='Thabo'),  'Gardens'),
  ((select id from c where first_name='Lisa'),   'Observatory'),
  ((select id from c where first_name='Lisa'),   'Woodstock'),
  ((select id from c where first_name='Nomsa'),  'Milnerton')
on conflict do nothing;

-- Availability windows (Mon–Sat, 08:00–18:00) - using existing availability_slots table
with c as (select id from public.cleaners)
insert into public.availability_slots (cleaner_id, day_of_week, start_time, end_time, weekday)
select id, d, time '08:00', time '18:00', d
from c cross join generate_series(1,6) as d
on conflict do nothing;
