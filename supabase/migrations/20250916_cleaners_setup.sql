-- 0) Ensure base cleaners table has the columns we need (idempotent)
do $$
begin
  if to_regclass('public.cleaners') is null then
    execute $ct$
      create table public.cleaners (
        id uuid primary key default gen_random_uuid(),
        full_name text not null,
        phone text,
        rating numeric(3,2) default 4.70,
        jobs_count integer default 0,
        is_active boolean not null default true,
        created_at timestamptz not null default now()
      )
    $ct$;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='cleaners' and column_name='full_name')
  then execute 'alter table public.cleaners add column full_name text'; end if;

  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='cleaners' and column_name='phone')
  then execute 'alter table public.cleaners add column phone text'; end if;

  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='cleaners' and column_name='rating')
  then execute 'alter table public.cleaners add column rating numeric(3,2) default 4.70'; end if;

  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='cleaners' and column_name='jobs_count')
  then execute 'alter table public.cleaners add column jobs_count integer default 0'; end if;

  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='cleaners' and column_name='is_active')
  then execute 'alter table public.cleaners add column is_active boolean not null default true'; end if;
end $$;

-- 1) Related tables (areas, services, availability) + unique constraints
create table if not exists public.cleaner_service_areas (
  id bigserial primary key,
  cleaner_id uuid not null references public.cleaners(id) on delete cascade,
  area text not null
);
create unique index if not exists cleaner_service_areas_unique
  on public.cleaner_service_areas (cleaner_id, area);

create table if not exists public.cleaner_services (
  id bigserial primary key,
  cleaner_id uuid not null references public.cleaners(id) on delete cascade,
  service_slug text not null
);
create unique index if not exists cleaner_services_unique
  on public.cleaner_services (cleaner_id, service_slug);

do $$
begin
  if to_regclass('public.cleaner_availability') is null then
    create table public.cleaner_availability (
      id bigserial primary key,
      cleaner_id uuid not null references public.cleaners(id) on delete cascade,
      weekday smallint not null check (weekday between 0 and 6), -- 0=Sun..6=Sat
      start_time time not null,
      end_time   time not null
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class r on r.oid = c.conrelid
    join pg_namespace n on n.oid = c.connamespace
    where n.nspname='public' and r.relname='cleaner_availability' and c.conname='cleaner_availability_unique'
  ) then
    alter table public.cleaner_availability
      add constraint cleaner_availability_unique
      unique (cleaner_id, weekday, start_time, end_time);
  end if;
end $$;

-- 2) RLS read policies (if RLS is on)
alter table public.cleaners                enable row level security;
alter table public.cleaner_service_areas   enable row level security;
alter table public.cleaner_services        enable row level security;
alter table public.cleaner_availability    enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='cleaners' and policyname='public_read_cleaners') then
    create policy public_read_cleaners on public.cleaners for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='cleaner_service_areas' and policyname='public_read_areas') then
    create policy public_read_areas on public.cleaner_service_areas for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='cleaner_services' and policyname='public_read_services') then
    create policy public_read_services on public.cleaner_services for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='cleaner_availability' and policyname='public_read_availability') then
    create policy public_read_availability on public.cleaner_availability for select using (true);
  end if;
end $$;

-- 3) Seed 5 cleaners (UPSERT-safe)
create unique index if not exists cleaners_full_name_key on public.cleaners (full_name);
insert into public.cleaners (full_name, phone, rating, jobs_count, is_active) values
  ('Ayanda M.', '+27 82 000 0001', 4.95, 208, true),
  ('Sarah K.',  '+27 82 000 0002', 4.92, 156, true),
  ('Thabo N.',  '+27 82 000 0003', 4.90, 183, true),
  ('Lisa P.',   '+27 82 000 0004', 4.88, 224, true),
  ('Nomsa D.',  '+27 82 000 0005', 4.86,  97, true)
on conflict (full_name) do update
  set phone=excluded.phone, rating=excluded.rating, jobs_count=excluded.jobs_count, is_active=excluded.is_active;

-- 4) Seed services to every cleaner (adjust slugs if yours differ)
insert into public.cleaner_services (cleaner_id, service_slug)
select c.id, v.s
from public.cleaners c
cross join (values ('standard-cleaning'),('deep-cleaning'),('move-in-out-cleaning')) as v(s)
on conflict (cleaner_id, service_slug) do nothing;

