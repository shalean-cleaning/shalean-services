'use client';

import { Minus, Plus, Info } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ServiceItem } from '@/lib/database.types';
import { useBookingStore } from '@/lib/stores/booking-store';
import { formatZAR } from '@/lib/format';

interface ExtrasSelectionStepProps {
  extras: ServiceItem[];
  selectedExtras: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export function ExtrasSelectionStep({ extras, selectedExtras }: ExtrasSelectionStepProps) {
  const { addExtra, removeExtra, updateExtraQuantity } = useBookingStore();
  const [hoveredExtra, setHoveredExtra] = useState<string | null>(null);

  const isExtraSelected = (extraId: string) => {
    return selectedExtras.some(extra => extra.id === extraId);
  };

  const getExtraQuantity = (extraId: string) => {
    const extra = selectedExtras.find(e => e.id === extraId);
    return extra?.quantity || 0;
  };

  const handleExtraToggle = (extra: ServiceItem) => {
    if (isExtraSelected(extra.id)) {
      removeExtra(extra.id);
    } else {
      addExtra(extra);
    }
  };

  const handleQuantityChange = (extra: ServiceItem, quantity: number) => {
    if (quantity <= 0) {
      removeExtra(extra.id);
    } else {
      updateExtraQuantity(extra.id, quantity);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Extras</h2>
        <p className="text-gray-600">Enhance your cleaning service with these optional add-ons.</p>
      </div>

      {extras.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No extras available for this service.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {extras.map((extra) => {
            const isSelected = isExtraSelected(extra.id);
            const quantity = getExtraQuantity(extra.id);

            return (
              <Card 
                key={extra.id}
                className={`p-6 transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-blue-600 bg-blue-50' 
                    : 'hover:shadow-md hover:border-gray-300'
                }`}
                onMouseEnter={() => setHoveredExtra(extra.id)}
                onMouseLeave={() => setHoveredExtra(null)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleExtraToggle(extra)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{extra.name}</h3>
                        <div className="relative">
                          <Info className="w-4 h-4 text-gray-400 cursor-help" />
                          {hoveredExtra === extra.id && extra.description && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-10 max-w-xs">
                              {extra.description}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {extra.description && (
                        <p className="text-sm text-gray-600 mb-2">{extra.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="font-medium">Price: {formatZAR(extra.price * 100)}</span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(extra, quantity - 1)}
                        className="w-8 h-8 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <span className="w-8 text-center font-semibold">{quantity}</span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(extra, quantity + 1)}
                        className="w-8 h-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Selected Extras Summary */}
      {selectedExtras.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">Selected Extras:</h4>
          <ul className="text-sm text-green-800 space-y-1">
            {selectedExtras.map((extra) => (
              <li key={extra.id}>
                • {extra.name} (×{extra.quantity}) - {formatZAR(extra.price * extra.quantity * 100)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
