import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function GET() {
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let dbOk = false; let dbErr: string | null = null;
  try {
    if (url && anon) {
      const supabase = createSupabaseServer();
      const { error } = await supabase.from('service_categories').select('id').limit(1);
      if (!error) dbOk = true; else dbErr = error.message;
    }
  } catch (e: any) { dbErr = e?.message ?? 'unknown'; }

  const envReady = Boolean(base && url && anon) && dbOk;
  return NextResponse.json({ ok: true, ts: Date.now(), envReady, dbOk, dbErr, base });
}