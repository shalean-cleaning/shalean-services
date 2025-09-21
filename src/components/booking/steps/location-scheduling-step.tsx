'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBookingStore } from '@/lib/stores/booking-store';

interface LocationSchedulingStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
  canGoBack?: boolean;
}

interface Region {
  id: string;
  name: string;
  state: string;
}

interface Area {
  id: string;
  name: string;
  postcode: string;
  delivery_fee: number;
  region_id: string;
}

export function LocationSchedulingStep({ onNext, onPrevious, canGoBack = true }: LocationSchedulingStepProps) {
  const router = useRouter();
  const { 
    selectedService,
    location, 
    scheduling, 
    customerInfo,
    setLocation, 
    setScheduling, 
    setCustomerInfo,
    setCurrentStep 
  } = useBookingStore();
  
  const [regions, setRegions] = useState<Region[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(scheduling.selectedDate || '');
  const [selectedTime, setSelectedTime] = useState(scheduling.selectedTime || '');

  // Generate available time slots (7:00 AM to 1:00 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 13; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch regions
        const regionsResponse = await fetch('/api/regions');
        if (!regionsResponse.ok) throw new Error('Failed to fetch regions');
        const regionsData = await regionsResponse.json();
        setRegions(regionsData.regions || []);

        // Fetch areas
        const areasResponse = await fetch('/api/areas');
        if (!areasResponse.ok) throw new Error('Failed to fetch areas');
        const areasData = await areasResponse.json();
        setAreas(areasData || []);

        // Generate time slots
        setAvailableTimes(generateTimeSlots());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRegionChange = (regionId: string) => {
    setLocation({ regionId, suburbId: null });
  };

  const handleAreaChange = (areaId: string) => {
    setLocation({ suburbId: areaId });
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
    setScheduling({ selectedDate: date, selectedTime: '' });
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    setScheduling({ selectedTime: time });
  };

  const handleContinue = () => {
    if (canContinue()) {
      setCurrentStep(4);
      if (onNext) {
        onNext();
      } else if (selectedService) {
        router.push(`/booking/service/${selectedService.slug}/cleaner`);
      }
    }
  };

  const canContinue = () => {
    return !!(
      location.regionId &&
      location.suburbId &&
      location.address.trim() &&
      location.postcode.trim() &&
      selectedDate &&
      selectedTime
    );
  };

  const filteredAreas = areas.filter(area => 
    !location.regionId || area.region_id === location.regionId
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading location data...</p>
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
          Location & Scheduling
        </h2>
        <p className="text-gray-600">
          Tell us where and when you'd like your cleaning service
        </p>
      </div>

      {/* Location Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Service Location
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Region Selection */}
          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <select
              id="region"
              value={location.regionId || ''}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a region</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}, {region.state}
                </option>
              ))}
            </select>
          </div>

          {/* Area/Suburb Selection */}
          <div className="space-y-2">
            <Label htmlFor="area">Suburb</Label>
            <select
              id="area"
              value={location.suburbId || ''}
              onChange={(e) => handleAreaChange(e.target.value)}
              disabled={!location.regionId}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Select a suburb</option>
              {filteredAreas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name} {area.postcode}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Address Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={location.address}
              onChange={(e) => setLocation({ address: e.target.value })}
              placeholder="Enter your street address"
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address2">Address Line 2 (Optional)</Label>
              <Input
                id="address2"
                value={location.address2 || ''}
                onChange={(e) => setLocation({ address2: e.target.value })}
                placeholder="Apartment, suite, etc."
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postcode">Postal Code</Label>
              <Input
                id="postcode"
                value={location.postcode}
                onChange={(e) => setLocation({ postcode: e.target.value })}
                placeholder="Postal code"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scheduling Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Schedule Your Service
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">Preferred Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full"
            />
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="time">Preferred Time</Label>
            <select
              id="time"
              value={selectedTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              disabled={!selectedDate}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Select a time</option>
              {availableTimes.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Special Instructions */}
      <div className="space-y-2">
        <Label htmlFor="instructions">Special Instructions (Optional)</Label>
        <Textarea
          id="instructions"
          value={customerInfo.specialInstructions || ''}
          onChange={(e) => setCustomerInfo({ specialInstructions: e.target.value })}
          placeholder="Any special requests or instructions for our cleaners..."
          rows={3}
          className="w-full"
        />
      </div>

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
          disabled={!canContinue()}
          className="px-8 flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}