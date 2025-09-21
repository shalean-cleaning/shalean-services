import { notFound } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';
import { BookingStepper } from '@/components/booking/booking-stepper';

interface LocationPageProps {
  params: {
    serviceSlug: string;
  };
}

export default async function LocationBookingPage({ params }: LocationPageProps) {
  const { serviceSlug } = params;
  
  const supabase = await createSupabaseServer();

  // Fetch service by slug
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .eq('slug', serviceSlug)
    .eq('active', true)
    .single();

  if (serviceError || !service) {
    notFound();
  }

  // Fetch extras
  const { data: extras } = await supabase
    .from('extras')
    .select('*')
    .eq('active', true)
    .order('name');

  // Fetch regions
  const { data: regions } = await supabase
    .from('regions')
    .select('*')
    .eq('active', true)
    .order('name');

  return (
    <div className="min-h-screen bg-gray-50">
      <BookingStepper 
        service={service}
        extras={extras || []}
        regions={regions || []}
      />
    </div>
  );
}
