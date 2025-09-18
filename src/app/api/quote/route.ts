import 'server-only';
import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { env } from "@/env.server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createSupabaseAdmin();
      await supabase.from("quotes").insert({
        name: body.name ?? null,
        email: body.email ?? null,
        phone: body.phone ?? null,
        location: body.location ?? null,
        service: body.service ?? null,
        date: body.date ?? null,
        notes: body.notes ?? null,
        source: "website",
      });
    } else {
      // Fallback: log only (no failure UX)
      console.log("[quote:fallback]", body);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    // Still return OK to avoid breaking the page; errors are logged for dev
    return NextResponse.json({ ok: true });
  }
}
