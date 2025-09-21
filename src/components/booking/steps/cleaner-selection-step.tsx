'use client';

import { Sparkles, Users, Clock, AlertCircle, ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { CleanerCard } from '../cleaner-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useBookingStore } from '@/lib/stores/booking-store';
import { useRequireAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase-client';
import { buildBookingReturnToUrl } from '@/lib/utils';

interface CleanerSelectionStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
  canGoBack?: boolean;
}

export function CleanerSelectionStep({ onNext: _onNext, onPrevious, canGoBack = true }: CleanerSelectionStepProps) {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useRequireAuth();
  const supabase = createClient();
  const {
    location,
    scheduling,
    cleaner,
    setCleaner,
  } = useBookingStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  // Note: Authentication is only required when clicking "Continue to Booking"
  // This allows users to browse cleaners without being forced to log in

  // Fetch available cleaners when component mounts or dependencies change
  useEffect(() => {
    const { rooms } = useBookingStore.getState();
    
    if (!location.regionId || !location.suburbId || !scheduling.selectedDate || !scheduling.selectedTime) {
      setError(null);
      setCleaner({ availableCleaners: [] });
      return;
    }

    const ac = new AbortController();
    setIsLoading(true);
    setError(null);

    fetch('/api/cleaners/availability', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        regionId: location.regionId,
        suburbId: location.suburbId,
        date: scheduling.selectedDate,             // ISO string
        timeSlot: scheduling.selectedTime,        // "10:00"
        bedrooms: rooms.bedrooms ?? 1,
        bathrooms: rooms.bathrooms ?? 1,
      }),
      signal: ac.signal,
      next: { revalidate: 60 }, // Cache for 1 minute (availability changes frequently)
    })
    .then(async (res) => {
      const text = await res.text().catch(() => "");
      if (!res.ok) {
        console.error("[availability] status:", res.status, res.statusText, "body:", text);
        throw new Error(text || `availability failed: ${res.status}`);
      }
      return text ? JSON.parse(text) : { success: false, cleaners: [] };
    })
    .then((data) => {
      // Handle the new standardized response format
      if (data.success && Array.isArray(data.cleaners)) {
        setCleaner({ availableCleaners: data.cleaners });
        // Clear any previous errors if we got a successful response
        setError(null);
      } else {
        // Handle error responses or empty results
        setCleaner({ availableCleaners: [] });
        if (data.error) {
          setError(data.message || data.error || "Failed to load available cleaners");
        } else if (data.cleaners && data.cleaners.length === 0) {
          // No cleaners available - this is not an error, just empty state
          setError(null);
        }
      }
    })
    .catch((err) => {
      if (err.name !== "AbortError") {
        setError("We couldn't load available cleaners. Please adjust date or time and try again.");
        console.error(err);
        setCleaner({ availableCleaners: [] });
      }
    })
    .finally(() => setIsLoading(false));

    return () => ac.abort();
  }, [location.suburbId, scheduling.selectedDate, scheduling.selectedTime, setCleaner]);

  const handleCleanerSelect = (cleanerId: string) => {
    setCleaner({ selectedCleanerId: cleanerId, autoAssign: false });
  };

  const handleAutoAssign = () => {
    const { cleaner: currentCleaner } = useBookingStore.getState();
    if (currentCleaner.availableCleaners.length > 0) {
      const firstCleaner = currentCleaner.availableCleaners[0];
      setCleaner({ selectedCleanerId: firstCleaner.id, autoAssign: true });
    } else {
      setCleaner({ autoAssign: true, selectedCleanerId: null });
    }
  };

  const canContinue = !!cleaner.selectedCleanerId || cleaner.autoAssign;


  async function handleContinue() {
    // Clear any previous inline errors
    setInlineError(null);
    
    if (!canContinue) {
      setInlineError('Please select a cleaner or enable auto-assign to continue');
      return;
    }
    
    // Check authentication before proceeding - this is the authentication gate per PRD
    if (!isAuthenticated) {
      // Store booking context and redirect to login
      const { selectedService, currentStep } = useBookingStore.getState();
      const returnTo = buildBookingReturnToUrl('/booking/review', {
        currentStep: currentStep,
        serviceSlug: selectedService?.slug,
      });
      router.push(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    
    setIsSaving(true);
    try {
      // Build the payload from the store via a single composer
      const { composeDraftPayload } = useBookingStore.getState();
      const payload = composeDraftPayload();
      
      // Add cleaner selection to payload
      const payloadWithCleaner = {
        ...payload,
        selectedCleanerId: cleaner.selectedCleanerId || undefined,
        autoAssign: cleaner.autoAssign
      };
      
      // Get the current session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        authHeaders['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      // POST /api/bookings/draft
      const response = await fetch('/api/bookings/draft', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payloadWithCleaner),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // If 200 (existing draft) or 201 (new draft) → navigate to /booking/review
        const bookingId = result.bookingId;
        if (bookingId) {
          router.push(`/booking/review?bookingId=${bookingId}`);
        } else {
          router.push('/booking/review');
        }
      } else if (response.status === 409) {
        // Handle 409 as success - fetch existing draft and continue
        try {
          const existingResponse = await fetch('/api/bookings/draft', {
            method: 'GET',
            headers: authHeaders,
          });
          
          if (existingResponse.ok) {
            const existingResult = await existingResponse.json();
            const bookingId = existingResult.bookingId;
            if (bookingId) {
              router.push(`/booking/review?bookingId=${bookingId}`);
            } else {
              router.push('/booking/review');
            }
          } else {
            // Fallback to review page without bookingId
            router.push('/booking/review');
          }
        } catch {
          // Fallback to review page without bookingId
          router.push('/booking/review');
        }
      } else {
        // If 400/401/500 → show field-specific messages from the response
        const errorMessage = result.message || result.error || `HTTP ${response.status}`;
        setInlineError(errorMessage);
      }
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create booking draft";
      console.error('Error creating booking draft:', errorMessage);
      setInlineError(errorMessage);
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

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading state if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

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
        cleaner.autoAssign 
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              cleaner.autoAssign ? 'bg-blue-600' : 'bg-blue-500'
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
              cleaner.autoAssign 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {cleaner.autoAssign ? 'Selected' : 'Auto-assign'}
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
          {cleaner.availableCleaners.length > 0 && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{cleaner.availableCleaners.length} available</span>
            </div>
          )}
        </div>

        {/* Inline error display */}
        {inlineError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{inlineError}</p>
            </div>
          </div>
        )}

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
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Unable to Load Cleaners
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="mr-2"
              >
                Try Again
              </Button>
              <p className="text-sm text-red-600">
                You can still continue with <span className="font-medium">Auto-assign Best Match</span> above.
              </p>
            </div>
          </Card>
        )}

        {/* Empty state */}
        {!isLoading && !error && cleaner.availableCleaners.length === 0 && (
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
        {!isLoading && !error && cleaner.availableCleaners.length > 0 && (
          <div className="space-y-4">
            {cleaner.availableCleaners.map((cleanerItem) => (
              <CleanerCard
                key={cleanerItem.id}
                cleaner={cleanerItem}
                isSelected={cleaner.selectedCleanerId === cleanerItem.id}
                onSelect={handleCleanerSelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selected cleaner summary */}
      {(cleaner.selectedCleanerId || cleaner.autoAssign) && (
        <Card className={`p-4 border-2 ${
          cleaner.autoAssign 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              cleaner.autoAssign ? 'bg-blue-500' : 'bg-green-500'
            }`}>
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className={`font-semibold ${
                cleaner.autoAssign ? 'text-blue-800' : 'text-green-800'
              }`}>
                {cleaner.autoAssign ? 'Auto-assign Selected' : 'Cleaner Selected Successfully'}
              </p>
              <p className={`text-sm ${
                cleaner.autoAssign ? 'text-blue-600' : 'text-green-600'
              }`}>
                {cleaner.autoAssign 
                  ? 'We\'ll assign the best available cleaner for your booking'
                  : 'Your booking will be confirmed with the selected cleaner'
                }
              </p>
            </div>
          </div>
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
          disabled={!canContinue || isSaving}
          className="px-8"
          aria-disabled={!canContinue || isSaving}
          aria-label={
            canContinue 
              ? 'Continue to Booking' 
              : 'Select a cleaner to continue'
          }
        >
          {isSaving 
            ? 'Saving...' 
            : canContinue 
              ? 'Continue to Booking' 
              : 'Select a cleaner to continue'
          }
        </Button>
      </div>
    </div>
  );
}
