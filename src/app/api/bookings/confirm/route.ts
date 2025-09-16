import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const payload = await req.json(); // { bookingId }
    const sb = createSupabaseAdmin();

    const { bookingId } = payload;
    
    if (!bookingId) {
      return NextResponse.json({ ok: false, error: "bookingId is required" }, { status: 400 });
    }

    const { data: b, error: e0 } = await sb
      .from("bookings")
      .select(`
        *,
        services (name),
        suburbs (name)
      `)
      .eq("id", bookingId)
      .single();
      
    if (e0 || !b) {
      console.error("Error fetching booking:", e0);
      return NextResponse.json({ 
        ok: false, 
        error: e0?.message || "Booking not found" 
      }, { status: 404 });
    }

    let assignedCleaner: string | null = b.cleaner_id;

    if (!assignedCleaner && b.auto_assign === true) {
      // Try to auto-assign a cleaner
      const { data: attempt, error: e1 } = await sb.rpc("try_auto_assign", { 
        booking_id: b.id 
      });
      
      if (e1) {
        console.error("auto-assign RPC error", e1);
      }
      
      if (attempt && attempt.length) {
        const row = attempt[0];
        if (row.assigned) {
          assignedCleaner = row.cleaner_id;
        }
      }
    } else if (assignedCleaner) {
      // If user manually picked a cleaner, mark as confirmed
      const { error: updateError } = await sb
        .from("bookings")
        .update({ status: "CONFIRMED" })
        .eq("id", b.id);
        
      if (updateError) {
        console.error("Error updating booking status:", updateError);
      }
    }

    return NextResponse.json({
      ok: true,
      status: assignedCleaner ? "CONFIRMED" : "PENDING",
      cleanerId: assignedCleaner ?? null,
    });
  } catch (error) {
    console.error("Error in confirm booking API:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
