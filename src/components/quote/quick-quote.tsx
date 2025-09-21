'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Calculator, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Types
interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_fee: number;
  base_price: number;
  per_bedroom: number;
  per_bathroom: number;
  service_fee_flat: number;
  service_fee_pct: number;
}

interface Extra {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
}

interface Area {
  id: string;
  name: string;
  slug: string;
  price_adjustment_pct: number;
  delivery_fee: number;
}

interface FrequencyDiscount {
  frequency: string;
  discount_pct: number;
}

interface QuoteState {
  serviceId: string | null;
  bedrooms: number;
  bathrooms: number;
  selectedExtras: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  frequency: string;
  areaId: string | null;
  email: string;
}

interface PriceBreakdown {
  basePrice: number;
  roomPrice: number;
  extrasPrice: number;
  frequencyDiscount: number;
  areaAdjustment: number;
  serviceFee: number;
  total: number;
}

interface QuickQuoteProps {
  onClose?: () => void;
  isModal?: boolean;
}

export function QuickQuote({ onClose, isModal: _isModal = false }: QuickQuoteProps) {
  const router = useRouter();
  
  // State
  const [services, setServices] = useState<Service[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [frequencyDiscounts, setFrequencyDiscounts] = useState<FrequencyDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [quoteState, setQuoteState] = useState<QuoteState>({
    serviceId: null,
    bedrooms: 1,
    bathrooms: 1,
    selectedExtras: [],
    frequency: 'one-time',
    areaId: null,
    email: '',
  });

  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown>({
    basePrice: 0,
    roomPrice: 0,
    extrasPrice: 0,
    frequencyDiscount: 0,
    areaAdjustment: 0,
    serviceFee: 0,
    total: 0,
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all required data in parallel
        const [servicesRes, extrasRes, areasRes, frequencyRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/extras'),
          fetch('/api/suburbs'),
          fetch('/api/frequency-discounts'),
        ]);

        if (!servicesRes.ok || !extrasRes.ok || !areasRes.ok || !frequencyRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [servicesData, extrasData, areasData, frequencyData] = await Promise.all([
          servicesRes.json(),
          extrasRes.json(),
          areasRes.json(),
          frequencyRes.json(),
        ]);

        setServices(servicesData.services || []);
        setExtras(extrasData || []);
        setAreas(areasData || []);
        setFrequencyDiscounts(frequencyData || []);
        
        // Set default service if available
        if (servicesData.services?.length > 0) {
          setQuoteState(prev => ({
            ...prev,
            serviceId: servicesData.services[0].id,
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load quote data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate price breakdown
  const calculatePrice = useCallback(() => {
    const service = services.find(s => s.id === quoteState.serviceId);
    const area = areas.find(a => a.id === quoteState.areaId);
    const frequencyDiscount = frequencyDiscounts.find(f => f.frequency === quoteState.frequency);

    if (!service) {
      setPriceBreakdown({
        basePrice: 0,
        roomPrice: 0,
        extrasPrice: 0,
        frequencyDiscount: 0,
        areaAdjustment: 0,
        serviceFee: 0,
        total: 0,
      });
      return;
    }

    // Base price
    const basePrice = service.base_price || service.base_fee || 0;
    
    // Room pricing
    const roomPrice = 
      (Math.max(0, quoteState.bedrooms - 1) * service.per_bedroom) +
      (Math.max(0, quoteState.bathrooms - 1) * service.per_bathroom);
    
    // Extras pricing
    const extrasPrice = quoteState.selectedExtras.reduce(
      (total, extra) => total + (extra.price * extra.quantity),
      0
    );
    
    // Subtotal before discounts and adjustments
    const subtotal = basePrice + roomPrice + extrasPrice;
    
    // Frequency discount
    const frequencyDiscountAmount = frequencyDiscount 
      ? (subtotal * frequencyDiscount.discount_pct) / 100 
      : 0;
    
    // Area adjustment
    const areaAdjustmentAmount = area 
      ? (subtotal * area.price_adjustment_pct) / 100 
      : 0;
    
    // Service fee
    const serviceFee = service.service_fee_flat + (subtotal * service.service_fee_pct) / 100;
    
    // Total
    const total = subtotal - frequencyDiscountAmount + areaAdjustmentAmount + serviceFee;

    setPriceBreakdown({
      basePrice,
      roomPrice,
      extrasPrice,
      frequencyDiscount: frequencyDiscountAmount,
      areaAdjustment: areaAdjustmentAmount,
      serviceFee,
      total: Math.max(0, total),
    });
  }, [services, areas, frequencyDiscounts, quoteState]);

  // Recalculate price when quote state changes
  useEffect(() => {
    calculatePrice();
  }, [calculatePrice]);

  // Handle service selection
  const handleServiceChange = (serviceId: string) => {
    setQuoteState(prev => ({ ...prev, serviceId }));
  };

  // Handle room count changes
  const handleRoomChange = (type: 'bedrooms' | 'bathrooms', value: number) => {
    setQuoteState(prev => ({
      ...prev,
      [type]: Math.max(1, value),
    }));
  };

  // Handle extra selection
  const handleExtraChange = (extra: Extra, checked: boolean) => {
    setQuoteState(prev => {
      if (checked) {
        return {
          ...prev,
          selectedExtras: [
            ...prev.selectedExtras,
            { id: extra.id, name: extra.name, price: extra.price, quantity: 1 },
          ],
        };
      } else {
        return {
          ...prev,
          selectedExtras: prev.selectedExtras.filter(e => e.id !== extra.id),
        };
      }
    });
  };

  // Handle extra quantity change
  const handleExtraQuantityChange = (extraId: string, quantity: number) => {
    if (quantity <= 0) {
      setQuoteState(prev => ({
        ...prev,
        selectedExtras: prev.selectedExtras.filter(e => e.id !== extraId),
      }));
      return;
    }

    setQuoteState(prev => ({
      ...prev,
      selectedExtras: prev.selectedExtras.map(e =>
        e.id === extraId ? { ...e, quantity } : e
      ),
    }));
  };

  // Handle frequency change
  const handleFrequencyChange = (frequency: string) => {
    setQuoteState(prev => ({ ...prev, frequency }));
  };

  // Handle area change
  const handleAreaChange = (areaId: string) => {
    setQuoteState(prev => ({ ...prev, areaId }));
  };

  // Handle email change
  const handleEmailChange = (email: string) => {
    setQuoteState(prev => ({ ...prev, email }));
  };

  // Handle email quote submission
  const handleEmailQuote = async () => {
    if (!quoteState.email || !quoteState.serviceId || !quoteState.areaId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: quoteState.email,
          service_id: quoteState.serviceId,
          area_id: quoteState.areaId,
          bedrooms: quoteState.bedrooms,
          bathrooms: quoteState.bathrooms,
          frequency: quoteState.frequency,
          extras: quoteState.selectedExtras,
          total_price: priceBreakdown.total,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save quote');
      }

      toast.success('Quote sent to your email!');
      if (onClose) onClose();
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('Failed to send quote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle continue to booking
  const handleContinueToBooking = () => {
    if (!quoteState.serviceId || !quoteState.areaId) {
      toast.error('Please select a service and location');
      return;
    }

    // Store quote state in session storage for booking flow
    sessionStorage.setItem('quoteState', JSON.stringify(quoteState));
    
    // Navigate to booking flow
    const service = services.find(s => s.id === quoteState.serviceId);
    if (service) {
      router.push(`/booking/service/${service.slug}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading quote data...</span>
      </div>
    );
  }

  if (services.length === 0 || areas.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Unable to load quote data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quote Form */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Get Your Free Quote</h2>
            <p className="text-muted-foreground">
              Select your service, rooms, and location to see an instant price estimate.
            </p>
          </div>

          {/* Service + Rooms Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Service & Rooms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Service</label>
                <Select value={quoteState.serviceId || ''} onValueChange={handleServiceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a cleaning service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - From R{service.base_price || service.base_fee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Bedrooms</label>
                  <Input
                    type="number"
                    min="1"
                    value={quoteState.bedrooms}
                    onChange={(e) => handleRoomChange('bedrooms', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Bathrooms</label>
                  <Input
                    type="number"
                    min="1"
                    value={quoteState.bathrooms}
                    onChange={(e) => handleRoomChange('bathrooms', parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Extras Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">2. Add Extras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {extras.map((extra) => {
                const selectedExtra = quoteState.selectedExtras.find(e => e.id === extra.id);
                const isSelected = !!selectedExtra;
                
                return (
                  <div key={extra.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleExtraChange(extra, checked as boolean)}
                      />
                      <div>
                        <div className="font-medium">{extra.name}</div>
                        <div className="text-sm text-muted-foreground">{extra.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">R{extra.price}</span>
                      {isSelected && (
                        <Input
                          type="number"
                          min="1"
                          value={selectedExtra.quantity}
                          onChange={(e) => handleExtraQuantityChange(extra.id, parseInt(e.target.value) || 1)}
                          className="w-16 h-8"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Frequency + Location Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">3. Frequency & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Frequency</label>
                <Select value={quoteState.frequency} onValueChange={handleFrequencyChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Select value={quoteState.areaId || ''} onValueChange={handleAreaChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your area" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Price Summary */}
        <div className="space-y-6">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Price Estimate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Base price</span>
                    <span>R{priceBreakdown.basePrice.toFixed(2)}</span>
                  </div>
                  {priceBreakdown.roomPrice > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Additional rooms</span>
                      <span>R{priceBreakdown.roomPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {priceBreakdown.extrasPrice > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Extras</span>
                      <span>R{priceBreakdown.extrasPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {priceBreakdown.frequencyDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Frequency discount</span>
                      <span>-R{priceBreakdown.frequencyDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {priceBreakdown.areaAdjustment !== 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Area adjustment</span>
                      <span>
                        {priceBreakdown.areaAdjustment > 0 ? '+' : ''}
                        R{priceBreakdown.areaAdjustment.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {priceBreakdown.serviceFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Service fee</span>
                      <span>R{priceBreakdown.serviceFee.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>R{priceBreakdown.total.toFixed(2)}</span>
                </div>

                {/* What's Included Section */}
                {quoteState.serviceId && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">What's Included:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Professional cleaning service</li>
                      <li>• All cleaning supplies and equipment</li>
                      <li>• {quoteState.bedrooms} bedroom{quoteState.bedrooms > 1 ? 's' : ''} and {quoteState.bathrooms} bathroom{quoteState.bathrooms > 1 ? 's' : ''}</li>
                      {quoteState.selectedExtras.length > 0 && (
                        <li>• {quoteState.selectedExtras.length} extra service{quoteState.selectedExtras.length > 1 ? 's' : ''}</li>
                      )}
                      <li>• 100% satisfaction guarantee</li>
                    </ul>
                  </div>
                )}

                {/* Email Quote */}
                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Enter your email for quote"
                    value={quoteState.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                  />
                  <Button
                    onClick={handleEmailQuote}
                    disabled={submitting || !quoteState.email || !quoteState.serviceId || !quoteState.areaId}
                    className="w-full"
                    variant="outline"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    Email me this Quote
                  </Button>
                </div>

                {/* Continue to Booking */}
                <Button
                  onClick={handleContinueToBooking}
                  disabled={!quoteState.serviceId || !quoteState.areaId}
                  className="w-full"
                  size="lg"
                >
                  Continue to Booking
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
