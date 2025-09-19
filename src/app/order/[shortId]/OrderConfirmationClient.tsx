'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  Calendar, 
  User, 
  Home, 
  Star,
  Download,
  ArrowLeft,
  CreditCard
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface BookingItem {
  id: string;
  service_item_id: string;
  item_type: string;
  qty: number;
  unit_price: number;
  subtotal: number;
}

interface Service {
  id: string;
  name: string;
  description: string;
  base_fee: number;
}

interface Suburb {
  id: string;
  name: string;
}

interface Cleaner {
  id: string;
  name: string;
  rating: number;
  total_ratings: number;
}

interface Booking {
  id: string;
  short_id: string;
  customer_id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  cleaner_id?: string;
  suburb_id: string;
  service_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number;
  address?: string;
  postcode?: string;
  bedrooms?: number;
  bathrooms?: number;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
  booking_items: BookingItem[];
  services: Service;
  suburbs: Suburb;
  cleaners?: Cleaner;
}

interface OrderConfirmationClientProps {
  booking: Booking;
}

export default function OrderConfirmationClient({ booking }: OrderConfirmationClientProps) {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownloadReceipt = async () => {
    setIsDownloading(true);
    try {
      // TODO: Implement receipt download functionality
      console.log('Downloading receipt for booking:', booking.short_id);
    } catch (error) {
      console.error('Failed to download receipt:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleViewBookings = () => {
    router.push('/account');
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Booking Confirmed!
        </h1>
        <p className="text-gray-600 mb-4">
          Thank you for choosing Shalean Services. Your booking has been successfully confirmed.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
          <CreditCard className="w-4 h-4 mr-2" />
          Order #{booking.short_id}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Home className="w-5 h-5 mr-2 text-blue-600" />
              Service Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">{booking.services.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bedrooms:</span>
                <span className="font-medium">{booking.bedrooms || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bathrooms:</span>
                <span className="font-medium">{booking.bathrooms || 'N/A'}</span>
              </div>
              {booking.booking_items.length > 0 && (
                <div>
                  <span className="text-gray-600">Extras:</span>
                  <ul className="mt-1 space-y-1">
                    {booking.booking_items
                      .filter(item => item.item_type === 'extra')
                      .map((item) => (
                        <li key={item.id} className="text-sm">
                          {item.service_item_id} × {item.qty}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>

          {/* Schedule Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-600" />
              Schedule
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formatDate(booking.booking_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">
                  {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium text-right max-w-xs">
                  {booking.address}
                  {booking.postcode && `, ${booking.postcode}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Area:</span>
                <span className="font-medium">{booking.suburbs.name}</span>
              </div>
              {booking.special_instructions && (
                <div>
                  <span className="text-gray-600">Special Instructions:</span>
                  <p className="mt-1 text-sm">{booking.special_instructions}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Cleaner Information */}
          {booking.cleaners && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-600" />
                Assigned Cleaner
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cleaner:</span>
                  <span className="font-medium">{booking.cleaners.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <span className="font-medium">
                    ⭐ {booking.cleaners.rating} ({booking.cleaners.total_ratings} reviews)
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Customer Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-600" />
              Contact Information
            </h2>
            <div className="space-y-3">
              {booking.customer_name && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{booking.customer_name}</span>
                </div>
              )}
              {booking.customer_email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{booking.customer_email}</span>
                </div>
              )}
              {booking.customer_phone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{booking.customer_phone}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Payment Summary & Actions */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
              Payment Summary
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span>R{booking.services.base_fee}</span>
              </div>
              
              {booking.booking_items.length > 0 && (
                <>
                  <Separator />
                  {booking.booking_items
                    .filter(item => item.item_type === 'extra')
                    .map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.service_item_id} × {item.qty}:</span>
                        <span>R{item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                </>
              )}
              
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Paid:</span>
                <span>R{booking.total_price.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button 
                onClick={handleDownloadReceipt}
                disabled={isDownloading}
                className="w-full"
                variant="outline"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download Receipt
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleViewBookings}
                className="w-full"
              >
                View All Bookings
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleGoHome}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>

            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Booking Status:</strong> {booking.status}
              </p>
              <p className="text-sm text-green-700 mt-1">
                You will receive a confirmation email shortly with all the details.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
