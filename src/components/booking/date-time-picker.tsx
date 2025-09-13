'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { format, addDays, isSameDay, isBefore, isAfter } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface DateTimePickerProps {
  selectedDate: string | null;
  selectedTime: string | null;
  onDateChange: (date: string | null) => void;
  onTimeChange: (time: string | null) => void;
  availableTimes?: string[];
  loadingTimes?: boolean;
  disabledDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
}

export function DateTimePicker({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  availableTimes = [],
  loadingTimes = false,
  disabledDates = [],
  minDate = new Date(),
  maxDate = addDays(new Date(), 60), // 60 days from now
}: DateTimePickerProps) {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate) : undefined
  );

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour += 2) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(time);
    }
    return slots;
  };

  const allTimeSlots = generateTimeSlots();

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDay(date);
      onDateChange(format(date, 'yyyy-MM-dd'));
      setIsCalendarOpen(false);
      // Reset time when date changes
      onTimeChange(null);
    }
  };

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    onTimeChange(time);
  };

  // Check if a date is disabled
  const isDateDisabled = (date: Date) => {
    // Disable past dates
    if (isBefore(date, minDate)) return true;
    
    // Disable future dates beyond maxDate
    if (isAfter(date, maxDate)) return true;
    
    // Disable specific disabled dates
    return disabledDates.some(disabledDate => isSameDay(date, disabledDate));
  };

  // Get available times for selected date
  const getAvailableTimes = () => {
    if (!selectedDate) return [];
    return availableTimes.length > 0 ? availableTimes : allTimeSlots;
  };

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Date Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Date *
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={selectedDate ? format(new Date(selectedDate), 'PPP') : ''}
                  placeholder="Click to select date"
                  readOnly
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="cursor-pointer"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Calendar */}
            {isCalendarOpen && (
              <div className="border rounded-lg p-4 bg-white shadow-lg">
                <DayPicker
                  mode="single"
                  selected={selectedDay}
                  onSelect={handleDateSelect}
                  disabled={isDateDisabled}
                  fromDate={minDate}
                  toDate={maxDate}
                  className="rdp"
                  classNames={{
                    day: 'rdp-day',
                    day_selected: 'rdp-day_selected',
                    day_disabled: 'rdp-day_disabled',
                    day_today: 'rdp-day_today',
                  }}
                />
              </div>
            )}

            {/* Quick Date Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDateSelect(new Date())}
                disabled={isDateDisabled(new Date())}
              >
                Today
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDateSelect(addDays(new Date(), 1))}
                disabled={isDateDisabled(addDays(new Date(), 1))}
              >
                Tomorrow
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDateSelect(addDays(new Date(), 7))}
                disabled={isDateDisabled(addDays(new Date(), 7))}
              >
                Next Week
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Selection */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Select Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time *
                </label>
                {loadingTimes ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading available times...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {getAvailableTimes().map((time) => {
                      const isAvailable = availableTimes.length === 0 || availableTimes.includes(time);
                      const isSelected = selectedTime === time;
                      
                      return (
                        <Button
                          key={time}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleTimeSelect(time)}
                          disabled={!isAvailable}
                          className={`${
                            isSelected 
                              ? 'bg-blue-600 text-white' 
                              : isAvailable 
                                ? 'hover:bg-blue-50' 
                                : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          {time}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>

              {availableTimes.length > 0 && (
                <div className="text-sm text-gray-600">
                  <p className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Available times for {format(new Date(selectedDate), 'PPP')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
