'use client';

import { Minus, Plus, Bed, Bath } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useBookingStore } from '@/lib/stores/booking-store';

interface RoomsSelectionStepProps {
  bedroomCount: number;
  bathroomCount: number;
}

export function RoomsSelectionStep({ bedroomCount, bathroomCount }: RoomsSelectionStepProps) {
  const { setRooms, rooms } = useBookingStore();

  const RoomCounter = ({ 
    label, 
    count, 
    setCount, 
    icon: Icon, 
    min = 1, 
    max = 10 
  }: {
    label: string;
    count: number;
    setCount: (count: number) => void;
    icon: React.ComponentType<{ className?: string }>;
    min?: number;
    max?: number;
  }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-gray-600" />
          <div>
            <h3 className="font-semibold text-gray-900">{label}</h3>
            <p className="text-sm text-gray-500">Number of {label.toLowerCase()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCount(Math.max(min, count - 1))}
            disabled={count <= min}
            className="w-10 h-10 p-0"
          >
            <Minus className="w-4 h-4" />
          </Button>
          
          <span className="w-8 text-center font-semibold text-lg">{count}</span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCount(Math.min(max, count + 1))}
            disabled={count >= max}
            className="w-10 h-10 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Room Details</h2>
        <p className="text-gray-600">Tell us about your home to get an accurate quote.</p>
      </div>

      <div className="grid gap-4">
        <RoomCounter
          label="Bedrooms"
          count={bedroomCount}
          setCount={(count) => setRooms({ ...rooms, bedrooms: count })}
          icon={Bed}
        />
        
        <RoomCounter
          label="Bathrooms"
          count={bathroomCount}
          setCount={(count) => setRooms({ ...rooms, bathrooms: count })}
          icon={Bath}
        />
      </div>

      {/* Pricing Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Pricing Information:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Base price includes 1 bedroom and 1 bathroom</li>
          <li>• Additional bedrooms: +$20 each</li>
          <li>• Additional bathrooms: +$15 each</li>
          <li>• Price updates automatically as you make changes</li>
        </ul>
      </div>
    </div>
  );
}
