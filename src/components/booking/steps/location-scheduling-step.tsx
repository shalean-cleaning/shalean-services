'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';

import { DateTimePicker } from '@/components/booking/date-time-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Region, Suburb } from '@/lib/database.types';
import { useBookingStore } from '@/lib/stores/booking-store';

const locationSchema = z.object({
  region: z.string().min(1, 'Please select a region'),
  suburb: z.string().min(1, 'Please select a suburb'),
  address: z.string().min(5, 'Please enter a valid address'),
  address2: z.string().optional(),
  postcode: z.string().min(4, 'Please enter a valid postcode'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  specialInstructions: z.string().optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationSchedulingStepProps {
  regions: Region[];
}

export function LocationSchedulingStep({ regions }: LocationSchedulingStepProps) {
  const {
    selectedRegion,
    selectedSuburb,
    selectedDate,
    selectedTime,
    address,
    address2,
    postcode,
    specialInstructions,
    setSelectedRegion,
    setSelectedSuburb,
    setSelectedDate,
    setSelectedTime,
    setAddress,
    setAddress2,
    setPostcode,
    setSpecialInstructions,
    setCurrentStep,
  } = useBookingStore();

  const [suburbs, setSuburbs] = useState<Suburb[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingSuburbs, setLoadingSuburbs] = useState(false);
  const [loadingTimes, setLoadingTimes] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    mode: "onChange",
    defaultValues: {
      region: selectedRegion || '',
      suburb: selectedSuburb || '',
      address: address || '',
      address2: address2 || '',
      postcode: postcode || '',
      date: selectedDate || '',
      time: selectedTime || '',
      specialInstructions: specialInstructions || '',
    },
  });

  const watchedRegion = watch('region');
  const watchedDate = watch('date');
  const watchedSuburb = watch('suburb');

  // Fetch suburbs when region changes
  useEffect(() => {
    if (watchedRegion) {
      setLoadingSuburbs(true);
      fetch(`/api/suburbs?region_id=${watchedRegion}`)
        .then(res => res.json())
        .then(data => {
          setSuburbs(data);
          setLoadingSuburbs(false);
        })
        .catch(err => {
          console.error('Error fetching suburbs:', err);
          setLoadingSuburbs(false);
        });
    } else {
      setSuburbs([]);
    }
  }, [watchedRegion]);

  // Fetch available times when date changes
  useEffect(() => {
    if (watchedDate && watchedSuburb) {
      setLoadingTimes(true);
      
      fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          suburb_id: watchedSuburb,
          date: watchedDate,
          service_duration: 120, // 2 hours default
        }),
      })
        .then(res => {
          if (res.ok) {
            return res.json();
          } else {
            // If API fails, use default time slots
            console.warn('Availability API failed, using default time slots');
            return { available_slots: [] };
          }
        })
        .then(data => {
          if (data.available_slots && data.available_slots.length > 0) {
            setAvailableTimes(data.available_slots.map((slot: { time: string }) => slot.time));
          } else {
            // Use default time slots if no specific availability
            setAvailableTimes([]);
          }
          setLoadingTimes(false);
        })
        .catch(err => {
          console.error('Error fetching available times:', err);
          // Use default time slots on error
          setAvailableTimes([]);
          setLoadingTimes(false);
        });
    } else {
      setAvailableTimes([]);
    }
  }, [watchedDate, watchedSuburb]);

  const onSubmit = async (data: LocationFormData) => {
    // Persist all form data to the store
    setSelectedRegion(data.region);
    setSelectedSuburb(data.suburb);
    setSelectedDate(data.date);
    setSelectedTime(data.time);
    setAddress(data.address);
    setAddress2(data.address2 || '');
    setPostcode(data.postcode);
    setSpecialInstructions(data.specialInstructions || '');
    
    // Advance to next step
    setCurrentStep(5);
  };

  const handlePrevious = () => {
    setCurrentStep(3);
  };

  const ready = !loadingSuburbs && !loadingTimes;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Location & Scheduling</h2>
        <p className="text-gray-600">Tell us where and when you&apos;d like your cleaning service</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Location Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Service Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region *
                </label>
                <Controller
                  name="region"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setValue('suburb', '');
                        setSelectedRegion(value);
                      }}
                    >
                      <SelectTrigger className={errors.region ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select your region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name}, {region.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.region && (
                  <p className="text-red-500 text-sm mt-1">{errors.region.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suburb *
                </label>
                <Controller
                  name="suburb"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedSuburb(value);
                      }}
                      disabled={!watchedRegion || loadingSuburbs}
                    >
                      <SelectTrigger className={errors.suburb ? 'border-red-500' : ''}>
                        <SelectValue placeholder={loadingSuburbs ? "Loading..." : "Select your suburb"} />
                      </SelectTrigger>
                      <SelectContent>
                        {suburbs.map((suburb) => (
                          <SelectItem key={suburb.id} value={suburb.id}>
                            {suburb.name} {suburb.postcode && `(${suburb.postcode})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.suburb && (
                  <p className="text-red-500 text-sm mt-1">{errors.suburb.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <Input
                  {...register('address')}
                  placeholder="123 Main Street"
                  className={errors.address ? 'border-red-500' : ''}
                  aria-invalid={!!errors.address}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apartment, Suite, etc. (Optional)
                </label>
                <Input
                  {...register('address2')}
                  placeholder="Apt 4B, Unit 12, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postcode *
                </label>
                <Input
                  {...register('postcode')}
                  placeholder="2000"
                  className={errors.postcode ? 'border-red-500' : ''}
                  aria-invalid={!!errors.postcode}
                />
                {errors.postcode && (
                  <p className="text-red-500 text-sm mt-1">{errors.postcode.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date & Time Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time *
            </label>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <Controller
                  name="time"
                  control={control}
                  render={({ field: timeField }) => (
                    <DateTimePicker
                      selectedDate={field.value}
                      selectedTime={timeField.value}
                      onDateChange={(date) => {
                        field.onChange(date);
                        setSelectedDate(date);
                        // Reset time when date changes
                        timeField.onChange('');
                        setSelectedTime(null);
                      }}
                      onTimeChange={(time) => {
                        timeField.onChange(time);
                        setSelectedTime(time);
                      }}
                      availableTimes={availableTimes}
                      loadingTimes={loadingTimes}
                    />
                  )}
                />
              )}
            />
            {(errors.date || errors.time) && (
              <div className="mt-2">
                {errors.date && (
                  <p className="text-red-500 text-sm">{errors.date.message}</p>
                )}
                {errors.time && (
                  <p className="text-red-500 text-sm">{errors.time.message}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Special Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions (Optional)
              </label>
              <textarea
                {...register('specialInstructions')}
                placeholder="Any special requests, access instructions, or notes for our cleaner?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <button
            type="button"
            onClick={handlePrevious}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Previous
          </button>

          <button
            type="submit"
            disabled={!isValid || isSubmitting || !ready}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
}
