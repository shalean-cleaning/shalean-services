import { useState, useEffect } from 'react';

interface AvailableSlot {
  time: string;
  available_cleaners?: number;
  cleaner_ids?: string[];
}

interface UseAvailabilityResult {
  availableTimes: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAvailability(areaId: string | null, date: string | null): UseAvailabilityResult {
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = async () => {
    if (!areaId || !date) {
      setAvailableTimes([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          suburb_id: areaId,
          date,
          service_duration: 120, // Default 2 hours
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }

      const data = await response.json();
      
      if (data.available_slots && data.available_slots.length > 0) {
        setAvailableTimes(data.available_slots.map((slot: AvailableSlot) => slot.time));
      } else {
        setAvailableTimes([]);
      }
    } catch (err) {
      console.error('Error fetching available times:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch availability');
      setAvailableTimes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [areaId, date]);

  return {
    availableTimes,
    loading,
    error,
    refetch: fetchAvailability,
  };
}
