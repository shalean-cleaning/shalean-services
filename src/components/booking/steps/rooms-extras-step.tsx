'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus, Minus, Home, Bath } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useBookingStore } from '@/lib/stores/booking-store';
import { formatZAR } from '@/lib/format';

interface RoomsExtrasStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
  canGoBack?: boolean;
}

interface Extra {
  id: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
}

export function RoomsExtrasStep({ onNext, onPrevious, canGoBack = true }: RoomsExtrasStepProps) {
  const router = useRouter();
  const { 
    selectedService,
    rooms, 
    extras, 
    setRooms, 
    addExtra, 
    removeExtra, 
    updateExtraQuantity,
    setCurrentStep 
  } = useBookingStore();
  
  const [availableExtras, setAvailableExtras] = useState<Extra[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExtras = async () => {
      try {
        const response = await fetch('/api/extras');
        if (!response.ok) {
          throw new Error('Failed to fetch extras');
        }
        
        const data = await response.json();
        setAvailableExtras(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load extras');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExtras();
  }, []);

  const handleRoomChange = (type: 'bedrooms' | 'bathrooms', value: number) => {
    const newValue = Math.max(1, value);
    setRooms({ ...rooms, [type]: newValue });
  };

  const handleExtraToggle = (extra: Extra) => {
    const isSelected = extras.some(e => e.id === extra.id);
    
    if (isSelected) {
      removeExtra(extra.id);
    } else {
      addExtra({
        id: extra.id,
        name: extra.name,
        price: extra.price
      });
    }
  };

  const handleExtraQuantityChange = (extraId: string, quantity: number) => {
    updateExtraQuantity(extraId, quantity);
  };

  const handleContinue = () => {
    setCurrentStep(3);
    if (onNext) {
      onNext();
    } else if (selectedService) {
      router.push(`/booking/service/${selectedService.slug}/location`);
    }
  };

  const canContinue = rooms.bedrooms >= 1 && rooms.bathrooms >= 1;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading options...</p>
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Bedrooms, Bathrooms & Extras
        </h2>
        <p className="text-gray-600">
          Tell us about your space and add any additional services
        </p>
      </div>

      {/* Rooms Selection */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Your Space</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bedrooms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-600" />
                Bedrooms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRoomChange('bedrooms', rooms.bedrooms - 1)}
                  disabled={rooms.bedrooms <= 1}
                  className="w-10 h-10 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                
                <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
                  {rooms.bedrooms}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRoomChange('bedrooms', rooms.bedrooms + 1)}
                  className="w-10 h-10 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bathrooms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bath className="w-5 h-5 text-blue-600" />
                Bathrooms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRoomChange('bathrooms', rooms.bathrooms - 1)}
                  disabled={rooms.bathrooms <= 1}
                  className="w-10 h-10 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                
                <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
                  {rooms.bathrooms}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRoomChange('bathrooms', rooms.bathrooms + 1)}
                  className="w-10 h-10 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Extras Selection */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Additional Services</h3>
        
        {availableExtras.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableExtras.map((extra) => {
              const isSelected = extras.some(e => e.id === extra.id);
              const selectedExtra = extras.find(e => e.id === extra.id);
              const quantity = selectedExtra?.quantity || 0;
              
              return (
                <Card 
                  key={extra.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleExtraToggle(extra)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className={`text-base ${
                          isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {extra.name}
                        </CardTitle>
                        <p className={`text-sm mt-1 ${
                          isSelected ? 'text-blue-700' : 'text-gray-600'
                        }`}>
                          {extra.description}
                        </p>
                      </div>
                      <div className={`text-lg font-bold ${
                        isSelected ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {formatZAR(extra.price * 100)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  {isSelected && quantity > 0 && (
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">Quantity:</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExtraQuantityChange(extra.id, quantity - 1);
                            }}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          
                          <span className="w-8 text-center font-semibold text-blue-900">
                            {quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExtraQuantityChange(extra.id, quantity + 1);
                            }}
                            className="w-8 h-8 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No additional services available at this time.</p>
          </div>
        )}
      </div>

      {/* Selected Extras Summary */}
      {extras.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Selected Extras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {extras.map((extra) => (
                <div key={extra.id} className="flex justify-between items-center text-sm">
                  <span className="text-green-800">
                    {extra.name} × {extra.quantity}
                  </span>
                  <span className="font-semibold text-green-900">
                    {formatZAR(extra.price * extra.quantity * 100)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoBack}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <Button
          onClick={handleContinue}
          disabled={!canContinue}
          className="px-8 flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
