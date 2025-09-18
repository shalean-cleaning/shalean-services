import { createClient } from "@supabase/supabase-js";

import { envClient } from "@/env.client";
import { Database } from "./database.types";

export const supabaseClient = createClient<Database>(
  envClient.NEXT_PUBLIC_SUPABASE_URL,
  envClient.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


