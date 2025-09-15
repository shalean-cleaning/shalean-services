import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json(); // { bookingId, cleanerId|null, autoAssign:boolean }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server only
    const sb = createClient(url, key);

    const { bookingId, cleanerId, autoAssign } = body;
    
    if (!bookingId) {
      return NextResponse.json({ ok: false, error: "bookingId is required" }, { status: 400 });
    }

    const updates: any = { auto_assign: !!autoAssign };
    if (cleanerId) updates.cleaner_id = cleanerId;
    if (!cleanerId && autoAssign) updates.cleaner_id = null;

    const { error } = await sb.from("bookings").update(updates).eq("id", bookingId);
    if (error) {
      console.error("Error updating booking:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in select-cleaner API:", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
