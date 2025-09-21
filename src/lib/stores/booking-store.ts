import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Service, Booking, BookingItem } from '@/lib/database.types';

export interface BookingState {
  // Core booking data
  bookingId: string | null;
  serviceSlug: string | null;
  selectedService: Service | null;
  rooms: {
    bedrooms: number;
    bathrooms: number;
  };
  extras: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  location: {
    regionId: string | null;
    suburbId: string | null;
    address: string;
    address2?: string;
    postcode: string;
  };
  scheduling: {
    selectedDate: string | null;
    selectedTime: string | null;
    startISO: string | null;
    endISO: string | null;
  };
  cleaner: {
    selectedCleanerId: string | null;
    autoAssign: boolean;
    availableCleaners: Array<{
      id: string;
      name: string;
      rating: number;
      totalRatings: number;
      experienceYears: number;
      bio?: string;
      avatarUrl?: string;
      eta?: string;
      badges?: string[];
    }>;
  };
  customerInfo: {
    specialInstructions?: string;
  };
  pricing: {
    basePrice: number;
    totalPrice: number;
    deliveryFee: number;
  };
  currentStep: number;
  
  // Actions
  setSelectedService: (service: Service | null) => void;
  setRooms: (rooms: { bedrooms: number; bathrooms: number }) => void;
  addExtra: (extra: { id: string; name: string; price: number }) => void;
  removeExtra: (extraId: string) => void;
  updateExtraQuantity: (extraId: string, quantity: number) => void;
  setLocation: (location: Partial<BookingState['location']>) => void;
  setScheduling: (scheduling: Partial<BookingState['scheduling']>) => void;
  setCleaner: (cleaner: Partial<BookingState['cleaner']>) => void;
  setCustomerInfo: (info: Partial<BookingState['customerInfo']>) => void;
  calculateTotalPrice: () => void;
  setCurrentStep: (step: number) => void;
  resetBooking: () => void;
  createDraftBooking: () => Promise<{ success: boolean; id?: string; error?: string }>;
  updateBooking: (bookingId: string, updates: Partial<any>) => Promise<{ success: boolean; error?: string }>;
  composeDraftPayload: () => any;
  
  // Enhanced booking system actions
  hydrateFromServer: (booking: Booking & { booking_items?: BookingItem[] }) => void;
  savePartial: (data: Partial<BookingState>) => void;
  hydrateFromQuote: (quoteState: any) => void;
}

