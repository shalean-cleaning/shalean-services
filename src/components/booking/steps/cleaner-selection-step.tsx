'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CleanerCard } from '../cleaner-card';
import { useBookingStore } from '@/lib/stores/booking-store';
import { Sparkles, Users, Clock, AlertCircle } from 'lucide-react';

export function CleanerSelectionStep() {
  const {
    selectedSuburb,
    selectedDate,
    selectedTime,
    selectedService,
    selectedCleanerId,
    availableCleaners,
    setSelectedCleanerId,
    setAvailableCleaners,
    autoAssignCleaner,
  } = useBookingStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available cleaners when component mounts or dependencies change
  useEffect(() => {
    const fetchAvailableCleaners = async () => {
      if (!selectedSuburb || !selectedDate || !selectedTime) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/cleaners/available', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            suburb_id: selectedSuburb,
            date: selectedDate,
            time: selectedTime,
            service_id: selectedService?.id,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch available cleaners');
        }

        const data = await response.json();
        setAvailableCleaners(data.available_cleaners || []);
      } catch (err) {
        console.error('Error fetching cleaners:', err);
        setError('Failed to load available cleaners. Please try again.');
        setAvailableCleaners([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableCleaners();
  }, [selectedSuburb, selectedDate, selectedTime, selectedService?.id, setAvailableCleaners]);

  const handleCleanerSelect = (cleanerId: string) => {
    setSelectedCleanerId(cleanerId);
  };

  const handleAutoAssign = () => {
    autoAssignCleaner();
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
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
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
            disabled={isLoading || availableCleaners.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Auto-assign
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
              Unfortunately, no cleaners are available for the selected time slot.
            </p>
            <p className="text-sm text-gray-500">
              Try selecting a different time or date.
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
      {selectedCleanerId && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-green-800">
                Cleaner Selected Successfully
              </p>
              <p className="text-sm text-green-600">
                Your booking will be confirmed with the selected cleaner
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
