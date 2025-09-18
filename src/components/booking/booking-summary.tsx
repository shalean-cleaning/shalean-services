'use client';

import { Calendar, Clock, Home, Plus, MapPin } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Service } from '@/lib/database.types';
import { useBookingStore } from '@/lib/stores/booking-store';
import { formatZAR } from '@/lib/format';

interface BookingSummaryProps {
  service: Service;
}

export function BookingSummary({ service: _service }: BookingSummaryProps) {
  const {
    selectedService,
    bedroomCount,
    bathroomCount,
    selectedExtras,
    selectedDate,
    selectedTime,
    address,
    deliveryFee,
    totalPrice,
  } = useBookingStore();

  if (!selectedService) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
        <p className="text-gray-500 text-sm">Select a service to see pricing details.</p>
      </Card>
    );
  }

  const basePrice = selectedService.base_price;

  return (
    <Card className="p-6 sticky top-8">
      <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
      
      {/* Service Details */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Home className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{selectedService.name}</h4>
            <p className="text-sm text-gray-500">{selectedService.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{selectedService.duration_minutes} minutes</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{bedroomCount} bedroom{bedroomCount !== 1 ? 's' : ''}, {bathroomCount} bathroom{bathroomCount !== 1 ? 's' : ''}</span>
        </div>

        {/* Location Information */}
        {address && (
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Service Location</h4>
              <p className="text-sm text-gray-500">{address}</p>
            </div>
          </div>
        )}

        {/* Scheduling Information */}
        {selectedDate && selectedTime && (
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Scheduled Time</h4>
              <p className="text-sm text-gray-500">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} at {selectedTime}
              </p>
            </div>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      {/* Pricing Breakdown */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Base service</span>
          <span className="font-medium">{formatZAR(basePrice * 100)}</span>
        </div>

        {bedroomCount > 1 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Additional bedrooms (×{bedroomCount - 1})</span>
            <span className="font-medium">+{formatZAR((bedroomCount - 1) * 20 * 100)}</span>
          </div>
        )}

        {bathroomCount > 1 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Additional bathrooms (×{bathroomCount - 1})</span>
            <span className="font-medium">+{formatZAR((bathroomCount - 1) * 15 * 100)}</span>
          </div>
        )}

        {deliveryFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery fee</span>
            <span className="font-medium">+{formatZAR(deliveryFee * 100)}</span>
          </div>
        )}

        {selectedExtras.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              {selectedExtras.map((extra) => (
                <div key={extra.id} className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Plus className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600">{extra.name} (×{extra.quantity})</span>
                  </div>
                  <span className="font-medium">+{formatZAR(extra.price * extra.quantity * 100)}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <Separator />
        
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span className="text-green-600">{formatZAR(totalPrice * 100)}</span>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">What&apos;s Next?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Choose your preferred date and time</li>
          <li>• Provide your contact information</li>
          <li>• Confirm your booking details</li>
          <li>• Receive confirmation via email</li>
        </ul>
      </div>

      {/* Trust Indicators */}
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>✓ Secure payment processing</p>
        <p>✓ 100% satisfaction guarantee</p>
        <p>✓ Licensed and insured cleaners</p>
      </div>
    </Card>
  );
}
