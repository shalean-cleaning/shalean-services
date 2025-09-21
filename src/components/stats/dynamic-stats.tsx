import { createSupabaseServer } from "@/lib/supabase/server";

export async function DynamicStats() {
  const supabase = await createSupabaseServer();
  
  // Default stats fallback
  let stats = [
    { number: '1000+', label: 'Happy Customers' },
    { number: '5.0', label: 'Average Rating' },
    { number: '50+', label: 'Professional Cleaners' },
    { number: '99%', label: 'Customer Satisfaction' }
  ];

  try {
    // Try to fetch actual stats from database
    const { data: statsData, error: statsError } = await supabase
      .from('company_stats')
      .select('stat_type, value, label, color')
      .eq('is_active', true)
      .order('sort_order');

    if (!statsError && statsData && statsData.length > 0) {
      stats = statsData.map((stat: any) => ({
        number: stat.value,
        label: stat.label
      }));
    }
  } catch (error) {
    console.warn('Company stats table not available:', error);
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {stat.number}
          </div>
          <div className="text-gray-600 font-medium">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
