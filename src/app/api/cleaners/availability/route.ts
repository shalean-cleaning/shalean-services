import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseClient } from "@/lib/supabase";

const bodySchema = z.object({
  regionId: z.string().min(1),
  suburbId: z.string().min(1),
  date: z.string().min(1),      // ISO date string
  timeSlot: z.string().min(1),  // "10:00"
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const { suburbId, date, timeSlot } = bodySchema.parse(json);

    const sb = supabaseClient;

    // 1) Get cleaners who cover the region/suburb
    // Using cleaner_locations table to find cleaners serving this suburb
    const { data: suburbMatches, error: sErr } = await sb
      .from("cleaner_locations")
      .select("cleaner_id")
      .eq("suburb_id", suburbId);
    if (sErr) throw sErr;

    const candidateIds = suburbMatches?.map(s => s.cleaner_id) ?? [];
    if (candidateIds.length === 0) {
      return NextResponse.json({ cleaners: [] }, { status: 200 });
    }

    // 2) Exclude cleaners already booked at that date/time
    const { data: busy, error: bErr } = await sb
      .from("bookings")
      .select("cleaner_id")
      .eq("booking_date", date)
      .eq("start_time", timeSlot)
      .in("status", ["CONFIRMED", "IN_PROGRESS"]);
    if (bErr) throw bErr;

    const busyIds = new Set((busy ?? []).map(b => b.cleaner_id));
    const availableIds = candidateIds.filter(id => !busyIds.has(id));
    if (availableIds.length === 0) {
      return NextResponse.json({ cleaners: [] }, { status: 200 });
    }

    // 3) Fetch cleaner profiles with profile information
    const { data: cleaners, error: cErr } = await sb
      .from("cleaners")
      .select(`
        id,
        rating,
        total_ratings,
        experience_years,
        bio,
        profiles!inner (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .in("id", availableIds)
      .eq("is_available", true);
    if (cErr) throw cErr;

    // Transform the data to match the expected format
    const transformedCleaners = (cleaners ?? []).map(cleaner => {
      const profile = Array.isArray(cleaner.profiles) ? cleaner.profiles[0] : cleaner.profiles;
      return {
        id: cleaner.id,
        name: profile ? `${profile.first_name} ${profile.last_name}` : 'Cleaner',
        rating: cleaner.rating || 0,
        totalRatings: cleaner.total_ratings || 0,
        experienceYears: cleaner.experience_years || 0,
        bio: cleaner.bio,
        avatarUrl: profile?.avatar_url,
        eta: "15-30 min", // Default ETA
        badges: ["Verified", "Insured"], // Default badges
      };
    });

    return NextResponse.json({ cleaners: transformedCleaners }, { status: 200 });
  } catch (err: any) {
    console.error("[availability] error:", err?.message || err);
    const msg = err?.message || "Unknown error";
    return NextResponse.json({ error: "Availability lookup failed", details: msg }, { status: 400 });
  }
}
