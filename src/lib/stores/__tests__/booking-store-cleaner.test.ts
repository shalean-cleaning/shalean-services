import { renderHook, act } from '@testing-library/react';
import { useBookingStore } from '../booking-store';

// Mock the persist middleware
jest.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
}));

describe('BookingStore - Cleaner Selection', () => {
  beforeEach(() => {
    // Reset store state before each test
    useBookingStore.setState({
      selectedCleanerId: null,
      autoAssign: false,
      availableCleaners: [],
    });
  });

  describe('setSelectedCleanerId', () => {
    it('sets the selected cleaner ID and clears auto-assign', () => {
      const { result } = renderHook(() => useBookingStore());
      
      act(() => {
        result.current.setSelectedCleanerId('cleaner-123');
      });
      
      expect(result.current.selectedCleanerId).toBe('cleaner-123');
      expect(result.current.autoAssign).toBe(false);
    });

    it('clears selected cleaner when set to null', () => {
      const { result } = renderHook(() => useBookingStore());
      
      // First set a cleaner
      act(() => {
        result.current.setSelectedCleanerId('cleaner-123');
      });
      
      // Then clear it
      act(() => {
        result.current.setSelectedCleanerId(null);
      });
      
      expect(result.current.selectedCleanerId).toBe(null);
    });
  });

  describe('setAutoAssign', () => {
    it('sets auto-assign to true and clears selected cleaner', () => {
      const { result } = renderHook(() => useBookingStore());
      
      // First set a cleaner
      act(() => {
        result.current.setSelectedCleanerId('cleaner-123');
      });
      
      // Then enable auto-assign
      act(() => {
        result.current.setAutoAssign(true);
      });
      
      expect(result.current.autoAssign).toBe(true);
      expect(result.current.selectedCleanerId).toBe(null);
    });

    it('disables auto-assign when set to false', () => {
      const { result } = renderHook(() => useBookingStore());
      
      // First enable auto-assign
      act(() => {
        result.current.setAutoAssign(true);
      });
      
      // Then disable it
      act(() => {
        result.current.setAutoAssign(false);
      });
      
      expect(result.current.autoAssign).toBe(false);
    });
  });

  describe('setAvailableCleaners', () => {
    it('sets the available cleaners list', () => {
      const { result } = renderHook(() => useBookingStore());
      
      const mockCleaners = [
        {
          id: 'cleaner-1',
          name: 'John Doe',
          rating: 4.8,
          totalRatings: 150,
          experienceYears: 5,
          bio: 'Professional cleaner',
          eta: '25 min',
          badges: ['Top Rated'],
        },
        {
          id: 'cleaner-2',
          name: 'Jane Smith',
          rating: 4.5,
          totalRatings: 89,
          experienceYears: 3,
          bio: 'Reliable cleaner',
          eta: '30 min',
          badges: ['Highly Rated'],
        },
      ];
      
      act(() => {
        result.current.setAvailableCleaners(mockCleaners);
      });
      
      expect(result.current.availableCleaners).toEqual(mockCleaners);
      expect(result.current.availableCleaners).toHaveLength(2);
    });

    it('handles empty cleaners list', () => {
      const { result } = renderHook(() => useBookingStore());
      
      act(() => {
        result.current.setAvailableCleaners([]);
      });
      
      expect(result.current.availableCleaners).toEqual([]);
      expect(result.current.availableCleaners).toHaveLength(0);
    });
  });

  describe('autoAssignCleaner', () => {
    it('picks the first available cleaner when cleaners are available', () => {
      const { result } = renderHook(() => useBookingStore());
      
      const mockCleaners = [
        {
          id: 'cleaner-1',
          name: 'John Doe',
          rating: 4.8,
          totalRatings: 150,
          experienceYears: 5,
          bio: 'Professional cleaner',
          eta: '25 min',
          badges: ['Top Rated'],
        },
        {
          id: 'cleaner-2',
          name: 'Jane Smith',
          rating: 4.5,
          totalRatings: 89,
          experienceYears: 3,
          bio: 'Reliable cleaner',
          eta: '30 min',
          badges: ['Highly Rated'],
        },
      ];
      
      // Set available cleaners
      act(() => {
        result.current.setAvailableCleaners(mockCleaners);
      });
      
      // Auto-assign cleaner
      act(() => {
        result.current.autoAssignCleaner();
      });
      
      expect(result.current.autoAssign).toBe(true);
      expect(result.current.selectedCleanerId).toBe('cleaner-1'); // First cleaner
    });

    it('sets auto-assign to true but no cleaner ID when no cleaners are available', () => {
      const { result } = renderHook(() => useBookingStore());
      
      // Ensure no cleaners are available
      act(() => {
        result.current.setAvailableCleaners([]);
      });
      
      // Auto-assign cleaner
      act(() => {
        result.current.autoAssignCleaner();
      });
      
      expect(result.current.autoAssign).toBe(true);
      expect(result.current.selectedCleanerId).toBe(null);
    });

    it('follows PRD requirement of picking the first available cleaner', () => {
      const { result } = renderHook(() => useBookingStore());
      
      const mockCleaners = [
        {
          id: 'cleaner-3',
          name: 'Bob Wilson',
          rating: 4.2,
          totalRatings: 45,
          experienceYears: 2,
          bio: 'New cleaner',
          eta: '35 min',
          badges: ['Reliable'],
        },
        {
          id: 'cleaner-1',
          name: 'John Doe',
          rating: 4.8,
          totalRatings: 150,
          experienceYears: 5,
          bio: 'Professional cleaner',
          eta: '25 min',
          badges: ['Top Rated'],
        },
      ];
      
      // Set available cleaners (note: cleaner-3 is first in array)
      act(() => {
        result.current.setAvailableCleaners(mockCleaners);
      });
      
      // Auto-assign cleaner
      act(() => {
        result.current.autoAssignCleaner();
      });
      
      // Should pick the first cleaner in the array (cleaner-3), not the highest rated
      expect(result.current.selectedCleanerId).toBe('cleaner-3');
      expect(result.current.autoAssign).toBe(true);
    });
  });

  describe('State Consistency', () => {
    it('maintains mutual exclusivity between manual selection and auto-assign', () => {
      const { result } = renderHook(() => useBookingStore());
      
      // Start with auto-assign
      act(() => {
        result.current.setAutoAssign(true);
      });
      
      expect(result.current.autoAssign).toBe(true);
      expect(result.current.selectedCleanerId).toBe(null);
      
      // Switch to manual selection
      act(() => {
        result.current.setSelectedCleanerId('cleaner-123');
      });
      
      expect(result.current.autoAssign).toBe(false);
      expect(result.current.selectedCleanerId).toBe('cleaner-123');
      
      // Switch back to auto-assign
      act(() => {
        result.current.setAutoAssign(true);
      });
      
      expect(result.current.autoAssign).toBe(true);
      expect(result.current.selectedCleanerId).toBe(null);
    });

    it('preserves other state when updating cleaner selection', () => {
      const { result } = renderHook(() => useBookingStore());
      
      // Set some other state
      act(() => {
        result.current.setSelectedDate('2024-01-15');
        result.current.setSelectedTime('10:00');
        result.current.setBedroomCount(3);
      });
      
      // Update cleaner selection
      act(() => {
        result.current.setSelectedCleanerId('cleaner-123');
      });
      
      // Other state should be preserved
      expect(result.current.selectedDate).toBe('2024-01-15');
      expect(result.current.selectedTime).toBe('10:00');
      expect(result.current.bedroomCount).toBe(3);
      expect(result.current.selectedCleanerId).toBe('cleaner-123');
    });
  });

  describe('Integration with Booking Flow', () => {
    it('allows continuing when cleaner is selected', () => {
      const { result } = renderHook(() => useBookingStore());
      
      act(() => {
        result.current.setSelectedCleanerId('cleaner-123');
      });
      
      // Should be able to continue (this would be checked in the component)
      expect(result.current.selectedCleanerId).toBeTruthy();
      expect(result.current.autoAssign).toBe(false);
    });

    it('allows continuing when auto-assign is enabled', () => {
      const { result } = renderHook(() => useBookingStore());
      
      act(() => {
        result.current.setAutoAssign(true);
      });
      
      // Should be able to continue (this would be checked in the component)
      expect(result.current.autoAssign).toBe(true);
    });

    it('prevents continuing when neither cleaner is selected nor auto-assign is enabled', () => {
      const { result } = renderHook(() => useBookingStore());
      
      // Default state: no selection, no auto-assign
      expect(result.current.selectedCleanerId).toBe(null);
      expect(result.current.autoAssign).toBe(false);
      
      // Should not be able to continue (this would be checked in the component)
      const canContinue = result.current.selectedCleanerId || result.current.autoAssign;
      expect(canContinue).toBe(false);
    });
  });
});
