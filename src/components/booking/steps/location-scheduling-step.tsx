'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
    formState: { errors },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
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
    if (watchedDate && selectedSuburb) {
      setLoadingTimes(true);
      
      fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          suburb_id: selectedSuburb,
          date: watchedDate,
          service_duration: 120, // 2 hours default
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.available_slots) {
            setAvailableTimes(data.available_slots.map((slot: { time: string }) => slot.time));
          } else {
            setAvailableTimes([]);
          }
          setLoadingTimes(false);
        })
        .catch(err => {
          console.error('Error fetching available times:', err);
          setAvailableTimes([]);
          setLoadingTimes(false);
        });
    } else {
      setAvailableTimes([]);
    }
  }, [watchedDate, selectedSuburb]);

  const onSubmit = (data: LocationFormData) => {
    setSelectedRegion(data.region);
    setSelectedSuburb(data.suburb);
    setSelectedDate(data.date);
    setSelectedTime(data.time);
    setAddress(data.address);
    setAddress2(data.address2 || '');
    setPostcode(data.postcode);
    setSpecialInstructions(data.specialInstructions || '');
  };


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
                <Select
                  value={watchedRegion}
                  onValueChange={(value) => {
                    setValue('region', value);
                    setValue('suburb', '');
                    setSelectedRegion(value);
                  }}
                >
                  <SelectTrigger>
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
                {errors.region && (
                  <p className="text-red-500 text-sm mt-1">{errors.region.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suburb *
                </label>
                <Select
                  value={watch('suburb')}
                  onValueChange={(value) => {
                    setValue('suburb', value);
                    setSelectedSuburb(value);
                  }}
                  disabled={!watchedRegion || loadingSuburbs}
                >
                  <SelectTrigger>
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
                />
                {errors.postcode && (
                  <p className="text-red-500 text-sm mt-1">{errors.postcode.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date & Time Selection */}
        <DateTimePicker
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onDateChange={setSelectedDate}
          onTimeChange={setSelectedTime}
          availableTimes={availableTimes}
          loadingTimes={loadingTimes}
        />

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
      </form>
    </div>
  );
}
