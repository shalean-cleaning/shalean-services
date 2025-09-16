'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useBookingStore } from '@/lib/stores/booking-store';
import { getAndClearBookingContext } from '@/lib/utils';

export function BookingReviewStep() {
  const router = useRouter();
  const {
    selectedService,
    bedroomCount,
    bathroomCount,
    selectedExtras,
    selectedDate,
    selectedTime,
    selectedCleanerId,
    autoAssign,
    address,
    postcode,
    specialInstructions,
    totalPrice,
    availableCleaners,
    composeDraftPayload,
  } = useBookingStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftCreated, setDraftCreated] = useState(false);

  // Check if we need to redirect back to booking flow
  useEffect(() => {
    const bookingContext = getAndClearBookingContext();
    
    // If we have no booking data and no context, redirect to start
    if (!selectedService && !bookingContext) {
      router.push('/booking');
      return;
    }
    
    // If we have context indicating user was on an earlier step, redirect back
    if (bookingContext && bookingContext.currentStep && bookingContext.currentStep < 5) {
      const serviceSlug = bookingContext.serviceSlug || 'standard-cleaning';
      router.push(`/booking/service/${serviceSlug}?step=${bookingContext.currentStep}`);
      return;
    }
  }, [selectedService, router]);

  // Create draft booking on component mount
  useEffect(() => {
    const createDraft = async () => {
      if (draftCreated) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const payload = composeDraftPayload();
        
        // Add cleaner selection to payload
        const payloadWithCleaner = {
          ...payload,
          selectedCleanerId: selectedCleanerId || undefined,
          autoAssign: autoAssign
        };
        
        const response = await fetch('/api/bookings/draft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payloadWithCleaner),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.message || result.error || `HTTP ${response.status}`);
        }
        
        setDraftCreated(true);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create booking draft";
        setError(errorMessage);
        console.error('Error creating draft:', err);
      } finally {
        setIsLoading(false);
      }
    };

    createDraft();
  }, [composeDraftPayload, selectedCleanerId, autoAssign, draftCreated, router]);

  const handleCompleteBooking = () => {
    // TODO: Implement payment flow
    console.log('Complete booking - payment flow to be implemented');
  };

  const handlePrevious = () => {
    router.back();
  };

  const selectedCleaner = selectedCleanerId 
    ? availableCleaners.find(c => c.id === selectedCleanerId)
    : null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Creating your booking draft...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error Creating Booking</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={handlePrevious}>
              Go Back
            </Button>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Review & Payment
        </h1>
        <p className="text-gray-600">
          Please review your booking details before completing payment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bedrooms:</span>
                <span className="font-medium">{bedroomCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bathrooms:</span>
                <span className="font-medium">{bathroomCount}</span>
              </div>
              {selectedExtras.length > 0 && (
                <div>
                  <span className="text-gray-600">Extras:</span>
                  <ul className="mt-1 space-y-1">
                    {selectedExtras.map((extra) => (
                      <li key={extra.id} className="text-sm">
                        {extra.name} × {extra.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>

          {/* Location & Time */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Location & Time</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{selectedDate && formatDate(selectedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{selectedTime && formatTime(selectedTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="font-medium text-right max-w-xs">
                  {address}
                  {postcode && `, ${postcode}`}
                </span>
              </div>
              {specialInstructions && (
                <div>
                  <span className="text-gray-600">Special Instructions:</span>
                  <p className="mt-1 text-sm">{specialInstructions}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Cleaner Selection */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cleaner Assignment</h2>
            <div className="space-y-3">
              {autoAssign ? (
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="font-medium">Auto-assign best available cleaner</span>
                </div>
              ) : selectedCleaner ? (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="font-medium">Selected Cleaner</span>
                  </div>
                  <div className="ml-7 space-y-1">
                    <div className="font-medium">{selectedCleaner.name}</div>
                    <div className="text-sm text-gray-600">
                      ⭐ {selectedCleaner.rating} ({selectedCleaner.totalRatings} reviews)
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedCleaner.experienceYears} years experience
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">No cleaner selected</div>
              )}
            </div>
          </Card>
        </div>

        {/* Payment Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span>${selectedService?.base_price || 0}</span>
              </div>
              
              {selectedExtras.length > 0 && (
                <>
                  <Separator />
                  {selectedExtras.map((extra) => (
                    <div key={extra.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{extra.name} × {extra.quantity}:</span>
                      <span>${(extra.price * extra.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </>
              )}
              
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button 
                onClick={handleCompleteBooking}
                className="w-full"
                size="lg"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Complete Payment
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                className="w-full"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Cleaner Selection
              </Button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Secure Payment:</strong> Your payment information is encrypted and secure.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
