import { Clock, DollarSign, Home } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Mock services data for demonstration
const mockServices = [
  {
    id: '1',
    name: 'Standard House Cleaning',
    slug: 'standard-house-cleaning',
    description: 'Complete cleaning of all living areas including kitchen, bathrooms, bedrooms, and common areas',
    base_price: 120.00,
    duration_minutes: 120,
  },
  {
    id: '2',
    name: 'Apartment Cleaning',
    slug: 'apartment-cleaning',
    description: 'Thorough cleaning of apartment units including all rooms and appliances',
    base_price: 100.00,
    duration_minutes: 90,
  },
  {
    id: '3',
    name: 'Move-in/Move-out Cleaning',
    slug: 'move-in-move-out-cleaning',
    description: 'Comprehensive cleaning for new tenants or departing residents',
    base_price: 200.00,
    duration_minutes: 180,
  },
  {
    id: '4',
    name: 'Post-Construction Cleaning',
    slug: 'post-construction-cleaning',
    description: 'Specialized cleaning after construction or renovation work',
    base_price: 250.00,
    duration_minutes: 240,
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Cleaning Services
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional cleaning services tailored to your needs. Choose from our range of services and book online.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {mockServices.map((service) => (
            <Card key={service.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Home className="w-8 h-8 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    {service.name}
                  </h3>
                </div>
              </div>

              <p className="text-gray-600 mb-6">{service.description}</p>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration_minutes} minutes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-lg font-semibold text-green-600">
                      ${service.base_price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <Link href={`/booking/service/${service.slug}`}>
                <Button className="w-full">
                  Book This Service
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Don&apos;t see what you&apos;re looking for? We offer custom cleaning solutions.
          </p>
          <Button variant="outline">
            Contact Us for Custom Quote
          </Button>
        </div>
      </div>
    </div>
  );
}