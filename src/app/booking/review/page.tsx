'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, 
  CreditCard, 
  AlertCircle, 
  Loader2, 
  User, 
  MapPin, 
  Home, 
  Calendar,
  Clock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBookingStore } from '@/lib/stores/booking-store';
import { useRequireAuth } from '@/hooks/useAuth';
import { formatZAR } from '@/lib/format';

export default function BookingReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const _bookingId = searchParams.get('bookingId');
  
  const { loading: authLoading, isAuthenticated, user } = useRequireAuth();
  const {
    selectedService,
    rooms,
    extras,
    location,
    scheduling,
    cleaner,
    customerInfo,
    pricing,
    validateBookingData,
    createDraftBooking,
  } = useBookingStore();

  const [_isLoading, _setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  
  // Contact information form state
  const [contactInfo, setContactInfo] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    // Validate form whenever contact info changes
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
    }
    
    setFormErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  }, [contactInfo]);

  const handleContactInfoChange = (field: string, value: string) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async () => {
    if (!isFormValid) {
      setError('Please fill in all required contact information');
      return;
    }

    try {
      // Validate booking data
      validateBookingData();
      
      setIsPaymentLoading(true);
      setError(null);

      // Create or update draft booking
      const draftResult = await createDraftBooking();
      
      if (!draftResult.success) {
        throw new Error(draftResult.error || 'Failed to create booking');
      }

      // Initiate payment
      const paymentResponse = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: draftResult.id,
          amount: pricing.totalPrice,
          customerInfo: contactInfo,
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || 'Payment initiation failed');
      }

      const paymentData = await paymentResponse.json();
      
      // Redirect to Paystack payment page
      if (paymentData.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
      } else {
        throw new Error('Payment URL not received');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      console.error('Payment error:', err);
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push('/auth/login?returnTo=' + encodeURIComponent('/booking/review'));
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="mb-4 flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Review Your Booking
          </h1>
          <p className="text-gray-600">
            Please review your booking details and complete your payment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  Service Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedService?.name}</h3>
                  <p className="text-gray-600 text-sm">{selectedService?.description}</p>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{rooms.bedrooms} bedroom{rooms.bedrooms !== 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>{rooms.bathrooms} bathroom{rooms.bathrooms !== 1 ? 's' : ''}</span>
                </div>

                {extras.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Additional Services</h4>
                    <div className="space-y-1">
                      {extras.map((extra) => (
                        <div key={extra.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {extra.name} × {extra.quantity}
                          </span>
                          <span className="font-medium">
                            {formatZAR(extra.price * extra.quantity * 100)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location & Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Location & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Service Address</h4>
                  <p className="text-gray-600 text-sm">
                    {location.address}
                    {location.address2 && <><br />{location.address2}</>}
                    <br />
                    {location.postcode}
                  </p>
                </div>

                {scheduling.selectedDate && scheduling.selectedTime && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(scheduling.selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>{scheduling.selectedTime}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cleaner Selection */}
            {cleaner.selectedCleanerId && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Your Cleaner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {cleaner.autoAssign ? 'Auto-assigned Cleaner' : 'Selected Cleaner'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {cleaner.autoAssign 
                          ? 'We\'ll assign the best available cleaner'
                          : 'Your preferred cleaner has been selected'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Special Instructions */}
            {customerInfo.specialInstructions && (
              <Card>
                <CardHeader>
                  <CardTitle>Special Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{customerInfo.specialInstructions}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={contactInfo.name}
                    onChange={(e) => handleContactInfoChange('name', e.target.value)}
                    className={formErrors.name ? 'border-red-500' : ''}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs">{formErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => handleContactInfoChange('email', e.target.value)}
                    className={formErrors.email ? 'border-red-500' : ''}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs">{formErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                    className={formErrors.phone ? 'border-red-500' : ''}
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-xs">{formErrors.phone}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base service</span>
                  <span>{formatZAR((selectedService?.base_fee || 0) * 100)}</span>
                </div>

                {rooms.bedrooms > 1 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Additional bedrooms (×{rooms.bedrooms - 1})</span>
                    <span>+{formatZAR((rooms.bedrooms - 1) * 20 * 100)}</span>
                  </div>
                )}

                {rooms.bathrooms > 1 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Additional bathrooms (×{rooms.bathrooms - 1})</span>
                    <span>+{formatZAR((rooms.bathrooms - 1) * 15 * 100)}</span>
                  </div>
                )}

                {pricing.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery fee</span>
                    <span>+{formatZAR(pricing.deliveryFee * 100)}</span>
                  </div>
                )}

                {extras.length > 0 && (
                  <>
                    <Separator />
                    {extras.map((extra) => (
                      <div key={extra.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{extra.name} × {extra.quantity}</span>
                        <span>+{formatZAR(extra.price * extra.quantity * 100)}</span>
                      </div>
                    ))}
                  </>
                )}

                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-blue-600">
                    {formatZAR(pricing.totalPrice * 100)}
                  </span>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {/* Payment Button */}
                <Button
                  onClick={handlePayment}
                  disabled={!isFormValid || isPaymentLoading}
                  className="w-full mt-4"
                  size="lg"
                >
                  {isPaymentLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}