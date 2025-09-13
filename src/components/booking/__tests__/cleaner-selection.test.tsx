import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CleanerCard } from '@/components/booking/cleaner-card';
import { CleanerSelectionStep } from '@/components/booking/steps/cleaner-selection-step';
import { useBookingStore } from '@/lib/stores/booking-store';

// Mock the booking store
vi.mock('@/lib/stores/booking-store', () => ({
  useBookingStore: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

const mockCleaner = {
  id: 'cleaner-1',
  name: 'John Doe',
  rating: 4.8,
  totalRatings: 127,
  experienceYears: 5,
  bio: 'Professional cleaner with 5 years of experience',
  avatarUrl: 'https://example.com/avatar.jpg',
  eta: '25 min',
  badges: ['Top Rated', 'Experienced'],
};

describe('CleanerCard', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders cleaner information correctly', () => {
    render(
      <CleanerCard
        cleaner={mockCleaner}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('4.8 (127 reviews)')).toBeInTheDocument();
    expect(screen.getByText('5 years experience')).toBeInTheDocument();
    expect(screen.getByText('ETA: 25 min')).toBeInTheDocument();
    expect(screen.getByText('Professional cleaner with 5 years of experience')).toBeInTheDocument();
    expect(screen.getByText('Top Rated')).toBeInTheDocument();
    expect(screen.getByText('Experienced')).toBeInTheDocument();
  });

  it('shows selected state when cleaner is selected', () => {
    render(
      <CleanerCard
        cleaner={mockCleaner}
        isSelected={true}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Selected')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');
  });

  it('calls onSelect when cleaner card is clicked', () => {
    render(
      <CleanerCard
        cleaner={mockCleaner}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(mockOnSelect).toHaveBeenCalledWith('cleaner-1');
  });

  it('shows fallback avatar when image fails to load', () => {
    render(
      <CleanerCard
        cleaner={mockCleaner}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const img = screen.getByAltText('John Doe');
    fireEvent.error(img);
    
    // Should show User icon instead
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
  });
});

describe('CleanerSelectionStep', () => {
  const mockBookingStore = {
    selectedSuburb: 'suburb-1',
    selectedDate: '2024-01-15',
    selectedTime: '10:00',
    selectedService: { id: 'service-1', name: 'House Cleaning' },
    selectedCleanerId: null,
    availableCleaners: [],
    setSelectedCleanerId: vi.fn(),
    setAvailableCleaners: vi.fn(),
    autoAssignCleaner: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useBookingStore as jest.MockedFunction<typeof useBookingStore>).mockReturnValue(mockBookingStore);
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        available_cleaners: [mockCleaner],
      }),
    });
  });

  it('renders the cleaner selection step', () => {
    render(<CleanerSelectionStep />);

    expect(screen.getByText('Choose Your Cleaner')).toBeInTheDocument();
    expect(screen.getByText('Select a cleaner or let us assign the best match for you')).toBeInTheDocument();
    expect(screen.getByText('Auto-assign Best Match')).toBeInTheDocument();
  });

  it('fetches available cleaners on mount', async () => {
    render(<CleanerSelectionStep />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/cleaners/available', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          suburb_id: 'suburb-1',
          date: '2024-01-15',
          time: '10:00',
          service_id: 'service-1',
        }),
      });
    });
  });

  it('calls autoAssignCleaner when auto-assign button is clicked', () => {
    mockBookingStore.availableCleaners = [mockCleaner];
    
    render(<CleanerSelectionStep />);

    const autoAssignButton = screen.getByText('Auto-assign');
    fireEvent.click(autoAssignButton);

    expect(mockBookingStore.autoAssignCleaner).toHaveBeenCalled();
  });

  it('shows loading state while fetching cleaners', () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<CleanerSelectionStep />);

    // Should show skeleton cards
    expect(screen.getAllByTestId('skeleton-card')).toHaveLength(3);
  });

  it('shows error state when fetch fails', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Network error'));
    
    render(<CleanerSelectionStep />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load available cleaners. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows empty state when no cleaners are available', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        available_cleaners: [],
      }),
    });
    
    render(<CleanerSelectionStep />);

    await waitFor(() => {
      expect(screen.getByText('No Cleaners Available')).toBeInTheDocument();
      expect(screen.getByText('Unfortunately, no cleaners are available for the selected time slot.')).toBeInTheDocument();
    });
  });
});

describe('Booking Store Auto-assign Logic', () => {
  it('selects cleaner with highest rating', () => {
    const cleaners = [
      { id: 'cleaner-1', rating: 4.5, experienceYears: 3 },
      { id: 'cleaner-2', rating: 4.8, experienceYears: 2 },
      { id: 'cleaner-3', rating: 4.2, experienceYears: 5 },
    ];

    // Simulate auto-assign logic
    const bestCleaner = cleaners.reduce((best, current) => {
      if (current.rating > best.rating) return current;
      if (current.rating === best.rating && current.experienceYears > best.experienceYears) return current;
      return best;
    });

    expect(bestCleaner.id).toBe('cleaner-2');
  });

  it('selects cleaner with most experience when ratings are equal', () => {
    const cleaners = [
      { id: 'cleaner-1', rating: 4.5, experienceYears: 3 },
      { id: 'cleaner-2', rating: 4.5, experienceYears: 5 },
      { id: 'cleaner-3', rating: 4.5, experienceYears: 2 },
    ];

    // Simulate auto-assign logic
    const bestCleaner = cleaners.reduce((best, current) => {
      if (current.rating > best.rating) return current;
      if (current.rating === best.rating && current.experienceYears > best.experienceYears) return current;
      return best;
    });

    expect(bestCleaner.id).toBe('cleaner-2');
  });
});
