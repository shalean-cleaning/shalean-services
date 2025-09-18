import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { CleanerSelectionStep } from '../steps/cleaner-selection-step';
import { useBookingStore } from '@/lib/stores/booking-store';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock the booking store
jest.mock('@/lib/stores/booking-store');

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseBookingStore = useBookingStore as jest.MockedFunction<typeof useBookingStore>;

describe('CleanerSelectionStep', () => {
  const mockPush = jest.fn();
  const mockSetSelectedCleanerId = jest.fn();
  const mockSetAutoAssign = jest.fn();
  const mockSetAvailableCleaners = jest.fn();
  const mockAutoAssignCleaner = jest.fn();
  const mockComposeDraftPayload = jest.fn();

  const mockCleaners = [
    {
      id: 'cleaner-1',
      name: 'John Doe',
      rating: 4.8,
      totalRatings: 150,
      experienceYears: 5,
      bio: 'Professional cleaner with 5 years experience',
      eta: '25 min',
      badges: ['Top Rated', 'Experienced'],
    },
    {
      id: 'cleaner-2',
      name: 'Jane Smith',
      rating: 4.5,
      totalRatings: 89,
      experienceYears: 3,
      bio: 'Reliable and thorough cleaner',
      eta: '30 min',
      badges: ['Highly Rated'],
    },
  ];

  const defaultStoreState = {
    selectedSuburb: 'suburb-1',
    selectedDate: '2024-01-15',
    selectedTime: '10:00',
    selectedCleanerId: null,
    autoAssign: false,
    availableCleaners: mockCleaners,
    setSelectedCleanerId: mockSetSelectedCleanerId,
    setAutoAssign: mockSetAutoAssign,
    setAvailableCleaners: mockSetAvailableCleaners,
    autoAssignCleaner: mockAutoAssignCleaner,
    composeDraftPayload: mockComposeDraftPayload,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);
    mockUseBookingStore.mockReturnValue(defaultStoreState);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ cleaners: mockCleaners }),
    });
  });

  describe('Rendering', () => {
    it('renders the cleaner selection step with correct title and description', () => {
      render(<CleanerSelectionStep />);
      
      expect(screen.getByText('Choose Your Cleaner')).toBeInTheDocument();
      expect(screen.getByText('Select a cleaner or let us assign the best match for you')).toBeInTheDocument();
    });

    it('renders the auto-assign option', () => {
      render(<CleanerSelectionStep />);
      
      expect(screen.getByText('Auto-assign Best Match')).toBeInTheDocument();
      expect(screen.getByText("We'll automatically select the highest-rated available cleaner")).toBeInTheDocument();
    });

    it('renders available cleaners when data is loaded', () => {
      render(<CleanerSelectionStep />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('4.8 (150 reviews)')).toBeInTheDocument();
      expect(screen.getByText('4.5 (89 reviews)')).toBeInTheDocument();
    });

    it('shows loading state when fetching cleaners', () => {
      mockUseBookingStore.mockReturnValue({
        ...defaultStoreState,
        availableCleaners: [],
      });
      
      render(<CleanerSelectionStep />);
      
      // Should show skeleton cards
      expect(screen.getAllByTestId('skeleton-card')).toHaveLength(3);
    });

    it('shows empty state when no cleaners are available', () => {
      mockUseBookingStore.mockReturnValue({
        ...defaultStoreState,
        availableCleaners: [],
      });
      
      render(<CleanerSelectionStep />);
      
      expect(screen.getByText('No Cleaners Available')).toBeInTheDocument();
      expect(screen.getByText('No cleaners available for the selected time. You can still continue with Auto-assign Best Match.')).toBeInTheDocument();
    });
  });

  describe('Cleaner Selection', () => {
    it('calls setSelectedCleanerId when a cleaner is selected', () => {
      render(<CleanerSelectionStep />);
      
      const selectButton = screen.getAllByText('Select')[0];
      fireEvent.click(selectButton);
      
      expect(mockSetSelectedCleanerId).toHaveBeenCalledWith('cleaner-1');
    });

    it('shows selected state for the chosen cleaner', () => {
      mockUseBookingStore.mockReturnValue({
        ...defaultStoreState,
        selectedCleanerId: 'cleaner-1',
      });
      
      render(<CleanerSelectionStep />);
      
      expect(screen.getByText('Selected')).toBeInTheDocument();
      expect(screen.getByText('Cleaner Selected Successfully')).toBeInTheDocument();
    });

    it('clears auto-assign when a cleaner is manually selected', () => {
      mockUseBookingStore.mockReturnValue({
        ...defaultStoreState,
        autoAssign: true,
      });
      
      render(<CleanerSelectionStep />);
      
      const selectButton = screen.getAllByText('Select')[0];
      fireEvent.click(selectButton);
      
      expect(mockSetSelectedCleanerId).toHaveBeenCalledWith('cleaner-1');
    });
  });

  describe('Auto-assign Functionality', () => {
    it('calls autoAssignCleaner when auto-assign button is clicked', () => {
      render(<CleanerSelectionStep />);
      
      const autoAssignButton = screen.getByText('Auto-assign');
      fireEvent.click(autoAssignButton);
      
      expect(mockAutoAssignCleaner).toHaveBeenCalled();
    });

    it('shows auto-assign selected state', () => {
      mockUseBookingStore.mockReturnValue({
        ...defaultStoreState,
        autoAssign: true,
      });
      
      render(<CleanerSelectionStep />);
      
      expect(screen.getByText('Selected')).toBeInTheDocument();
      expect(screen.getByText('Auto-assign Selected')).toBeInTheDocument();
    });

    it('clears selected cleaner when auto-assign is enabled', () => {
      mockUseBookingStore.mockReturnValue({
        ...defaultStoreState,
        selectedCleanerId: 'cleaner-1',
      });
      
      render(<CleanerSelectionStep />);
      
      const autoAssignButton = screen.getByText('Auto-assign');
      fireEvent.click(autoAssignButton);
      
      expect(mockAutoAssignCleaner).toHaveBeenCalled();
    });
  });

  describe('Continue Button', () => {
    it('is disabled when no cleaner is selected and auto-assign is false', () => {
      render(<CleanerSelectionStep />);
      
      const continueButton = screen.getByText('Select a cleaner to continue');
      expect(continueButton).toBeDisabled();
    });

    it('is enabled when a cleaner is selected', () => {
      mockUseBookingStore.mockReturnValue({
        ...defaultStoreState,
        selectedCleanerId: 'cleaner-1',
      });
      
      render(<CleanerSelectionStep />);
      
      const continueButton = screen.getByText('Continue to Booking');
      expect(continueButton).not.toBeDisabled();
    });

    it('is enabled when auto-assign is selected', () => {
      mockUseBookingStore.mockReturnValue({
        ...defaultStoreState,
        autoAssign: true,
      });
      
      render(<CleanerSelectionStep />);
      
      const continueButton = screen.getByText('Continue to Booking');
      expect(continueButton).not.toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('shows error message when API call fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
      
      render(<CleanerSelectionStep />);
      
      await waitFor(() => {
        expect(screen.getByText("We couldn't load available cleaners. Please adjust date or time and try again.")).toBeInTheDocument();
      });
    });

    it('shows inline error when continue fails', async () => {
      mockUseBookingStore.mockReturnValue({
        ...defaultStoreState,
        selectedCleanerId: 'cleaner-1',
      });
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Invalid request' }),
      });
      
      render(<CleanerSelectionStep />);
      
      const continueButton = screen.getByText('Continue to Booking');
      fireEvent.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid request')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to review page on successful continue', async () => {
      mockUseBookingStore.mockReturnValue({
        ...defaultStoreState,
        selectedCleanerId: 'cleaner-1',
      });
      
      mockComposeDraftPayload.mockReturnValue({});
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ bookingId: 'booking-123' }),
      });
      
      render(<CleanerSelectionStep />);
      
      const continueButton = screen.getByText('Continue to Booking');
      fireEvent.click(continueButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/booking/review?bookingId=booking-123');
      });
    });

    it('handles 409 conflict by fetching existing draft', async () => {
      mockUseBookingStore.mockReturnValue({
        ...defaultStoreState,
        selectedCleanerId: 'cleaner-1',
      });
      
      mockComposeDraftPayload.mockReturnValue({});
      
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 409,
          json: () => Promise.resolve({ error: 'Conflict' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ bookingId: 'existing-booking-123' }),
        });
      
      render(<CleanerSelectionStep />);
      
      const continueButton = screen.getByText('Continue to Booking');
      fireEvent.click(continueButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/booking/review?bookingId=existing-booking-123');
      });
    });
  });
});
