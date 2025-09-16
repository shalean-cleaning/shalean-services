import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchAvailableCleaners } from "@/server/cleaners";

type CleanerData = {
  id: string;
  full_name: string | null;
  rating: number | null;
  area_label?: string | null;
};

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
    const { suburbId: _suburbId, date, timeSlot } = bodySchema.parse(json);

    // Convert date and time to ISO timestamps for the RPC
    const startISO = new Date(`${date}T${timeSlot}:00`).toISOString();
    const endISO = new Date(`${date}T${timeSlot}:00`).toISOString();
    
    // For now, use a default area - you can enhance this to map suburbId to area names
    const area = "CBD"; // This should be mapped from suburbId to actual area names

    // Use the new RPC function
    const cleaners: CleanerData[] = await fetchAvailableCleaners({
      area,
      serviceSlug: "standard-cleaning", // Default service - can be enhanced
      startISO,
      endISO,
      limit: 20
    });

    // Transform the data to match the expected format
    const transformedCleaners = cleaners.map((cleaner) => ({
      id: cleaner.id,
      name: cleaner.full_name,
      rating: cleaner.rating || 0,
      totalRatings: 50, // Default value
      experienceYears: 3, // Default value
      bio: `Professional cleaner with ${cleaner.rating} star rating`,
      avatarUrl: null,
      eta: "15-30 min", // Default ETA
      badges: ["Verified", "Insured"], // Default badges
      areaLabel: cleaner.area_label || "Cape Town"
    }));

    return NextResponse.json({ cleaners: transformedCleaners }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[availability] error:", errorMessage);
    const msg = errorMessage;
    return NextResponse.json({ error: "Availability lookup failed", details: msg }, { status: 400 });
  }
}
