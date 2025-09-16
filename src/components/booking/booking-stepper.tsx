'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

import { CleanerSelectionStep } from './steps/cleaner-selection-step';
import { ExtrasSelectionStep } from './steps/extras-selection-step';
import { LocationSchedulingStep } from './steps/location-scheduling-step';
import { RoomsSelectionStep } from './steps/rooms-selection-step';
import { ServiceSelectionStep } from './steps/service-selection-step';
import { Button } from '@/components/ui/button';
import { Service, Extra, Region } from '@/lib/database.types';
import { useBookingStore } from '@/lib/stores/booking-store';

interface BookingStepperProps {
  service: Service;
  extras: Extra[];
  regions: Region[];
}

const steps = [
  { id: 1, title: 'Service', description: 'Select your cleaning service' },
  { id: 2, title: 'Rooms', description: 'Specify bedrooms & bathrooms' },
  { id: 3, title: 'Extras', description: 'Add optional extras' },
  { id: 4, title: 'Location & Time', description: 'Choose location and schedule' },
  { id: 5, title: 'Cleaner', description: 'Select your cleaner' },
];

export function BookingStepper({ service, extras, regions }: BookingStepperProps) {
  const {
    currentStep,
    setCurrentStep,
    setSelectedService,
    bedroomCount,
    bathroomCount,
    selectedExtras,
    selectedRegion,
    selectedSuburb,
    selectedDate,
    selectedTime,
    selectedCleanerId,
    autoAssign,
    address,
    postcode,
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
    if (currentStep < 5) {
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
      case 4:
        return !!(selectedRegion && selectedSuburb && selectedDate && selectedTime && address && postcode);
      case 5:
        return !!selectedCleanerId || autoAssign;
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
      case 4:
        return (
          <LocationSchedulingStep 
            regions={regions}
          />
        );
      case 5:
        return (
          <CleanerSelectionStep 
            onNext={() => {
              // Navigate to review page instead of step 6
              window.location.href = '/booking/review';
            }}
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

      {/* Navigation - Only show for steps that don't have their own navigation */}
      {currentStep !== 4 && currentStep !== 5 && (
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
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
