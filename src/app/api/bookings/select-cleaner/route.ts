import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs"; // required for service-role on Vercel

type Payload = {
  bookingId: string;
  cleanerId?: string | null;
  autoAssign?: boolean;
};

function reply(error: string | null, data?: any, status = 200) {
  return NextResponse.json(
    error ? { ok: false, error } : { ok: true, ...data },
    { status: error ? status : 200 }
  );
}

export async function POST(req: Request) {
  try {
    const { bookingId, cleanerId = null, autoAssign = false } = (await req.json()) as Payload;
    if (!bookingId) return reply("Missing bookingId", null, 400);

    const sb = createSupabaseAdmin();

    // 1) Ensure booking exists
    const { data: booking, error: findErr } = await sb
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();
    if (findErr || !booking) return reply(`Booking not found for id=${bookingId}`, null, 404);

    // 2) Try multiple shapes to cover schema variants (cleaner_id vs cleaner, with/without auto_assign)
    const attempts: Array<Record<string, any>> = [
      { auto_assign: !!autoAssign, cleaner_id: cleanerId },
      { auto_assign: !!autoAssign, cleaner: cleanerId },
      { cleaner_id: cleanerId },
      { cleaner: cleanerId },
    ];

    let lastErr: any = null;
    for (const updates of attempts) {
      const { error } = await sb.from("bookings").update(updates).eq("id", bookingId);
      if (!error) return reply(null, { applied: updates });
      lastErr = error;
      const msg = (error?.message || "").toLowerCase();
      // Only keep trying if it's a "column does not exist" error
      if (!(msg.includes("column") && msg.includes("does not exist"))) break;
    }

    return reply(`Failed to update booking: ${lastErr?.message || "Unknown error"}`, null, 500);
  } catch (e: any) {
    console.error("[select-cleaner] fatal", e);
    return reply(e?.message || "Unexpected server error", null, 500);
  }
}