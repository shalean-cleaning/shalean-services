import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  startISO: z.string().min(1),
  endISO: z.string().min(1),
  suburbId: z.string().optional(),
  regionId: z.string().optional(),
  bookingId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { startISO, endISO, suburbId, regionId, bookingId } = bodySchema.parse(json);

    // For now, return a stubbed response as requested
    // TODO: Replace with real Supabase query logic
    // Using the validated parameters in the response for now
    console.log('Request parameters:', { startISO, endISO, suburbId, regionId, bookingId });
    
    return NextResponse.json({ availableCleaners: [] }, { status: 200 });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[cleaners/availability] error:", errorMessage);
    
    return NextResponse.json({ 
      error: "Invalid request", 
      details: errorMessage 
    }, { status: 400 });
  }
}
