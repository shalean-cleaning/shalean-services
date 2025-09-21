'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, CheckCircle, ArrowRight } from 'lucide-react';

interface Quote {
  id: string;
  short_id: string;
  service_id: string;
  bedrooms: number;
  bathrooms: number;
  extras: Array<{
    extra_id: string;
    quantity: number;
    price: number;
  }>;
  frequency: string;
  area_id: string;
  total_estimate: number;
  email: string;
  created_at: string;
  services: {
    id: string;
    name: string;
    description: string;
    base_fee: number;
    slug: string;
  };
  suburbs: {
    id: string;
    name: string;
    slug: string;
  };
}

interface QuoteDetailClientProps {
  quote: Quote;
}

export default function QuoteDetailClient({ quote }: QuoteDetailClientProps) {
  const router = useRouter();
  const [isBooking, setIsBooking] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleBookNow = async () => {
    setIsBooking(true);
    try {
      // Redirect to booking flow with pre-filled service
      router.push(`/booking/service/${quote.services.slug}?quote=${quote.short_id}`);
    } catch (error) {
      console.error('Error redirecting to booking:', error);
    } finally {
      setIsBooking(false);
    }
  };

  const handleGetNewQuote = () => {
    router.push('/quote');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Your Cleaning Quote</h1>
        <p className="mt-2 text-gray-600">
          Generated on {formatDate(quote.created_at)}
        </p>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 mt-2">
          Quote #{quote.short_id}
        </span>
      </div>

      {/* Service Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Service Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{quote.services.name}</h3>
            <p className="text-gray-600">{quote.services.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {quote.bedrooms} bedroom{quote.bedrooms !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {quote.bathrooms} bathroom{quote.bathrooms !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{quote.suburbs.name}</span>
            </div>
          </div>

          {quote.frequency && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Frequency:</strong> {quote.frequency}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extras */}
      {quote.extras && quote.extras.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quote.extras.map((extra, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm">
                    {extra.quantity > 1 && `${extra.quantity}x `}
                    Extra Service
                  </span>
                  <span className="text-sm font-medium">
                    {formatCurrency(extra.price * extra.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Base Service Fee</span>
              <span>{formatCurrency(quote.services.base_fee)}</span>
            </div>
            
            {quote.extras && quote.extras.length > 0 && (
              <div className="flex justify-between">
                <span>Additional Services</span>
                <span>
                  {formatCurrency(
                    quote.extras.reduce((sum, extra) => sum + (extra.price * extra.quantity), 0)
                  )}
                </span>
              </div>
            )}
            
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Estimate</span>
                <span className="text-green-600">{formatCurrency(quote.total_estimate)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What's Included */}
      <Card>
        <CardHeader>
          <CardTitle>What's Included</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Professional cleaning equipment and supplies
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Insured and background-checked cleaners
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              100% satisfaction guarantee
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Flexible scheduling
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={handleBookNow} 
          disabled={isBooking}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isBooking ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Redirecting...
            </>
          ) : (
            <>
              Book This Service
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleGetNewQuote}
          className="flex-1"
        >
          Get New Quote
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={handleGoHome}
          className="flex-1"
        >
          Back to Home
        </Button>
      </div>

      {/* Contact Info */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-gray-600">
            <p>Questions about this quote?</p>
            <p className="mt-1">
              Contact us at <strong>{quote.email}</strong> or call our support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
