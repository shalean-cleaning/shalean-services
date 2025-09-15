-- DIAGNOSTIC QUERIES (run these first to see current state)
-- See duplicates by slug
select slug, count(*) 
from service_categories 
group by slug 
having count(*) > 1;

-- See all categories (quick glance)
select id, name, slug from service_categories order by slug, id;

-- Add slug columns if missing
alter table if exists service_categories add column if not exists slug text;
alter table if exists services           add column if not exists slug text;
alter table if exists extras             add column if not exists slug text;
alter table if exists regions            add column if not exists slug text;
alter table if exists suburbs            add column if not exists slug text;

-- Unique indices for slugs
do $$
begin
  if not exists (select 1 from pg_indexes where indexname='service_categories_slug_key')
    then execute 'create unique index service_categories_slug_key on service_categories (slug)';
  end if;
  if not exists (select 1 from pg_indexes where indexname='services_slug_key')
    then execute 'create unique index services_slug_key on services (slug)';
  end if;
  if not exists (select 1 from pg_indexes where indexname='extras_slug_key')
    then execute 'create unique index extras_slug_key on extras (slug)';
  end if;
  if not exists (select 1 from pg_indexes where indexname='regions_slug_key')
    then execute 'create unique index regions_slug_key on regions (slug)';
  end if;
  if not exists (select 1 from pg_indexes where indexname='suburbs_slug_key')
    then execute 'create unique index suburbs_slug_key on suburbs (slug)';
  end if;
end $$;

-- Normalize existing categories -> set slugs
update service_categories
set slug = lower(regexp_replace(name, '\s+', '-', 'g'))
where (slug is null or slug = '') and name is not null;

-- Resolve slug collisions
with d as (
  select id, slug, row_number() over (partition by slug order by id) rn
  from service_categories
)
update service_categories sc
set slug = sc.slug || '-' || d.rn
from d
where sc.id = d.id and d.rn > 1;

-- HARD delete duplicate "Standard Cleaning" rows, keep oldest
delete from service_categories sc using (
  select id, row_number() over(partition by name order by id) rn
  from service_categories where name = 'Standard Cleaning'
) x
where sc.id = x.id and x.rn > 1;

-- Upsert core categories
insert into service_categories (name, slug, description, icon, sort_order)
values
  ('Standard Cleaning','standard-cleaning','Regular home cleaning services','home',0),
  ('Deep Cleaning','deep-cleaning','Intensive clean incl. hard-to-reach areas','sparkles',1),
  ('Move-In/Out Cleaning','move-in-out','Pre/post move deep clean','truck',2),
  ('Post-Construction','post-construction','Dust & residue removal after builds','construction',3),
  ('Airbnb/Short-Let','airbnb','Turnover cleaning for hosts','apartment',4)
on conflict (slug) do update
  set name=excluded.name,
      description=excluded.description,
      icon=excluded.icon,
      sort_order=excluded.sort_order;

-- Upsert services
with cats as (select id, slug from service_categories)
insert into services (category_id, name, slug, base_price_cents, description)
values
  ((select id from cats where slug='standard-cleaning'),'Standard Cleaning - Small Home','standard-cleaning-small',  80000,'Up to 2 bedrooms, 1 bathroom'),
  ((select id from cats where slug='standard-cleaning'),'Standard Cleaning - Medium Home','standard-cleaning-medium',120000,'3 bedrooms, 2 bathrooms'),
  ((select id from cats where slug='standard-cleaning'),'Standard Cleaning - Large Home','standard-cleaning-large', 160000,'4+ bedrooms, 2+ bathrooms'),

  ((select id from cats where slug='deep-cleaning'),'Deep Cleaning - Apartment','deep-cleaning-apartment',180000,'Full deep clean for apartments'),
  ((select id from cats where slug='deep-cleaning'),'Deep Cleaning - House','deep-cleaning-house',    240000,'Full deep clean for houses'),

  ((select id from cats where slug='move-in-out'),'Move-In/Out - Apartment','move-in-out-apartment',220000,'Pre/post move deep clean (apartment)'),
  ((select id from cats where slug='move-in-out'),'Move-In/Out - House','move-in-out-house',        280000,'Pre/post move deep clean (house)'),

  ((select id from cats where slug='post-construction'),'Post-Construction - Small','post-construction-small',260000,'Dust & residue removal - small'),
  ((select id from cats where slug='post-construction'),'Post-Construction - Large','post-construction-large',320000,'Dust & residue removal - large'),

  ((select id from cats where slug='airbnb'),'Airbnb Turnover','airbnb-turnover',140000,'Between-stay cleaning & reset')
on conflict (slug) do update
  set name=excluded.name,
      category_id=excluded.category_id,
      base_price_cents=excluded.base_price_cents,
      description=excluded.description;

-- Upsert extras
insert into extras (name, slug, price_cents, description)
values
  ('Inside Fridge','inside-fridge',20000,'Clean and sanitize fridge interior'),
  ('Inside Oven','inside-oven',25000,'Clean oven interior'),
  ('Interior Windows','interior-windows',30000,'Clean reachable interior windows'),
  ('Cabinets (Inside)','cabinets-inside',30000,'Empty & wipe inside cabinets'),
  ('Laundry & Ironing','laundry-ironing',20000,'Wash, dry, fold, iron (limited load)')
on conflict (slug) do update
  set name=excluded.name,
      price_cents=excluded.price_cents,
      description=excluded.description;

-- Upsert regions & suburbs
insert into regions (name, slug) values
  ('Cape Town CBD','cape-town-cbd'),
  ('Atlantic Seaboard','atlantic-seaboard'),
  ('Southern Suburbs','southern-suburbs'),
  ('Northern Suburbs','northern-suburbs')
on conflict (slug) do update set name=excluded.name;

with regs as (select id, slug from regions)
insert into suburbs (region_id, name, slug) values
  ((select id from regs where slug='cape-town-cbd'),    'City Centre',  'city-centre'),
  ((select id from regs where slug='atlantic-seaboard'),'Sea Point',    'sea-point'),
  ((select id from regs where slug='atlantic-seaboard'),'Green Point',  'green-point'),
  ((select id from regs where slug='southern-suburbs'), 'Claremont',    'claremont'),
  ((select id from regs where slug='southern-suburbs'), 'Rondebosch',   'rondebosch'),
  ((select id from regs where slug='northern-suburbs'), 'Bellville',    'bellville'),
  ((select id from regs where slug='northern-suburbs'), 'Durbanville',  'durbanville')
on conflict (slug) do update
  set name=excluded.name,
      region_id=excluded.region_id;

-- Enable RLS & public read policies for anonymous access
alter table service_categories enable row level security;
alter table services           enable row level security;
alter table extras             enable row level security;
alter table regions            enable row level security;
alter table suburbs            enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='service_categories' and policyname='Public read') then
    execute 'create policy "Public read" on service_categories for select using (true)';
  end if;
  if not exists (select 1 from pg_policies where tablename='services' and policyname='Public read') then
    execute 'create policy "Public read" on services for select using (true)';
  end if;
  if not exists (select 1 from pg_policies where tablename='extras' and policyname='Public read') then
    execute 'create policy "Public read" on extras for select using (true)';
  end if;
  if not exists (select 1 from pg_policies where tablename='regions' and policyname='Public read') then
    execute 'create policy "Public read" on regions for select using (true)';
  end if;
  if not exists (select 1 from pg_policies where tablename='suburbs' and policyname='Public read') then
    execute 'create policy "Public read" on suburbs for select using (true)';
  end if;
end $$;
