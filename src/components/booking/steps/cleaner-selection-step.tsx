'use client';

import { Sparkles, Users, Clock, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

import { CleanerCard } from '../cleaner-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useBookingStore } from '@/lib/stores/booking-store';

export function CleanerSelectionStep() {
  const {
    selectedSuburb,
    selectedDate,
    selectedTime,
    selectedCleanerId,
    autoAssign,
    availableCleaners,
    setSelectedCleanerId,
    setAutoAssign,
    setAvailableCleaners,
    autoAssignCleaner,
  } = useBookingStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch available cleaners when component mounts or dependencies change
  useEffect(() => {
    const { selectedRegion, bedroomCount, bathroomCount } = useBookingStore.getState();
    
    if (!selectedRegion || !selectedSuburb || !selectedDate || !selectedTime) {
      setError(null);
      setAvailableCleaners([]);
      return;
    }

    const ac = new AbortController();
    setIsLoading(true);
    setError(null);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    fetch(`${baseUrl}/api/cleaners/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        regionId: selectedRegion,
        suburbId: selectedSuburb,
        date: selectedDate,             // ISO string
        timeSlot: selectedTime,        // "10:00"
        bedrooms: bedroomCount ?? 1,
        bathrooms: bathroomCount ?? 1,
      }),
      signal: ac.signal,
      cache: "no-store",
    })
    .then(async (res) => {
      const text = await res.text().catch(() => "");
      if (!res.ok) {
        console.error("[availability] status:", res.status, res.statusText, "body:", text);
        throw new Error(text || `availability failed: ${res.status}`);
      }
      return text ? JSON.parse(text) : { cleaners: [] };
    })
    .then((data) => setAvailableCleaners(Array.isArray(data.cleaners) ? data.cleaners : data))
    .catch((err) => {
      if (err.name !== "AbortError") {
        setError("We couldn't load available cleaners. Please adjust date or time and try again.");
        console.error(err);
      }
    })
    .finally(() => setIsLoading(false));

    return () => ac.abort();
  }, [selectedSuburb, selectedDate, selectedTime, setAvailableCleaners]);

  const handleCleanerSelect = (cleanerId: string) => {
    setSelectedCleanerId(cleanerId);
  };

  const handleAutoAssign = () => {
    setAutoAssign(true);
  };

  const canContinue = !!selectedCleanerId || autoAssign;

  const handleContinue = async () => {
    if (!canContinue) return;
    
    setIsSaving(true);
    try {
      // Get booking ID from store or create a temporary one
      const { selectedService, bedroomCount, bathroomCount, selectedRegion, selectedSuburb, selectedDate, selectedTime, address, postcode } = useBookingStore.getState();
      
      // For now, we'll use a placeholder booking ID - in a real app, this would be created earlier in the flow
      const bookingId = 'temp-booking-id'; // This should come from your booking creation flow
      
      const response = await fetch('/api/bookings/select-cleaner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          cleanerId: selectedCleanerId,
          autoAssign,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save cleaner selection');
      }
      
      // Navigate to next step or show success
      // This would typically be handled by your booking stepper component
      console.log('Cleaner selection saved successfully');
      
    } catch (error) {
      console.error('Error saving cleaner selection:', error);
      setError('Failed to save your selection. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Skeleton loading component
  const SkeletonCard = () => (
    <Card className="p-4 animate-pulse" data-testid="skeleton-card">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Cleaner
        </h2>
        <p className="text-gray-600">
          Select a cleaner or let us assign the best match for you
        </p>
      </div>

      {/* Auto-assign option */}
      <Card className={`p-4 border-2 transition-colors ${
        autoAssign 
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              autoAssign ? 'bg-blue-600' : 'bg-blue-500'
            }`}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Auto-assign Best Match</h3>
              <p className="text-sm text-gray-600">
                We&apos;ll automatically select the highest-rated available cleaner
              </p>
            </div>
          </div>
          <Button
            onClick={handleAutoAssign}
            disabled={isLoading}
            className={`${
              autoAssign 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {autoAssign ? 'Selected' : 'Auto-assign'}
          </Button>
        </div>
      </Card>

      <Separator />

      {/* Available cleaners */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Available Cleaners
          </h3>
          {availableCleaners.length > 0 && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{availableCleaners.length} available</span>
            </div>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <Card className="p-6 text-center border-red-200 bg-red-50">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700">{error}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-3"
            >
              Try Again
            </Button>
          </Card>
        )}

        {/* Empty state */}
        {!isLoading && !error && availableCleaners.length === 0 && (
          <Card className="p-6 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Cleaners Available
            </h3>
            <p className="text-gray-600 mb-4">
              No cleaners available for the selected time. You can still continue with <span className="font-medium">Auto-assign Best Match</span>.
            </p>
            <p className="text-sm text-gray-500">
              Try selecting a different time or date, or use Auto-assign above.
            </p>
          </Card>
        )}

        {/* Cleaners list */}
        {!isLoading && !error && availableCleaners.length > 0 && (
          <div className="space-y-4">
            {availableCleaners.map((cleaner) => (
              <CleanerCard
                key={cleaner.id}
                cleaner={cleaner}
                isSelected={selectedCleanerId === cleaner.id}
                onSelect={handleCleanerSelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selected cleaner summary */}
      {(selectedCleanerId || autoAssign) && (
        <Card className={`p-4 border-2 ${
          autoAssign 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              autoAssign ? 'bg-blue-500' : 'bg-green-500'
            }`}>
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className={`font-semibold ${
                autoAssign ? 'text-blue-800' : 'text-green-800'
              }`}>
                {autoAssign ? 'Auto-assign Selected' : 'Cleaner Selected Successfully'}
              </p>
              <p className={`text-sm ${
                autoAssign ? 'text-blue-600' : 'text-green-600'
              }`}>
                {autoAssign 
                  ? 'We\'ll assign the best available cleaner for your booking'
                  : 'Your booking will be confirmed with the selected cleaner'
                }
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Continue Button */}
      <div className="flex justify-end pt-6">
        <Button
          onClick={handleContinue}
          disabled={!canContinue || isSaving}
          className="px-8"
        >
          {isSaving ? 'Saving...' : 'Continue to Review'}
        </Button>
      </div>
    </div>
  );
}
