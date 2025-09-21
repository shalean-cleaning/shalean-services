'use client';

// import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

import { CleanerSelectionStep } from './steps/cleaner-selection-step';
import { ServiceSelectionStep } from './steps/service-selection-step';
import { RoomsExtrasStep } from './steps/rooms-extras-step';
import { LocationSchedulingStep } from './steps/location-scheduling-step';
import { StickyBookingSummary } from './sticky-booking-summary';
// import { Button } from '@/components/ui/button';
import { Service, ServiceItem, Region } from '@/lib/database.types';
import { useBookingStore } from '@/lib/stores/booking-store';

interface BookingStepperProps {
  service: Service;
  extras: ServiceItem[];
  regions: Region[];
}

const steps = [
  { id: 1, title: 'Service', description: 'Select your cleaning service' },
  { id: 2, title: 'Rooms & Extras', description: 'Specify bedrooms, bathrooms & extras' },
  { id: 3, title: 'Location & Time', description: 'Choose location and schedule' },
  { id: 4, title: 'Cleaner', description: 'Select your cleaner' },
  { id: 5, title: 'Review & Payment', description: 'Review and complete payment' },
  { id: 6, title: 'Confirmation', description: 'Booking confirmed' },
];

export function BookingStepper({ service, _extras, _regions }: BookingStepperProps) {
  const {
    currentStep,
    setCurrentStep,
    setSelectedService,
    rooms,
    location,
    scheduling,
    cleaner,
  } = useBookingStore();

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the booking store with service data and quote state
  useEffect(() => {
    if (!isInitialized && service) {
      setSelectedService(service);
      
      // Check for quote state in session storage
      const quoteState = sessionStorage.getItem('quoteState');
      if (quoteState) {
        try {
          const parsedQuoteState = JSON.parse(quoteState);
          // Use the new hydrateFromQuote method if available
          if (typeof (useBookingStore.getState() as any).hydrateFromQuote === 'function') {
            (useBookingStore.getState() as any).hydrateFromQuote(parsedQuoteState);
          }
          // Clear the quote state from session storage
          sessionStorage.removeItem('quoteState');
        } catch (error) {
          console.error('Error parsing quote state:', error);
        }
      }
      
      setIsInitialized(true);
    }
  }, [service, setSelectedService, isInitialized]);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const _canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!service;
      case 2:
        return rooms.bedrooms >= 1 && rooms.bathrooms >= 1;
      case 3:
        return !!(location.suburbId && scheduling.selectedDate && scheduling.selectedTime && location.address && location.postcode);
      case 4:
        return !!cleaner.selectedCleanerId || cleaner.autoAssign;
      case 5:
        return true; // Review step - handled by review page
      case 6:
        return true; // Confirmation step
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ServiceSelectionStep 
            onNext={handleNext}
            canGoBack={currentStep > 1}
          />
        );
      case 2:
        return (
          <RoomsExtrasStep 
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoBack={currentStep > 1}
          />
        );
      case 3:
        return (
          <LocationSchedulingStep 
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoBack={currentStep > 1}
          />
        );
      case 4:
        return (
          <CleanerSelectionStep 
            onPrevious={handlePrevious}
            canGoBack={currentStep > 1}
          />
        );
      default:
        return null;
    }
  };

  if (!isInitialized) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading booking form...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.slice(0, 4).map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.id}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              {index < 3 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {renderStep()}
          </div>
        </div>

        {/* Sticky Summary */}
        <div className="lg:col-span-1">
          <StickyBookingSummary currentStep={currentStep} />
        </div>
      </div>
    </div>
  );
}
