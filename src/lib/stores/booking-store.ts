import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Service, Extra } from '@/lib/database.types';

export interface BookingState {
  // Service selection
  selectedService: Service | null;
  
  // Room counts
  bedroomCount: number;
  bathroomCount: number;
  
  // Selected extras
  selectedExtras: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  
  // Location and scheduling
  selectedRegion: string | null;
  selectedSuburb: string | null;
  selectedDate: string | null;
  selectedTime: string | null;
  address: string;
  address2?: string;
  postcode: string;
  specialInstructions?: string;
  
  // Cleaner selection
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
  
  // Pricing
  basePrice: number;
  totalPrice: number;
  deliveryFee: number;
  
  // Current step
  currentStep: number;
  
  // Actions
  setSelectedService: (service: Service | null) => void;
  setBedroomCount: (count: number) => void;
  setBathroomCount: (count: number) => void;
  addExtra: (extra: Extra) => void;
  removeExtra: (extraId: string) => void;
  updateExtraQuantity: (extraId: string, quantity: number) => void;
  setSelectedRegion: (regionId: string | null) => void;
  setSelectedSuburb: (suburbId: string | null) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTime: (time: string | null) => void;
  setAddress: (address: string) => void;
  setAddress2: (address2: string) => void;
  setPostcode: (postcode: string) => void;
  setSpecialInstructions: (instructions: string) => void;
  setSelectedCleanerId: (cleanerId: string | null) => void;
  setAutoAssign: (autoAssign: boolean) => void;
  setAvailableCleaners: (cleaners: Array<{
    id: string;
    name: string;
    rating: number;
    totalRatings: number;
    experienceYears: number;
    bio?: string;
    avatarUrl?: string;
    eta?: string;
    badges?: string[];
  }>) => void;
  autoAssignCleaner: () => void;
  calculateTotalPrice: () => void;
  setCurrentStep: (step: number) => void;
  resetBooking: () => void;
  createDraftBooking: () => Promise<{ success: boolean; id?: string; error?: string }>;
  updateBooking: (bookingId: string, updates: Partial<any>) => Promise<{ success: boolean; error?: string }>;
  composeDraftPayload: () => any;
}

