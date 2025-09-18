import 'server-only';
import { Service } from "@/lib/database.types";
import { logger } from "@/lib/logger";

export async function getServices(): Promise<Service[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const res = await fetch(`${baseUrl}/api/services`, { cache: "no-store" });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`services failed: ${res.status} ${res.statusText} ${body}`);
    }
    const data = await res.json();
    
    // Return services directly (no categories in PRD schema)
    return data?.services || [];
  } catch (error) {
    logger.error("[getServices] error:", error);
    return [];
  }
}
