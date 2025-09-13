'use client';

import { Card } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

import { Service, PricingRule } from '@/lib/database.types';
import { useBookingStore } from '@/lib/stores/booking-store';

interface ServiceSelectionStepProps {
  service: Service;
  pricingRules: PricingRule[];
}

export function ServiceSelectionStep({ service, pricingRules: _pricingRules }: ServiceSelectionStepProps) {
  const { selectedService, setSelectedService } = useBookingStore();

  const isSelected = selectedService?.id === service.id;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Service</h2>
        <p className="text-gray-600">Choose the cleaning service that best fits your needs.</p>
      </div>

      <div className="grid gap-4">
        <Card 
          className={`p-6 cursor-pointer transition-all duration-200 ${
            isSelected 
              ? 'ring-2 ring-blue-600 bg-blue-50' 
              : 'hover:shadow-md hover:border-gray-300'
          }`}
          onClick={() => setSelectedService(service)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                {isSelected && (
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                )}
              </div>
              
              {service.description && (
                <p className="text-gray-600 mb-4">{service.description}</p>
              )}

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Duration:</span>
                  <span>{service.duration_minutes} minutes</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Base Price:</span>
                  <span className="text-lg font-semibold text-green-600">
                    ${service.base_price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Service Details */}
      {isSelected && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">What&apos;s Included:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Professional cleaning equipment and supplies</li>
            <li>• Experienced and vetted cleaners</li>
            <li>• Satisfaction guarantee</li>
            <li>• Flexible scheduling</li>
          </ul>
        </div>
      )}
    </div>
  );
}