const initialState = {
  selectedService: null,
  bedroomCount: 1,
  bathroomCount: 1,
  selectedExtras: [],
  selectedRegion: null,
  selectedSuburb: null,
  selectedDate: null,
  selectedTime: null,
  address: '',
  address2: '',
  postcode: '',
  specialInstructions: '',
  selectedCleanerId: null,
  autoAssign: false,
  availableCleaners: [],
  basePrice: 0,
  totalPrice: 0,
  deliveryFee: 0,
  currentStep: 1,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setSelectedService: (service) => {
        set({ 
          selectedService: service,
          basePrice: service?.base_price || 0 
        });
        get().calculateTotalPrice();
      },
      
      setBedroomCount: (count) => {
        set({ bedroomCount: Math.max(1, count) });
        get().calculateTotalPrice();
      },
      
      setBathroomCount: (count) => {
        set({ bathroomCount: Math.max(1, count) });
        get().calculateTotalPrice();
      },
      
      addExtra: (extra) => {
        const { selectedExtras } = get();
        const existingExtra = selectedExtras.find(e => e.id === extra.id);
        
        if (existingExtra) {
          set({
            selectedExtras: selectedExtras.map(e =>
              e.id === extra.id
                ? { ...e, quantity: e.quantity + 1 }
                : e
            )
          });
        } else {
          set({
            selectedExtras: [
              ...selectedExtras,
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
          selectedExtras: get().selectedExtras.filter(e => e.id !== extraId)
        });
        get().calculateTotalPrice();
      },
      
      updateExtraQuantity: (extraId, quantity) => {
        if (quantity <= 0) {
          get().removeExtra(extraId);
          return;
        }
        
        set({
          selectedExtras: get().selectedExtras.map(e =>
            e.id === extraId ? { ...e, quantity } : e
          )
        });
        get().calculateTotalPrice();
      },
      
      setSelectedRegion: (regionId) => {
        set({ selectedRegion: regionId });
        // Reset suburb when region changes
        if (regionId !== get().selectedRegion) {
          set({ selectedSuburb: null });
        }
      },
      
      setSelectedSuburb: (suburbId) => {
        set({ selectedSuburb: suburbId });
        // Fetch delivery fee for the selected suburb
        if (suburbId) {
          fetch(`/api/suburbs`)
            .then(res => res.json())
            .then(suburbs => {
              const suburb = suburbs.find((s: { id: string; delivery_fee: number }) => s.id === suburbId);
              if (suburb) {
                set({ deliveryFee: suburb.delivery_fee || 0 });
              }
            })
            .catch(err => {
              console.error('Error fetching suburb delivery fee:', err);
              set({ deliveryFee: 0 });
            });
        } else {
          set({ deliveryFee: 0 });
        }
        get().calculateTotalPrice();
      },
      
      setSelectedDate: (date) => {
        set({ selectedDate: date });
        // Reset time when date changes
        if (date !== get().selectedDate) {
          set({ selectedTime: null });
        }
      },
      
      setSelectedTime: (time) => {
        set({ selectedTime: time });
      },
      
      setAddress: (address) => {
        set({ address });
      },
      
      setAddress2: (address2) => {
        set({ address2 });
      },
      
      setPostcode: (postcode) => {
        set({ postcode });
      },
      
      setSpecialInstructions: (instructions) => {
        set({ specialInstructions: instructions });
      },
      
      setSelectedCleanerId: (cleanerId) => {
        set({ selectedCleanerId: cleanerId, autoAssign: false });
      },
      
      setAutoAssign: (autoAssign) => {
        set({ autoAssign, selectedCleanerId: null });
      },
      
      setAvailableCleaners: (cleaners) => {
        set({ availableCleaners: cleaners });
      },
      
      autoAssignCleaner: () => {
        set({ autoAssign: true, selectedCleanerId: null });
      },
      
      calculateTotalPrice: () => {
        const { basePrice, bedroomCount, bathroomCount, selectedExtras, deliveryFee } = get();
        
        // Base price calculation (simplified - in real app, you'd use pricing rules)
        let roomPrice = basePrice;
        
        // Add pricing for additional bedrooms/bathrooms
        if (bedroomCount > 1) {
          roomPrice += (bedroomCount - 1) * 20; // $20 per additional bedroom
        }
        if (bathroomCount > 1) {
          roomPrice += (bathroomCount - 1) * 15; // $15 per additional bathroom
        }
        
        // Add extras
        const extrasTotal = selectedExtras.reduce(
          (total, extra) => total + (extra.price * extra.quantity),
          0
        );
        
        const totalPrice = roomPrice + extrasTotal + deliveryFee;
        
        set({ totalPrice });
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
        if (!state.selectedSuburb) {
          throw new Error("Suburb selection is required");
        }
        if (!state.address.trim()) {
          throw new Error("Address is required");
        }
        if (!state.postcode.trim()) {
          throw new Error("Postcode is required");
        }

        // Determine time format
        let timePayload: any = {};
        if (state.selectedDate && state.selectedTime) {
          timePayload = {
            bookingDate: state.selectedDate,
            startTime: state.selectedTime
          };
        } else {
          throw new Error("Date and time selection are required");
        }

        return {
          serviceId: state.selectedService.id,
          regionId: state.selectedRegion,
          suburbId: state.selectedSuburb,
          totalPrice: state.totalPrice,
          address: state.address,
          postcode: state.postcode,
          bedrooms: state.bedroomCount,
          bathrooms: state.bathroomCount,
          extras: state.selectedExtras.map(extra => ({
            id: extra.id,
            quantity: extra.quantity,
            price: extra.price
          })),
          specialInstructions: state.specialInstructions,
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
    }),
    {
      name: 'booking-store',
      partialize: (state) => ({
        selectedService: state.selectedService,
        bedroomCount: state.bedroomCount,
        bathroomCount: state.bathroomCount,
        selectedExtras: state.selectedExtras,
        selectedRegion: state.selectedRegion,
        selectedSuburb: state.selectedSuburb,
        selectedDate: state.selectedDate,
        selectedTime: state.selectedTime,
        address: state.address,
        address2: state.address2,
        postcode: state.postcode,
        specialInstructions: state.specialInstructions,
        selectedCleanerId: state.selectedCleanerId,
        autoAssign: state.autoAssign,
        availableCleaners: state.availableCleaners,
        currentStep: state.currentStep,
      }),
    }
  )
);
