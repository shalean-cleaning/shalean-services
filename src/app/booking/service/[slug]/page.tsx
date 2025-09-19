import { notFound } from 'next/navigation';

import { BookingStepper } from '@/components/booking/booking-stepper';
import { BookingSummary } from '@/components/booking/booking-summary';
import { Region } from '@/lib/database.types';
import { createSupabaseServer } from '@/lib/supabase/server';

interface BookingPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getServiceData(slug: string) {
  try {
    const supabase = await createSupabaseServer();
    
    // Fetch service by slug
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .eq('slug', slug)
      .single();

    if (serviceError || !service) {
      return null;
    }

    // Fetch available extras
    const { data: extras, error: extrasError } = await supabase
      .from('extras')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true });

    if (extrasError) {
      console.error('Error fetching extras:', extrasError);
    }

    // Fetch pricing rules for this service
    const { data: pricingRules, error: pricingError } = await supabase
      .from('service_pricing')
      .select('*')
      .eq('service_id', service.id);

    if (pricingError) {
      console.error('Error fetching pricing rules:', pricingError);
    }

    return {
      service,
      extras: extras || [],
      pricingRules: pricingRules || [],
    };
  } catch (error) {
    console.error('Error fetching service data:', error);
    return null;
  }
}

async function getRegionsData() {
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
    
    return data as Region[];
  } catch (error) {
    console.error('Error fetching regions data:', error);
    return [];
  }
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { slug } = await params;
  const [serviceData, regions] = await Promise.all([
    getServiceData(slug),
    getRegionsData(),
  ]);

  if (!serviceData) {
    notFound();
  }

  const { service, extras } = serviceData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <BookingStepper 
                service={service}
                extras={extras}
                regions={regions}
              />
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <BookingSummary 
                service={service}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: BookingPageProps) {
  const { slug } = await params;
  const serviceData = await getServiceData(slug);
  
  if (!serviceData) {
    return {
      title: 'Service Not Found',
    };
  }

  return {
    title: `Book ${serviceData.service.name} - Shalean Services`,
    description: serviceData.service.description || `Book ${serviceData.service.name} cleaning service`,
  };
}