const initialState = {
  // Core booking data
  bookingId: null,
  serviceSlug: null,
  selectedService: null,
  rooms: {
    bedrooms: 1,
    bathrooms: 1,
  },
  extras: [],
  location: {
    regionId: null,
    suburbId: null,
    address: '',
    address2: '',
    postcode: '',
  },
  scheduling: {
    selectedDate: null,
    selectedTime: null,
    startISO: null,
    endISO: null,
  },
  cleaner: {
    selectedCleanerId: null,
    autoAssign: false,
    availableCleaners: [],
  },
  customerInfo: {
    specialInstructions: '',
  },
  pricing: {
    basePrice: 0,
    totalPrice: 0,
    deliveryFee: 0,
  },
  currentStep: 1,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setSelectedService: (service) => {
        set({ 
          selectedService: service,
          pricing: { ...get().pricing, basePrice: service?.base_fee || 0 }
        });
        get().calculateTotalPrice();
      },
      
      setRooms: (rooms) => {
        set({ rooms });
        get().calculateTotalPrice();
      },
      
      addExtra: (extra) => {
        const { extras } = get();
        const existingExtra = extras.find(e => e.id === extra.id);
        
        if (existingExtra) {
          set({
            extras: extras.map(e =>
              e.id === extra.id
                ? { ...e, quantity: e.quantity + 1 }
                : e
            )
          });
        } else {
          set({
            extras: [
              ...extras,
              {
                id: extra.id,
                name: extra.name,
                price: extra.price,
                quantity: 1,
              }
            ]
          });
        }
        get().calculateTotalPrice();
      },
      
      removeExtra: (extraId) => {
        set({
          extras: get().extras.filter(e => e.id !== extraId)
        });
        get().calculateTotalPrice();
      },
      
      updateExtraQuantity: (extraId, quantity) => {
        if (quantity <= 0) {
          get().removeExtra(extraId);
          return;
        }
        
        set({
          extras: get().extras.map(e =>
            e.id === extraId ? { ...e, quantity } : e
          )
        });
        get().calculateTotalPrice();
      },
      
      setLocation: (location) => {
        set({ location: { ...get().location, ...location } });
        // Fetch delivery fee for the selected suburb
        if (location.suburbId) {
          // Use cached delivery fee if available, otherwise fetch
          const cachedFee = get().pricing.deliveryFee;
          if (cachedFee === 0) {
            fetch(`/api/areas`)
              .then(res => res.json())
              .then(areas => {
                const area = areas.find((a: { id: string; delivery_fee: number }) => a.id === location.suburbId);
                if (area) {
                  set({ pricing: { ...get().pricing, deliveryFee: area.delivery_fee || 0 } });
                }
              })
              .catch(err => {
                console.error('Error fetching area delivery fee:', err);
                set({ pricing: { ...get().pricing, deliveryFee: 0 } });
              });
          }
        } else {
          set({ pricing: { ...get().pricing, deliveryFee: 0 } });
        }
        get().calculateTotalPrice();
      },
      
      setScheduling: (scheduling) => {
        set({ scheduling: { ...get().scheduling, ...scheduling } });
        // Reset time when date changes
        if (scheduling.selectedDate && scheduling.selectedDate !== get().scheduling.selectedDate) {
          set({ scheduling: { ...get().scheduling, ...scheduling, selectedTime: null } });
        }
      },
      
      setCleaner: (cleaner) => {
        set({ cleaner: { ...get().cleaner, ...cleaner } });
      },
      
      setCustomerInfo: (info) => {
        set({ customerInfo: { ...get().customerInfo, ...info } });
      },
      
      calculateTotalPrice: () => {
        const { pricing, rooms, extras } = get();
        
        // Base price calculation
        let roomPrice = pricing.basePrice;
        
        // Add pricing for additional bedrooms/bathrooms
        const additionalBedroomPrice = 20; // $20 per additional bedroom
        const additionalBathroomPrice = 15; // $15 per additional bathroom
        
        if (rooms.bedrooms > 1) {
          roomPrice += (rooms.bedrooms - 1) * additionalBedroomPrice;
        }
        if (rooms.bathrooms > 1) {
          roomPrice += (rooms.bathrooms - 1) * additionalBathroomPrice;
        }
        
        // Add extras - optimized calculation
        const extrasTotal = extras.reduce(
          (total, extra) => total + (extra.price * extra.quantity),
          0
        );
        
        const totalPrice = roomPrice + extrasTotal + pricing.deliveryFee;
        
        // Only update if price has changed to prevent unnecessary re-renders
        if (pricing.totalPrice !== totalPrice) {
          set({ pricing: { ...pricing, totalPrice } });
        }
      },
      
      setCurrentStep: (step) => {
        set({ currentStep: Math.max(1, Math.min(5, step)) });
      },
      
      resetBooking: () => {
        set(initialState);
      },
      
      composeDraftPayload: () => {
        const state = get();
        
        // Validate required fields
        if (!state.selectedService) {
          throw new Error("Service selection is required");
        }
        if (!state.location.suburbId) {
          throw new Error("Suburb selection is required");
        }
        if (!state.location.address.trim()) {
          throw new Error("Address is required");
        }
        if (!state.location.postcode.trim()) {
          throw new Error("Postcode is required");
        }

        // Determine time format
        let timePayload: any = {};
        if (state.scheduling.selectedDate && state.scheduling.selectedTime) {
          timePayload = {
            bookingDate: state.scheduling.selectedDate,
            startTime: state.scheduling.selectedTime
          };
        } else {
          throw new Error("Date and time selection are required");
        }

        return {
          serviceId: state.selectedService.id,
          regionId: state.location.regionId,
          suburbId: state.location.suburbId,
          totalPrice: state.pricing.totalPrice,
          address: state.location.address,
          postcode: state.location.postcode,
          bedrooms: state.rooms.bedrooms,
          bathrooms: state.rooms.bathrooms,
          extras: state.extras.map(extra => ({
            id: extra.id,
            quantity: extra.quantity,
            price: extra.price
          })),
          specialInstructions: state.customerInfo.specialInstructions,
          frequency: 'one-time' as const,
          timezone: 'Africa/Johannesburg',
          ...timePayload
        };
      },
      
      createDraftBooking: async () => {
        try {
          const payload = get().composeDraftPayload();
          
          const response = await fetch('/api/bookings/draft', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            return { 
              success: false, 
              error: result.error || `HTTP ${response.status}`,
              details: result.details 
            };
          }
          
          return { 
            success: true, 
            id: result.bookingId,
            totalPrice: result.totalPrice,
            breakdown: result.breakdown
          };
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          return { success: false, error: errorMessage };
        }
      },

      updateBooking: async (bookingId: string, updates: Partial<any>) => {
        try {
          const response = await fetch('/api/bookings/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bookingId,
              ...updates
            }),
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            return { 
              success: false, 
              error: result.error || `HTTP ${response.status}`,
              details: result.details 
            };
          }
          
          return { 
            success: true,
            message: result.message
          };
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          return { success: false, error: errorMessage };
        }
      },

      // New actions for enhanced booking system
      hydrateFromServer: (booking) => {
        const bookingItems = booking.booking_items || [];
        
        set({
          // Core booking data
          bookingId: booking.id,
          serviceSlug: booking.service_slug,
          rooms: {
            bedrooms: booking.bedrooms || 1,
            bathrooms: booking.bathrooms || 1,
          },
          extras: bookingItems.map((item: any) => ({
            id: item.service_item_id,
            name: item.item_type || 'Service Item',
            price: item.unit_price,
            quantity: item.qty,
          })),
          location: {
            regionId: booking.region_id,
            suburbId: booking.area_id,
            address: booking.address || '',
            postcode: booking.postcode || '',
          },
          scheduling: {
            selectedDate: booking.booking_date,
            selectedTime: booking.start_time,
            startISO: booking.start_ts,
            endISO: booking.end_ts,
          },
          cleaner: {
            selectedCleanerId: booking.cleaner_id,
            autoAssign: false,
            availableCleaners: [],
          },
          customerInfo: {
            specialInstructions: booking.special_instructions || '',
          },
          pricing: {
            basePrice: 0, // Will be calculated from service
            totalPrice: booking.total_price || 0,
            deliveryFee: 0, // Will be calculated from suburb
          },
          
        });
      },

      savePartial: (data) => {
        set((state) => {
          const newState = { ...state };
          
          // Update core fields
          if (data.bookingId !== undefined) newState.bookingId = data.bookingId;
          if (data.serviceSlug !== undefined) newState.serviceSlug = data.serviceSlug;
          if (data.rooms !== undefined) newState.rooms = { ...state.rooms, ...data.rooms };
          if (data.extras !== undefined) newState.extras = data.extras;
          if (data.location !== undefined) newState.location = { ...state.location, ...data.location };
          if (data.scheduling !== undefined) newState.scheduling = { ...state.scheduling, ...data.scheduling };
          if (data.cleaner !== undefined) newState.cleaner = { ...state.cleaner, ...data.cleaner };
          if (data.customerInfo !== undefined) newState.customerInfo = { ...state.customerInfo, ...data.customerInfo };
          if (data.pricing !== undefined) newState.pricing = { ...state.pricing, ...data.pricing };
          if (data.currentStep !== undefined) newState.currentStep = data.currentStep;
          
          return newState;
        });
      },

      hydrateFromQuote: (quoteState) => {
        set((state) => {
          // Map quote state to booking store state
          const newState = { ...state };
          
          // Update core fields
          newState.rooms = {
            bedrooms: quoteState.bedrooms || 1,
            bathrooms: quoteState.bathrooms || 1,
          };
          newState.extras = quoteState.selectedExtras || [];
          newState.location = {
            ...state.location,
            suburbId: quoteState.areaId,
          };
          
          // Reset other fields that need to be filled in booking flow
          newState.scheduling = {
            selectedDate: null,
            selectedTime: null,
            startISO: null,
            endISO: null,
          };
          newState.location = {
            ...newState.location,
            address: '',
            postcode: '',
          };
          newState.cleaner = {
            selectedCleanerId: null,
            autoAssign: false,
            availableCleaners: [],
          };
          newState.currentStep = 1;
          
          return newState;
        });
      },
    }),
    {
      name: 'booking-store',
      partialize: (state) => ({
        // Core booking data
        bookingId: state.bookingId,
        serviceSlug: state.serviceSlug,
        selectedService: state.selectedService,
        rooms: state.rooms,
        extras: state.extras,
        location: state.location,
        scheduling: state.scheduling,
        cleaner: state.cleaner,
        customerInfo: state.customerInfo,
        pricing: state.pricing,
        currentStep: state.currentStep,
      }),
    }
  )
);
