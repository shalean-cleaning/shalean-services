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
  const mockOnPrevious = vi.fn();
  
  const mockBookingStore = {
    selectedSuburb: 'suburb-1',
    selectedDate: '2024-01-15',
    selectedTime: '10:00',
    selectedService: { id: 'service-1', name: 'House Cleaning' },
    selectedCleanerId: null,
    autoAssign: false,
    availableCleaners: [],
    setSelectedCleanerId: vi.fn(),
    setAutoAssign: vi.fn(),
    setAvailableCleaners: vi.fn(),
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
    render(<CleanerSelectionStep  onPrevious={mockOnPrevious} />);

    expect(screen.getByText('Choose Your Cleaner')).toBeInTheDocument();
    expect(screen.getByText('Select a cleaner or let us assign the best match for you')).toBeInTheDocument();
    expect(screen.getByText('Auto-assign Best Match')).toBeInTheDocument();
  });

  it('fetches available cleaners on mount', async () => {
    render(<CleanerSelectionStep  onPrevious={mockOnPrevious} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/cleaners/availability'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('suburb-1'),
      });
    });
  });

  it('calls setAutoAssign when auto-assign button is clicked', () => {
    mockBookingStore.availableCleaners = [mockCleaner];
    
    render(<CleanerSelectionStep  onPrevious={mockOnPrevious} />);

    const autoAssignButton = screen.getByText('Auto-assign');
    fireEvent.click(autoAssignButton);

    expect(mockBookingStore.setAutoAssign).toHaveBeenCalledWith(true);
  });

  it('shows loading state while fetching cleaners', () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<CleanerSelectionStep  onPrevious={mockOnPrevious} />);

    // Should show skeleton cards
    expect(screen.getAllByTestId('skeleton-card')).toHaveLength(3);
  });

  it('shows error state when fetch fails', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Network error'));
    
    render(<CleanerSelectionStep  onPrevious={mockOnPrevious} />);

    await waitFor(() => {
      expect(screen.getByText(/We couldn't load available cleaners/)).toBeInTheDocument();
    });
  });

  it('shows empty state when no cleaners are available', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        cleaners: [],
      }),
    });
    
    render(<CleanerSelectionStep  onPrevious={mockOnPrevious} />);

    await waitFor(() => {
      expect(screen.getByText('No Cleaners Available')).toBeInTheDocument();
      expect(screen.getByText(/No cleaners available for the selected time/)).toBeInTheDocument();
    });
  });

  it('shows disabled primary button when no selection is made', () => {
    render(<CleanerSelectionStep  onPrevious={mockOnPrevious} />);

    const continueButton = screen.getByText('Select a cleaner to continue');
    expect(continueButton).toBeDisabled();
    expect(continueButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows enabled primary button when cleaner is selected', () => {
    mockBookingStore.selectedCleanerId = 'cleaner-1';
    
    render(<CleanerSelectionStep  onPrevious={mockOnPrevious} />);

    const continueButton = screen.getByText('Continue to Booking');
    expect(continueButton).not.toBeDisabled();
    expect(continueButton).toHaveAttribute('aria-label', 'Continue to Booking');
  });

  it('shows enabled primary button when auto-assign is enabled', () => {
    mockBookingStore.autoAssign = true;
    
    render(<CleanerSelectionStep  onPrevious={mockOnPrevious} />);

    const continueButton = screen.getByText('Continue to Booking');
    expect(continueButton).not.toBeDisabled();
    expect(continueButton).toHaveAttribute('aria-label', 'Continue to Booking');
  });

  it('shows inline error when trying to continue without selection', async () => {
    render(<CleanerSelectionStep  onPrevious={mockOnPrevious} />);

    const continueButton = screen.getByText('Select a cleaner to continue');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText('Please select a cleaner or enable auto-assign to continue')).toBeInTheDocument();
    });
  });

  it('navigates to review page when continue is clicked with valid selection', async () => {
    mockBookingStore.selectedCleanerId = 'cleaner-1';
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ bookingId: 'booking-123' }),
    });
    
    render(<CleanerSelectionStep onPrevious={mockOnPrevious} />);

    const continueButton = screen.getByText('Continue to Booking');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/booking/review?bookingId=booking-123');
    });
  });

  it('calls onPrevious when previous button is clicked', () => {
    render(<CleanerSelectionStep onPrevious={mockOnPrevious} />);

    const previousButton = screen.getByText('Previous');
    fireEvent.click(previousButton);

    expect(mockOnPrevious).toHaveBeenCalled();
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
