import { createSupabaseServer } from "@/lib/supabase/server";

export async function getRegions() {
  try {
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching regions:', error);
      return [];
    }
    
    return data ?? [];
  } catch (error) {
    console.error('Error in getRegions:', error);
    return [];
  }
}

export async function getSuburbs() {
  try {
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from('suburbs')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching suburbs:', error);
      return [];
    }
    
    return data ?? [];
  } catch (error) {
    console.error('Error in getSuburbs:', error);
    return [];
  }
}
