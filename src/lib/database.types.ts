// Database Types for Shalean Services
// Generated from Supabase schema

export type UserRole = 'CUSTOMER' | 'CLEANER' | 'ADMIN';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type NotificationType = 'BOOKING_CONFIRMED' | 'BOOKING_REMINDER' | 'PAYMENT_RECEIVED' | 'CLEANER_ASSIGNED' | 'RATING_REQUEST';

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  category_id?: string;
  name: string;
  description?: string;
  base_price: number;
  duration_minutes: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceItem {
  id: string;
  service_id: string;
  name: string;
  description?: string;
  is_included: boolean;
  additional_price: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Extra {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PricingRule {
  id: string;
  name: string;
  rule_type: string;
  condition_json: Record<string, unknown>;
  price_modifier: number;
  is_percentage: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Region {
  id: string;
  name: string;
  state: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Suburb {
  id: string;
  region_id: string;
  name: string;
  postcode?: string;
  delivery_fee: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cleaner {
  id: string;
  profile_id: string;
  bio?: string;
  experience_years: number;
  hourly_rate?: number;
  is_available: boolean;
  rating: number;
  total_ratings: number;
  created_at: string;
  updated_at: string;
}

export interface CleanerLocation {
  id: string;
  cleaner_id: string;
  suburb_id: string;
  created_at: string;
}

export interface AvailabilitySlot {
  id: string;
  cleaner_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  cleaner_id?: string;
  suburb_id: string;
  service_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  total_price: number;
  notes?: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingItem {
  id: string;
  booking_id: string;
  service_item_id: string;
  is_completed: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingExtra {
  id: string;
  booking_id: string;
  extra_id: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  status: PaymentStatus;
  payment_method?: string;
  transaction_id?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  read_at?: string;
}

export interface Rating {
  id: string;
  booking_id: string;
  customer_id: string;
  cleaner_id: string;
  rating: number;
  comment?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string
  email: string
  service_id: string
  suburb_id: string
  bedrooms: number
  bathrooms: number
  frequency: string
  extras: Array<{
    id: string
    quantity: number
    price: number
  }>
  total_price: number
  status: 'pending' | 'contacted' | 'converted' | 'expired'
  notes?: string
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  author_id?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentBlock {
  id: string;
  section_key: string;
  title: string;
  description?: string;
  icon_name?: string;
  order_index: number;
  metadata?: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author_name: string;
  author_role?: string;
  author_image?: string;
  rating?: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

// View Types
export interface CleanerAvailabilityView {
  cleaner_id: string;
  profile_id: string;
  first_name: string;
  last_name: string;
  rating: number;
  total_ratings: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface BookingDetailsView {
  id: string;
  customer_id: string;
  cleaner_id?: string;
  suburb_id: string;
  service_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  total_price: number;
  notes?: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone?: string;
  cleaner_first_name?: string;
  cleaner_last_name?: string;
  cleaner_phone?: string;
  service_name: string;
  service_description?: string;
  duration_minutes: number;
  suburb_name: string;
  postcode?: string;
  delivery_fee: number;
  region_name: string;
  state: string;
}

export interface ServicePricingView {
  service_id: string;
  service_name: string;
  base_price: number;
  duration_minutes: number;
  category_name?: string;
  extras_total: number;
  delivery_fee: number;
  service_fee: number;
  total_price: number;
}

export interface CleanerPerformanceView {
  cleaner_id: string;
  cleaner_name: string;
  rating: number;
  total_ratings: number;
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  avg_booking_value: number;
  total_revenue: number;
}

export interface CustomerBookingHistoryView {
  customer_id: string;
  customer_name: string;
  email: string;
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_spent: number;
  avg_booking_value: number;
  last_booking_date?: string;
}

// Function Parameter Types
export interface BookingExtraInput {
  extra_id: string;
  quantity: number;
  price: number;
}

export interface AvailableCleaner {
  cleaner_id: string;
  cleaner_name: string;
  rating: number;
  total_ratings: number;
}

// Database Response Types
export interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  error: Error | null;
}

// Insert/Update Types (omitting auto-generated fields)
export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type ServiceCategoryInsert = Omit<ServiceCategory, 'id' | 'created_at' | 'updated_at'>;
export type ServiceInsert = Omit<Service, 'id' | 'created_at' | 'updated_at'>;
export type ServiceItemInsert = Omit<ServiceItem, 'id' | 'created_at' | 'updated_at'>;
export type ExtraInsert = Omit<Extra, 'id' | 'created_at' | 'updated_at'>;
export type PricingRuleInsert = Omit<PricingRule, 'id' | 'created_at' | 'updated_at'>;
export type RegionInsert = Omit<Region, 'id' | 'created_at' | 'updated_at'>;
export type SuburbInsert = Omit<Suburb, 'id' | 'created_at' | 'updated_at'>;
export type CleanerInsert = Omit<Cleaner, 'id' | 'created_at' | 'updated_at'>;
export type CleanerLocationInsert = Omit<CleanerLocation, 'id' | 'created_at'>;
export type AvailabilitySlotInsert = Omit<AvailabilitySlot, 'id' | 'created_at' | 'updated_at'>;
export type BookingInsert = Omit<Booking, 'id' | 'created_at' | 'updated_at'>;
export type BookingItemInsert = Omit<BookingItem, 'id' | 'created_at' | 'updated_at'>;
export type BookingExtraInsert = Omit<BookingExtra, 'id' | 'created_at'>;
export type PaymentInsert = Omit<Payment, 'id' | 'created_at' | 'updated_at'>;
export type NotificationInsert = Omit<Notification, 'id' | 'created_at'>;
export type RatingInsert = Omit<Rating, 'id' | 'created_at' | 'updated_at'>;
export type BlogPostInsert = Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>;
export type ContentBlockInsert = Omit<ContentBlock, 'id' | 'created_at' | 'updated_at'>;
export type TestimonialInsert = Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>;

// Update Types (omitting immutable fields)
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
export type ServiceCategoryUpdate = Partial<Omit<ServiceCategory, 'id' | 'created_at' | 'updated_at'>>;
export type ServiceUpdate = Partial<Omit<Service, 'id' | 'created_at' | 'updated_at'>>;
export type ServiceItemUpdate = Partial<Omit<ServiceItem, 'id' | 'created_at' | 'updated_at'>>;
export type ExtraUpdate = Partial<Omit<Extra, 'id' | 'created_at' | 'updated_at'>>;
export type PricingRuleUpdate = Partial<Omit<PricingRule, 'id' | 'created_at' | 'updated_at'>>;
export type RegionUpdate = Partial<Omit<Region, 'id' | 'created_at' | 'updated_at'>>;
export type SuburbUpdate = Partial<Omit<Suburb, 'id' | 'created_at' | 'updated_at'>>;
export type CleanerUpdate = Partial<Omit<Cleaner, 'id' | 'created_at' | 'updated_at'>>;
export type AvailabilitySlotUpdate = Partial<Omit<AvailabilitySlot, 'id' | 'created_at' | 'updated_at'>>;
export type BookingUpdate = Partial<Omit<Booking, 'id' | 'created_at' | 'updated_at'>>;
export type BookingItemUpdate = Partial<Omit<BookingItem, 'id' | 'created_at' | 'updated_at'>>;
export type PaymentUpdate = Partial<Omit<Payment, 'id' | 'created_at' | 'updated_at'>>;
export type NotificationUpdate = Partial<Omit<Notification, 'id' | 'created_at'>>;
export type RatingUpdate = Partial<Omit<Rating, 'id' | 'created_at' | 'updated_at'>>;
export type BlogPostUpdate = Partial<Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>>;
export type ContentBlockUpdate = Partial<Omit<ContentBlock, 'id' | 'created_at' | 'updated_at'>>;
export type TestimonialUpdate = Partial<Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>>;
