import { createSupabaseServer } from "@/lib/supabase/server";

export async function TeamStats() {
  const supabase = await createSupabaseServer();
  
  // Fetch dynamic stats from database
  let stats = [
    { number: '500+', label: 'Professional Cleaners', color: 'text-blue-600' },
    { number: '50+', label: 'Support Staff', color: 'text-green-600' },
    { number: '5+', label: 'Years Experience', color: 'text-purple-600' },
    { number: '10,000+', label: 'Happy Customers', color: 'text-orange-600' }
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
        label: stat.label,
        color: stat.color || 'text-gray-600'
      }));
    }
  } catch (error) {
    console.warn('Company stats table not available:', error);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className={`text-3xl font-bold ${stat.color} mb-2`}>
            {stat.number}
          </div>
          <div className="text-gray-600">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
