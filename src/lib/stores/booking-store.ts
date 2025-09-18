import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Service, Booking, BookingItem } from '@/lib/database.types';

export interface BookingState {
  // Core booking data
  bookingId: string | null;
  serviceSlug: string | null;
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
  regionId: string | null;
  suburbId: string | null;
  startISO: string | null;
  endISO: string | null;
  cleanerId: string | null;
  customerInfo: {
    address: string;
    address2?: string;
    postcode: string;
    specialInstructions?: string;
  };
  pricing: {
    basePrice: number;
    totalPrice: number;
    deliveryFee: number;
  };
  
  // Legacy fields for backward compatibility
  selectedService: Service | null;
  bedroomCount: number;
  bathroomCount: number;
  selectedExtras: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  selectedRegion: string | null;
  selectedSuburb: string | null;
  selectedArea: string | null; // New field for PRD compliance
  selectedDate: string | null;
  selectedTime: string | null;
  address: string;
  address2?: string;
  postcode: string;
  specialInstructions?: string;
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
  basePrice: number;
  totalPrice: number;
  deliveryFee: number;
  currentStep: number;
  
  // Actions
  setSelectedService: (service: Service | null) => void;
  setBedroomCount: (count: number) => void;
  setBathroomCount: (count: number) => void;
  addExtra: (extra: { id: string; name: string; price: number }) => void;
  removeExtra: (extraId: string) => void;
  updateExtraQuantity: (extraId: string, quantity: number) => void;
  setSelectedRegion: (regionId: string | null) => void;
  setSelectedSuburb: (suburbId: string | null) => void;
  setSelectedArea: (areaId: string | null) => void;
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
  
  // New actions for enhanced booking system
  hydrateFromServer: (booking: Booking & { booking_items?: BookingItem[] }) => void;
  savePartial: (data: Partial<BookingState>) => void;
  hydrateFromQuote: (quoteState: any) => void;
}

