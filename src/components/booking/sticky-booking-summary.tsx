'use client';

import { useState } from 'react';
import { Calendar, Home, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useBookingStore } from '@/lib/stores/booking-store';
import { formatZAR } from '@/lib/format';

interface StickyBookingSummaryProps {
  currentStep: number;
}

export function StickyBookingSummary({ currentStep }: StickyBookingSummaryProps) {
  const {
    selectedService,
    rooms,
    extras,
    location,
    scheduling,
    pricing,
  } = useBookingStore();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Don't show on step 5 (review) or step 6 (confirmation)
  if (currentStep >= 5) {
    return null;
  }

  if (!selectedService) {
    return (
      <Card className="p-4 sticky top-4">
        <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
        <p className="text-gray-500 text-sm">Select a service to see pricing details.</p>
      </Card>
    );
  }

  const basePrice = selectedService.base_fee || 0;
  const totalExtras = extras.reduce((sum, extra) => sum + (extra.price * extra.quantity), 0);

  return (
    <Card className={`sticky top-4 transition-all duration-200 ${
      isCollapsed ? 'max-h-16 overflow-hidden' : ''
    }`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Booking Summary</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="md:hidden p-1 h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </Button>
        </div>

        {!isCollapsed && (
          <>
            {/* Service Details */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Home className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm">{selectedService.name}</h4>
                  <p className="text-xs text-gray-500 truncate">{selectedService.description}</p>
                </div>
              </div>

              {/* Rooms */}
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs">
                  {rooms.bedrooms} bedroom{rooms.bedrooms !== 1 ? 's' : ''}, {rooms.bathrooms} bathroom{rooms.bathrooms !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Location */}
              {location.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 truncate">{location.address}</p>
                  </div>
                </div>
              )}

              {/* Date & Time */}
              {scheduling.selectedDate && scheduling.selectedTime && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs">
                    {new Date(scheduling.selectedDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })} at {scheduling.selectedTime}
                  </span>
                </div>
              )}
            </div>

            <Separator className="my-3" />

            {/* Pricing Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Base service</span>
                <span className="font-medium">{formatZAR(basePrice * 100)}</span>
              </div>

              {rooms.bedrooms > 1 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Additional bedrooms (×{rooms.bedrooms - 1})</span>
                  <span className="font-medium">+{formatZAR((rooms.bedrooms - 1) * 20 * 100)}</span>
                </div>
              )}

              {rooms.bathrooms > 1 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Additional bathrooms (×{rooms.bathrooms - 1})</span>
                  <span className="font-medium">+{formatZAR((rooms.bathrooms - 1) * 15 * 100)}</span>
                </div>
              )}

              {pricing.deliveryFee > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Delivery fee</span>
                  <span className="font-medium">+{formatZAR(pricing.deliveryFee * 100)}</span>
                </div>
              )}

              {extras.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <div className="space-y-1">
                    {extras.map((extra) => (
                      <div key={extra.id} className="flex justify-between text-xs">
                        <span className="text-gray-600 truncate">
                          {extra.name} × {extra.quantity}
                        </span>
                        <span className="font-medium">
                          +{formatZAR(extra.price * extra.quantity * 100)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Separator className="my-2" />
              <div className="flex justify-between text-sm font-semibold">
                <span>Total</span>
                <span className="text-blue-600">
                  {pricing.totalPrice > 0 
                    ? formatZAR(pricing.totalPrice * 100)
                    : formatZAR((basePrice + totalExtras + pricing.deliveryFee) * 100)
                  }
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
