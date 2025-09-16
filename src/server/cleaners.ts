import { createSupabaseAdmin } from "@/lib/supabase/server";

type CleanerData = {
  id: string;
  full_name: string | null;
  rating: number | null;
  area_label?: string | null;
};

export async function fetchAvailableCleaners(opts: {
  area?: string | null;
  serviceSlug?: string | null;
  startISO?: string | null;
  endISO?: string | null;
  limit?: number;
}): Promise<CleanerData[]> {
  const sb = createSupabaseAdmin();
  const { area=null, serviceSlug=null, startISO=null, endISO=null, limit=20 } = opts;

  const { data, error } = await sb.rpc("available_cleaners", {
    p_area: area,
    p_service_slug: serviceSlug,
    p_start: startISO,
    p_end: endISO,
    p_limit: limit,
  });

  if (error) {
    console.error("[available_cleaners RPC]", error);
    const { data: fallback } = await sb
      .from("cleaners").select("id, full_name, rating")
      .eq("is_active", true)
      .order("rating", { ascending: false })
      .limit(5);
    return fallback ?? [];
  }
  return data ?? [];
}