const initialState = {
  // Core booking data
  bookingId: null,
  serviceSlug: null,
  rooms: {
    bedrooms: 1,
    bathrooms: 1,
  },
  extras: [],
  regionId: null,
  suburbId: null,
  startISO: null,
  endISO: null,
  cleanerId: null,
  customerInfo: {
    address: '',
    address2: '',
    postcode: '',
    specialInstructions: '',
  },
  pricing: {
    basePrice: 0,
    totalPrice: 0,
    deliveryFee: 0,
  },
  
  // Legacy fields for backward compatibility
  selectedService: null,
  bedroomCount: 1,
  bathroomCount: 1,
  selectedExtras: [],
  selectedRegion: null,
  selectedSuburb: null,
  selectedArea: null,
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
      
      setSelectedArea: (areaId) => {
        set({ 
          selectedArea: areaId,
          selectedSuburb: areaId, // Map area to suburb for backward compatibility
          suburbId: areaId, // Update core field too
        });
        // Fetch delivery fee for the selected area
        if (areaId) {
          fetch(`/api/areas`)
            .then(res => res.json())
            .then(areas => {
              const area = areas.find((a: { id: string; delivery_fee: number }) => a.id === areaId);
              if (area) {
                set({ deliveryFee: area.delivery_fee || 0 });
              }
            })
            .catch(err => {
              console.error('Error fetching area delivery fee:', err);
              set({ deliveryFee: 0 });
            });
        } else {
          set({ deliveryFee: 0 });
        }
        get().calculateTotalPrice();
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
        
        // Base price calculation
        let roomPrice = basePrice;
        
        // Add pricing for additional bedrooms/bathrooms
        // These values should ideally come from pricing rules in the database
        const additionalBedroomPrice = 20; // $20 per additional bedroom
        const additionalBathroomPrice = 15; // $15 per additional bathroom
        
        if (bedroomCount > 1) {
          roomPrice += (bedroomCount - 1) * additionalBedroomPrice;
        }
        if (bathroomCount > 1) {
          roomPrice += (bathroomCount - 1) * additionalBathroomPrice;
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
          extras: bookingItems.map(item => ({
            id: item.service_item_id,
            name: item.item_type || 'Service Item',
            price: item.unit_price,
            quantity: item.qty,
          })),
          regionId: booking.region_id,
          suburbId: booking.suburb_id,
          startISO: booking.start_ts,
          endISO: booking.end_ts,
          cleanerId: booking.cleaner_id,
          customerInfo: {
            address: booking.address || '',
            postcode: booking.postcode || '',
            specialInstructions: booking.special_instructions || '',
          },
          pricing: {
            basePrice: 0, // Will be calculated from service
            totalPrice: booking.total_price,
            deliveryFee: 0, // Will be calculated from suburb
          },
          
          // Legacy fields for backward compatibility
          bedroomCount: booking.bedrooms || 1,
          bathroomCount: booking.bathrooms || 1,
          selectedExtras: bookingItems.map(item => ({
            id: item.service_item_id,
            name: item.item_type || 'Service Item',
            price: item.unit_price,
            quantity: item.qty,
          })),
          selectedRegion: booking.region_id,
          selectedSuburb: booking.suburb_id,
          selectedDate: booking.booking_date,
          selectedTime: booking.start_time,
          address: booking.address || '',
          postcode: booking.postcode || '',
          specialInstructions: booking.special_instructions || '',
          selectedCleanerId: booking.cleaner_id,
          autoAssign: booking.auto_assign || false,
          totalPrice: booking.total_price,
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
          if (data.regionId !== undefined) newState.regionId = data.regionId;
          if (data.suburbId !== undefined) newState.suburbId = data.suburbId;
          if (data.startISO !== undefined) newState.startISO = data.startISO;
          if (data.endISO !== undefined) newState.endISO = data.endISO;
          if (data.cleanerId !== undefined) newState.cleanerId = data.cleanerId;
          if (data.customerInfo !== undefined) newState.customerInfo = { ...state.customerInfo, ...data.customerInfo };
          if (data.pricing !== undefined) newState.pricing = { ...state.pricing, ...data.pricing };
          
          // Update legacy fields for backward compatibility
          if (data.selectedService !== undefined) newState.selectedService = data.selectedService;
          if (data.bedroomCount !== undefined) newState.bedroomCount = data.bedroomCount;
          if (data.bathroomCount !== undefined) newState.bathroomCount = data.bathroomCount;
          if (data.selectedExtras !== undefined) newState.selectedExtras = data.selectedExtras;
          if (data.selectedRegion !== undefined) newState.selectedRegion = data.selectedRegion;
          if (data.selectedSuburb !== undefined) newState.selectedSuburb = data.selectedSuburb;
          if (data.selectedDate !== undefined) newState.selectedDate = data.selectedDate;
          if (data.selectedTime !== undefined) newState.selectedTime = data.selectedTime;
          if (data.address !== undefined) newState.address = data.address;
          if (data.address2 !== undefined) newState.address2 = data.address2;
          if (data.postcode !== undefined) newState.postcode = data.postcode;
          if (data.specialInstructions !== undefined) newState.specialInstructions = data.specialInstructions;
          if (data.selectedCleanerId !== undefined) newState.selectedCleanerId = data.selectedCleanerId;
          if (data.autoAssign !== undefined) newState.autoAssign = data.autoAssign;
          if (data.availableCleaners !== undefined) newState.availableCleaners = data.availableCleaners;
          if (data.basePrice !== undefined) newState.basePrice = data.basePrice;
          if (data.totalPrice !== undefined) newState.totalPrice = data.totalPrice;
          if (data.deliveryFee !== undefined) newState.deliveryFee = data.deliveryFee;
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
          newState.suburbId = quoteState.areaId;
          
          // Update legacy fields for backward compatibility
          newState.bedroomCount = quoteState.bedrooms || 1;
          newState.bathroomCount = quoteState.bathrooms || 1;
          newState.selectedExtras = quoteState.selectedExtras || [];
          newState.selectedSuburb = quoteState.areaId;
          
          // Reset other fields that need to be filled in booking flow
          newState.selectedDate = null;
          newState.selectedTime = null;
          newState.address = '';
          newState.postcode = '';
          newState.selectedCleanerId = null;
          newState.autoAssign = false;
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
        rooms: state.rooms,
        extras: state.extras,
        regionId: state.regionId,
        suburbId: state.suburbId,
        startISO: state.startISO,
        endISO: state.endISO,
        cleanerId: state.cleanerId,
        customerInfo: state.customerInfo,
        pricing: state.pricing,
        
        // Legacy fields for backward compatibility
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
