'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Service, Extra, PricingRule } from '@/lib/database.types';
import { useBookingStore } from '@/lib/stores/booking-store';

import { ServiceSelectionStep } from './steps/service-selection-step';
import { RoomsSelectionStep } from './steps/rooms-selection-step';
import { ExtrasSelectionStep } from './steps/extras-selection-step';

interface BookingStepperProps {
  service: Service;
  extras: Extra[];
  pricingRules: PricingRule[];
}

const steps = [
  { id: 1, title: 'Service', description: 'Select your cleaning service' },
  { id: 2, title: 'Rooms', description: 'Specify bedrooms & bathrooms' },
  { id: 3, title: 'Extras', description: 'Add optional extras' },
];

export function BookingStepper({ service, extras, pricingRules }: BookingStepperProps) {
  const {
    currentStep,
    setCurrentStep,
    setSelectedService,
    bedroomCount,
    bathroomCount,
    selectedExtras,
  } = useBookingStore();

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the booking store with service data
  useEffect(() => {
    if (!isInitialized && service) {
      setSelectedService(service);
      setIsInitialized(true);
    }
  }, [service, setSelectedService, isInitialized]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!service;
      case 2:
        return bedroomCount >= 1 && bathroomCount >= 1;
      case 3:
        return true; // Extras are optional
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ServiceSelectionStep 
            service={service}
            pricingRules={pricingRules}
          />
        );
      case 2:
        return (
          <RoomsSelectionStep 
            bedroomCount={bedroomCount}
            bathroomCount={bathroomCount}
          />
        );
      case 3:
        return (
          <ExtrasSelectionStep 
            extras={extras}
            selectedExtras={selectedExtras}
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
    <div className="p-6">
      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
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
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep < 3 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                // TODO: Navigate to next step (date/time selection)
                console.log('Proceed to booking confirmation');
              }}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              Continue to Booking
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
