'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Home, Sparkles, Truck, Hammer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBookingStore } from '@/lib/stores/booking-store';
import { Service } from '@/lib/database.types';

interface ServiceSelectionStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
  canGoBack?: boolean;
}

const serviceIcons = {
  'standard-cleaning': Home,
  'deep-cleaning': Sparkles,
  'move-in-out': Truck,
  'post-construction': Hammer,
};

export function ServiceSelectionStep({ onNext, onPrevious, canGoBack = false }: ServiceSelectionStepProps) {
  const router = useRouter();
  const { selectedService, setSelectedService, setCurrentStep } = useBookingStore();
  
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        
        const data = await response.json();
        setServices(data.services || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load services');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  const handleContinue = () => {
    if (selectedService) {
      setCurrentStep(2);
      if (onNext) {
        onNext();
      } else {
        router.push(`/booking/service/${selectedService.slug}/rooms`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Your Service
        </h2>
        <p className="text-gray-600">
          Choose the cleaning service that best fits your needs
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => {
          const IconComponent = serviceIcons[service.slug as keyof typeof serviceIcons] || Home;
          const isSelected = selectedService?.id === service.id;
          
          return (
            <Card 
              key={service.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleServiceSelect(service)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-blue-600' : 'bg-blue-100'
                  }`}>
                    <IconComponent className={`h-6 w-6 ${
                      isSelected ? 'text-white' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className={`text-lg ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {service.name}
                    </CardTitle>
                    <p className={`text-sm ${
                      isSelected ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {service.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Starting from</span>
                  <span className={`text-2xl font-bold ${
                    isSelected ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    R{service.base_fee}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoBack}
          className="flex items-center gap-2"
        >
          {canGoBack && 'Previous'}
        </Button>

        <Button
          onClick={handleContinue}
          disabled={!selectedService}
          className="px-8 flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}