'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CreditCard, CheckCircle, AlertCircle, Loader2, User, MapPin, Home, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBookingStore } from '@/lib/stores/booking-store';
import { useRequireAuth } from '@/hooks/useAuth';
import { initiatePaymentAction } from '@/lib/actions/payments';
import { createClient } from '@/lib/supabase-client';

export function BookingReviewStep() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useRequireAuth();
  const supabase = createClient();
  const {
    selectedService,
    bedroomCount,
    bathroomCount,
    selectedExtras,
    selectedDate,
    selectedTime,
    selectedCleanerId,
    autoAssign,
    address,
    postcode,
    specialInstructions,
    totalPrice,
    availableCleaners,
    composeDraftPayload,
  } = useBookingStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftCreated, setDraftCreated] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'DRAFT' | 'PENDING' | 'READY_FOR_PAYMENT' | 'PAID' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>('DRAFT');
  const [bookingId, setBookingId] = useState<string | null>(null);
  
  // Contact information form state
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Handle authentication redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Redirect to login with return URL
      const currentUrl = window.location.pathname + window.location.search;
      router.push(`/auth/login?returnTo=${encodeURIComponent(currentUrl)}`);
    }
  }, [authLoading, isAuthenticated, router]);

  // Form validation
  useEffect(() => {
    const errors: Record<string, string> = {};
    
    if (!contactInfo.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!contactInfo.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!contactInfo.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[+]?[0-9\s\-()]{10,}$/.test(contactInfo.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    setFormErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  }, [contactInfo]);

  // Check if we need to redirect back to booking flow
  useEffect(() => {
    // If we have no booking data, redirect to start
    if (!selectedService) {
      router.push('/booking');
      return;
    }
  }, [selectedService, router]);

  // Check for existing draft or create/update draft on component mount
  useEffect(() => {
    const handleDraft = async () => {
      if (draftCreated) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Get the current session token for authentication
        const { data: { session } } = await supabase.auth.getSession();
        const authHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (session?.access_token) {
          authHeaders['Authorization'] = `Bearer ${session.access_token}`;
        }
        
        // First, try to get existing draft
        const getResponse = await fetch('/api/bookings/draft', {
          method: 'GET',
          headers: authHeaders,
        });
        
        if (getResponse.ok) {
          const getResult = await getResponse.json();
          if (getResult.success && getResult.bookingId) {
            setDraftCreated(true);
            setBookingId(getResult.bookingId);
            setBookingStatus('DRAFT'); // Default status for existing draft
            
            // Check if booking is already paid
            const statusResponse = await fetch(`/api/bookings/${getResult.bookingId}`, {
              headers: authHeaders,
            });
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              setBookingStatus(statusData.booking?.status || 'PENDING');
            }
            return;
          }
        }
        
        // If no existing draft, try to create/update with current data
        try {
          const payload = composeDraftPayload();
          
          // Add cleaner selection to payload
          const payloadWithCleaner = {
            ...payload,
            selectedCleanerId: selectedCleanerId || undefined,
            autoAssign: autoAssign
          };
          
          
          const response = await fetch('/api/bookings/draft', {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify(payloadWithCleaner),
          });
          
          const result = await response.json();
          
          if (response.ok) {
            setDraftCreated(true);
            setBookingId(result.bookingId);
            setBookingStatus('DRAFT');
            
            // Check if booking is already paid
            if (result.bookingId) {
              const statusResponse = await fetch(`/api/bookings/${result.bookingId}`, {
                headers: authHeaders,
              });
              if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                setBookingStatus(statusData.booking?.status || 'PENDING');
              }
            }
          } else {
            // Handle validation errors with user guidance
            if (response.status === 422 && result.details) {
              const missingFields = result.details.map((detail: any) => detail.field).join(', ');
              setError(`Please complete the following: ${missingFields}. Use the back button to return to the previous steps.`);
            } else {
              setError(result.message || result.error || `Failed to create booking draft (${response.status})`);
            }
          }
          
        } catch (payloadError) {
          // Handle composeDraftPayload errors (missing required fields)
          if (payloadError instanceof Error) {
            setError(`${payloadError.message}. Please use the back button to complete the missing information.`);
          } else {
            setError("Please complete all required fields. Use the back button to return to the previous steps.");
          }
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to access booking draft";
        setError(errorMessage);
        console.error('Error handling draft:', err);
      } finally {
        setIsLoading(false);
      }
    };

    handleDraft();
  }, [composeDraftPayload, selectedCleanerId, autoAssign, draftCreated, router]);


  const handleCompleteBooking = async () => {
    if (bookingStatus === 'PAID') {
      return; // Already paid, button should be disabled
    }

    // Validate form before proceeding
    if (!isFormValid) {
      setError('Please fill in all required contact information correctly.');
      return;
    }

    // Ensure we have a valid bookingId before proceeding
    if (!bookingId) {
      setError('We\'re preparing your booking. Please wait a moment and try again.');
      return;
    }

    setIsPaymentLoading(true);
    setError(null);

    try {
      // Use server action to initiate payment
      const result = await initiatePaymentAction({
        bookingId: bookingId,
        customerName: contactInfo.name,
        customerEmail: contactInfo.email,
        customerPhone: contactInfo.phone,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to initiate payment');
      }

      // Redirect to Paystack
      window.location.href = result.authorization_url!;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to initiate payment";
      setError(errorMessage);
      console.error('Payment initiation error:', err);
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handlePrevious = () => {
    router.back();
  };


  const selectedCleaner = selectedCleanerId 
    ? availableCleaners.find(c => c.id === selectedCleanerId)
    : null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto">
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
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Preparing your booking...</p>
        </div>
      </div>
    );
  }

  if (error && !bookingId) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Booking Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={handlePrevious}>
              Go Back
            </Button>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Review & Payment
        </h1>
        <p className="text-gray-600">
          Please review your booking details and provide contact information before completing payment
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 font-medium mb-2">Payment Error</p>
              <p className="text-red-600 text-sm">{error}</p>
              <div className="mt-3 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setError(null)}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  Dismiss
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Booking Summary & Contact Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Home className="w-5 h-5 mr-2 text-blue-600" />
              Service Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bedrooms:</span>
                <span className="font-medium">{bedroomCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bathrooms:</span>
                <span className="font-medium">{bathroomCount}</span>
              </div>
              {selectedExtras.length > 0 && (
                <div>
                  <span className="text-gray-600">Extras:</span>
                  <ul className="mt-1 space-y-1">
                    {selectedExtras.map((extra) => (
                      <li key={extra.id} className="text-sm">
                        {extra.name} × {extra.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>

          {/* Location & Time */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-green-600" />
              Location & Time
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{selectedDate && formatDate(selectedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{selectedTime && formatTime(selectedTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="font-medium text-right max-w-xs">
                  {address}
                  {postcode && `, ${postcode}`}
                </span>
              </div>
              {specialInstructions && (
                <div>
                  <span className="text-gray-600">Special Instructions:</span>
                  <p className="mt-1 text-sm">{specialInstructions}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Cleaner Selection */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-600" />
              Cleaner Assignment
            </h2>
            <div className="space-y-3">
              {autoAssign ? (
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="font-medium">Auto-assign best available cleaner</span>
                </div>
              ) : selectedCleaner ? (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="font-medium">Selected Cleaner</span>
                  </div>
                  <div className="ml-7 space-y-1">
                    <div className="font-medium">{selectedCleaner.name}</div>
                    <div className="text-sm text-gray-600">
                      ⭐ {selectedCleaner.rating} ({selectedCleaner.totalRatings} reviews)
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedCleaner.experienceYears} years experience
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">No cleaner selected</div>
              )}
            </div>
          </Card>

          {/* Contact Information Form */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-600" />
              Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={contactInfo.name}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                  className={formErrors.name ? 'border-red-500' : ''}
                  placeholder="Enter your full name"
                />
                {formErrors.name && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                  className={formErrors.email ? 'border-red-500' : ''}
                  placeholder="Enter your email address"
                />
                {formErrors.email && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className={formErrors.phone ? 'border-red-500' : ''}
                  placeholder="Enter your phone number"
                />
                {formErrors.phone && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.phone}</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Payment Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
              Payment Summary
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span>R{selectedService?.base_fee || 0}</span>
              </div>
              
              {selectedExtras.length > 0 && (
                <>
                  <Separator />
                  {selectedExtras.map((extra) => (
                    <div key={extra.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{extra.name} × {extra.quantity}:</span>
                      <span>R{(extra.price * extra.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </>
              )}
              
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>R{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {bookingStatus === 'PAID' ? (
                <Button 
                  disabled
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Already Paid
                </Button>
              ) : (
                <Button 
                  onClick={handleCompleteBooking}
                  disabled={isPaymentLoading || !bookingId || !isFormValid}
                  className="w-full"
                  size="lg"
                >
                  {isPaymentLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Complete Payment
                    </>
                  )}
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                className="w-full"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Cleaner Selection
              </Button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Secure Payment:</strong> Your payment information is encrypted and secure. We use Paystack for secure payment processing.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