-- 5) Seed areas
with c as (select id, full_name from public.cleaners)
insert into public.cleaner_service_areas (cleaner_id, area) values
  ((select id from c where full_name='Ayanda M.'), 'CBD'),
  ((select id from c where full_name='Ayanda M.'), 'Sea Point'),
  ((select id from c where full_name='Sarah K.'),  'Claremont'),
  ((select id from c where full_name='Sarah K.'),  'Rondebosch'),
  ((select id from c where full_name='Thabo N.'),  'Gardens'),
  ((select id from c where full_name='Thabo N.'),  'CBD'),
  ((select id from c where full_name='Lisa P.'),   'Observatory'),
  ((select id from c where full_name='Lisa P.'),   'Woodstock'),
  ((select id from c where full_name='Nomsa D.'),  'Milnerton')
on conflict (cleaner_id, area) do nothing;

-- 6) Seed availability (Mon–Sat, 08:00–18:00)
with c as (select id from public.cleaners)
insert into public.cleaner_availability (cleaner_id, weekday, start_time, end_time)
select id, d, time '08:00', time '18:00' from c cross join generate_series(1,6) as d
on conflict (cleaner_id, weekday, start_time, end_time) do nothing;

-- 7) Overlap helpers: timestamptz and time overload
create or replace function public.time_ranges_overlap(
  t1_start timestamptz, t1_end timestamptz,
  t2_start timestamptz, t2_end timestamptz
) returns boolean language sql immutable as $$
  select not (t1_end <= t2_start or t1_start >= t2_end);
$$;

create or replace function public.time_ranges_overlap(
  t1_start time, t1_end time,
  t2_start timestamptz, t2_end timestamptz
) returns boolean language sql immutable as $$
  select not (
    ((t2_start::date + t1_end)::timestamptz <= t2_start) or
    ((t2_start::date + t1_start)::timestamptz >= t2_end)
  );
$$;

-- 8) Available cleaners RPC with forgiving area match and enum-safe status compare
create or replace function public.available_cleaners(
  p_area text default null,
  p_service_slug text default null,
  p_start timestamptz default null,
  p_end timestamptz default null,
  p_limit int default 20
) returns table (id uuid, full_name text, rating numeric, area_label text)
language plpgsql stable as $$
begin
  return query
  with base as (
    select c.id, c.full_name, c.rating
    from public.cleaners c
    where c.is_active = true
  ),
  area_ok as (
    select b.* from base b
    where p_area is null
       or exists (
         select 1 from public.cleaner_service_areas a
         where a.cleaner_id = b.id
           and (
             a.area ilike p_area
             or a.area ilike '%' || p_area || '%'
             or p_area ilike '%' || a.area || '%'
           )
       )
  ),
  svc_ok as (
    select a.* from area_ok a
    where p_service_slug is null
       or exists (
         select 1 from public.cleaner_services s
         where s.cleaner_id = a.id and s.service_slug = p_service_slug
       )
  ),
  time_ok as (
    select s.* from svc_ok s
    where p_start is null or p_end is null
       or exists (
         select 1 from public.cleaner_availability ca
         where ca.cleaner_id = s.id
           and ca.weekday = extract(dow from p_start)
           and (p_start::time) >= ca.start_time
           and (p_end::time)   <= ca.end_time
       )
  ),
  not_busy as (
    select t.* from time_ok t
    where p_start is null or p_end is null
       or not exists (
         select 1 from public.bookings b
         where b.cleaner_id = t.id
           and b.status::text in ('pending_assignment','confirmed') -- enum-safe compare
           and public.time_ranges_overlap(b.start_time, b.end_time, p_start, p_end)
       )
  ),
  areas as (
    select csa.cleaner_id, string_agg(csa.area, ', ' order by csa.area) as area_label
    from public.cleaner_service_areas csa group by csa.cleaner_id
  )
  select n.id, n.full_name, n.rating, coalesce(areas.area_label,'Cape Town') as area_label
  from not_busy n
  left join areas on areas.cleaner_id = n.id
  order by n.rating desc, n.full_name
  limit p_limit;

  if not found then
    return query
    select c.id, c.full_name, c.rating, 'Cape Town'::text
    from public.cleaners c
    where c.is_active = true
    order by c.rating desc, c.full_name
    limit greatest(5, p_limit);
  end if;
end
$$;

-- 9) Quick smoke checks (will run on migration; harmless selects)
-- select count(*) as cleaners        from public.cleaners;
-- select count(*) as service_areas   from public.cleaner_service_areas;
-- select count(*) as services        from public.cleaner_services;
-- select count(*) as availability    from public.cleaner_availability;
