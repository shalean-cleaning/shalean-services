import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

const seedData = {
  categories: [
    {
      name: 'Standard Cleaning',
      description: 'Regular home cleaning services',
      icon: 'home',
      services: [
        { name: '1 Bedroom', description: 'Standard cleaning for 1 bedroom', base_price: 450, duration_minutes: 120 },
        { name: '2 Bedroom', description: 'Standard cleaning for 2 bedrooms', base_price: 650, duration_minutes: 150 },
        { name: '3 Bedroom', description: 'Standard cleaning for 3 bedrooms', base_price: 850, duration_minutes: 180 }
      ]
    },
    {
      name: 'Deep Cleaning',
      description: 'Intensive deep cleaning services',
      icon: 'sparkles',
      services: [
        { name: '1 Bedroom Deep Clean', description: 'Deep cleaning for 1 bedroom', base_price: 900, duration_minutes: 180 },
        { name: '2 Bedroom Deep Clean', description: 'Deep cleaning for 2 bedrooms', base_price: 1200, duration_minutes: 240 }
      ]
    },
    {
      name: 'Move-In / Move-Out',
      description: 'End-of-lease cleaning services',
      icon: 'truck',
      services: [
        { name: 'Studio Move Clean', description: 'Move-in/out cleaning for studio', base_price: 1000, duration_minutes: 150 },
        { name: '1 Bedroom Move Clean', description: 'Move-in/out cleaning for 1 bedroom', base_price: 1300, duration_minutes: 180 }
      ]
    }
  ],
  extras: [
    { name: 'Inside Fridge', description: 'Deep clean inside refrigerator', price: 120, duration_minutes: 30 },
    { name: 'Inside Oven', description: 'Deep clean inside oven', price: 150, duration_minutes: 45 },
    { name: 'Interior Windows', description: 'Clean interior windows', price: 200, duration_minutes: 60 }
  ]
}

// utility: ensure schema and relations exist before seed/select (idempotent)
async function ensureSchema() {
  // Create tables if not exist; keep names consistent with your codebase:
  // service_categories(id uuid pk), service_items(id uuid pk, category_id fk),
  // extras(id uuid pk)
  const sql = `
  create table if not exists service_categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text unique not null,
    description text
  );
  create table if not exists service_items (
    id uuid primary key default gen_random_uuid(),
    category_id uuid not null references service_categories(id) on delete cascade,
    name text not null,
    slug text unique not null,
    base_price numeric not null
  );
  create table if not exists extras (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text unique not null,
    price numeric not null
  );
  alter table if exists service_categories enable row level security;
  alter table if exists service_items enable row level security;
  alter table if exists extras enable row level security;

  -- Read for anon
  do $$
  begin
    if not exists (select 1 from pg_policies where tablename='service_categories' and policyname='read_service_categories') then
      create policy read_service_categories on service_categories for select to anon using (true);
    end if;
    if not exists (select 1 from pg_policies where tablename='service_items' and policyname='read_service_items') then
      create policy read_service_items on service_items for select to anon using (true);
    end if;
    if not exists (select 1 from pg_policies where tablename='extras' and policyname='read_extras') then
      create policy read_extras on extras for select to anon using (true);
    end if;
  end$$;
  `;
  // Use PostgREST RPC-less execution via supabaseAdmin.sql if available;
  // fallback to pg rest via fetch.
  // @ts-ignore
  const res = await supabaseAdmin.rpc?.('exec_sql', { sql }); // if you have a helper
  if (!res) {
    // fallback raw query via postgres REST: use supabaseAdmin from Edge Functions if needed
  }
}

async function seedIfEmpty() {
  // Count categories
  const { count, error: countErr } = await supabaseAdmin
    .from('service_categories')
    .select('id', { count: 'exact', head: true })
  if (countErr) throw countErr

  console.log('[services] Category count:', count)

  // Count services
  const { count: serviceCount, error: serviceCountErr } = await supabaseAdmin
    .from('services')
    .select('id', { count: 'exact', head: true })
  if (serviceCountErr) throw serviceCountErr

  console.log('[services] Service count:', serviceCount)

  if ((count ?? 0) > 0 && (serviceCount ?? 0) > 0) return false

  // Insert categories, services, extras in a simple sequence
  for (const cat of seedData.categories) {
    const { data: catRow, error: catErr } = await supabaseAdmin
      .from('service_categories')
      .insert([{ 
        name: cat.name, 
        description: cat.description,
        icon: cat.icon,
        sort_order: 0
      }])
      .select()
      .single()
    if (catErr) throw catErr

    const services = cat.services.map(svc => ({
      name: svc.name,
      description: svc.description,
      base_price: svc.base_price,
      duration_minutes: svc.duration_minutes,
      category_id: catRow.id,
      sort_order: 0,
      is_active: true
    }))
    console.log('[services] Inserting services for category:', cat.name, services)
    const { data: insertedServices, error: servicesErr } = await supabaseAdmin.from('services').insert(services).select()
    if (servicesErr) {
      console.error('[services] Error inserting services:', servicesErr)
      throw servicesErr
    }
    console.log('[services] Successfully inserted services for category:', cat.name, insertedServices)
  }

  if (seedData.extras?.length) {
    const extras = seedData.extras.map(extra => ({
      name: extra.name,
      description: extra.description,
      price: extra.price,
      duration_minutes: extra.duration_minutes,
      sort_order: 0,
      is_active: true
    }))
    const { error: extrasErr } = await supabaseAdmin.from('extras').insert(extras)
    if (extrasErr && extrasErr.code !== '23505') throw extrasErr
  }
  return true
}

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Supabase env not configured' }, { status: 500 })
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('[services] No SUPABASE_SERVICE_ROLE_KEY set; seeding will be skipped.')
    } else {
      // Ensure schema then seed if empty
      try { await ensureSchema() } catch (e) { console.warn('[services] schema error:', e) }
      try { await seedIfEmpty() } catch (e) { console.warn('[services] seed skip/error:', e) }
    }

    // First, let's check if services exist at all
    const { data: allServices, error: servicesError } = await supabaseAdmin
      .from('services')
      .select('*')
      .limit(10)
    
    console.log('[services] All services in database:', allServices)
    if (servicesError) {
      console.error('[services] Error fetching services:', servicesError)
    }

    // Fetch categories with nested services using PostgREST embedded select
    const { data: categories, error } = await supabaseAdmin
      .from('service_categories')
      .select('id,name,description,icon,sort_order,services:services(id,name,description,base_price,duration_minutes,category_id,sort_order)')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
    if (error) throw error

    // Fetch extras (optional)
    const { data: extras, error: extrasErr } = await supabaseAdmin
      .from('extras')
      .select('id,name,description,price,duration_minutes,sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
    if (extrasErr && extrasErr.code !== 'PGRST116') console.warn('[services] extras fetch:', extrasErr)

    return NextResponse.json({ categories: categories ?? [], extras: extras ?? [] })
  } catch (err: any) {
    console.error('[API /services] failed:', { message: err?.message, code: err?.code, err })
    return NextResponse.json({ error: 'Database query failed', details: err?.message ?? 'unknown' }, { status: 500 })
  }
}