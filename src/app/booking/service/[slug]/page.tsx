import { notFound } from 'next/navigation';

import { BookingStepper } from '@/components/booking/booking-stepper';
import { BookingSummary } from '@/components/booking/booking-summary';
import { Service, Extra, PricingRule, Region } from '@/lib/database.types';

interface BookingPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getServiceData(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const response = await fetch(`${baseUrl}/api/services/${slug}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data as {
      service: Service;
      extras: Extra[];
      pricingRules: PricingRule[];
    };
  } catch (error) {
    console.error('Error fetching service data:', error);
    return null;
  }
}

async function getRegionsData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const response = await fetch(`${baseUrl}/api/regions`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
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
