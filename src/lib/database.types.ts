export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          full_name: string
          phone: string | null
          role: 'ADMIN' | 'CLEANER' | 'CUSTOMER'
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          full_name: string
          phone?: string | null
          role?: 'ADMIN' | 'CLEANER' | 'CUSTOMER'
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          full_name?: string
          phone?: string | null
          role?: 'ADMIN' | 'CLEANER' | 'CUSTOMER'
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          id: string
          customer_id: string
          cleaner_id: string | null
          suburb_id: string
          service_id: string
          service_slug: string | null
          region_id: string | null
          booking_date: string
          start_time: string
          end_time: string
          start_ts: string | null
          end_ts: string | null
          status: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'READY_FOR_PAYMENT'
          total_price: number
          notes: string | null
          special_instructions: string | null
          auto_assign: boolean
          address: string | null
          postcode: string | null
          bedrooms: number | null
          bathrooms: number | null
          paystack_ref: string | null
          paystack_status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          cleaner_id?: string | null
          suburb_id: string
          service_id: string
          service_slug?: string | null
          region_id?: string | null
          booking_date: string
          start_time: string
          end_time: string
          start_ts?: string | null
          end_ts?: string | null
          status?: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'READY_FOR_PAYMENT'
          total_price: number
          notes?: string | null
          special_instructions?: string | null
          auto_assign?: boolean
          address?: string | null
          postcode?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          paystack_ref?: string | null
          paystack_status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          cleaner_id?: string | null
          suburb_id?: string
          service_id?: string
          service_slug?: string | null
          region_id?: string | null
          booking_date?: string
          start_time?: string
          end_time?: string
          start_ts?: string | null
          end_ts?: string | null
          status?: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'READY_FOR_PAYMENT'
          total_price?: number
          notes?: string | null
          special_instructions?: string | null
          auto_assign?: boolean
          address?: string | null
          postcode?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          paystack_ref?: string | null
          paystack_status?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_suburb_id_fkey"
            columns: ["suburb_id"]
            isOneToOne: false
            referencedRelation: "suburbs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          }
        ]
      }
      booking_items: {
        Row: {
          id: string
          booking_id: string
          service_item_id: string
          item_type: string | null
          qty: number
          unit_price: number
          subtotal: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          service_item_id: string
          item_type?: string | null
          qty?: number
          unit_price?: number
          subtotal?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          service_item_id?: string
          item_type?: string | null
          qty?: number
          unit_price?: number
          subtotal?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_service_item_id_fkey"
            columns: ["service_item_id"]
            isOneToOne: false
            referencedRelation: "service_items"
            referencedColumns: ["id"]
          }
        ]
      }
      cleaners: {
        Row: {
          id: string
          profile_id: string
          is_active: boolean
          is_available: boolean
          rating: number | null
          total_ratings: number | null
          experience_years: number | null
          bio: string | null
          hourly_rate: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          is_active?: boolean
          is_available?: boolean
          rating?: number | null
          total_ratings?: number | null
          experience_years?: number | null
          bio?: string | null
          hourly_rate?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          is_active?: boolean
          is_available?: boolean
          rating?: number | null
          total_ratings?: number | null
          experience_years?: number | null
          bio?: string | null
          hourly_rate?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cleaners_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          slug: string
          duration_minutes: number
          base_price: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          slug: string
          duration_minutes: number
          base_price: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          slug?: string
          duration_minutes?: number
          base_price?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_items: {
        Row: {
          id: string
          service_id: string
          name: string
          description: string | null
          price: number
          is_extra: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_id: string
          name: string
          description?: string | null
          price: number
          is_extra?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          name?: string
          description?: string | null
          price?: number
          is_extra?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
      }
      regions: {
        Row: {
  id: string
          name: string
          state: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          state: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          state?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      suburbs: {
        Row: {
    id: string
          name: string
          postcode: string
          region_id: string
          delivery_fee: number
          is_active: boolean
  created_at: string
  updated_at: string
}
        Insert: {
          id?: string
          name: string
          postcode: string
          region_id: string
          delivery_fee: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          postcode?: string
          region_id?: string
          delivery_fee?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suburbs_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          }
        ]
      }
      content_blocks: {
        Row: {
          id: string
          title: string
          description: string
          content_type: string
          order_index: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          content_type: string
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          content_type?: string
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string
          featured_image: string | null
          author_id: string
          published_at: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content: string
          featured_image?: string | null
          author_id: string
          published_at?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          featured_image?: string | null
          author_id?: string
          published_at?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      testimonials: {
        Row: {
          id: string
          author_name: string
          author_image: string | null
          quote: string
          rating: number | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_name: string
          author_image?: string | null
          quote: string
          rating?: number | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_name?: string
          author_image?: string | null
          quote?: string
          rating?: number | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      booking_details_view: {
        Row: {
          id: string
          customer_id: string
          cleaner_id: string | null
          suburb_id: string
          service_id: string
          service_slug: string | null
          region_id: string | null
          booking_date: string
          start_time: string
          end_time: string
          start_ts: string | null
          end_ts: string | null
          status: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'READY_FOR_PAYMENT'
          total_price: number
          notes: string | null
          special_instructions: string | null
          auto_assign: boolean
          paystack_ref: string | null
          paystack_status: string | null
          created_at: string
          updated_at: string
          customer_first_name: string | null
          customer_last_name: string | null
          customer_full_name: string | null
          customer_email: string
          customer_phone: string | null
          cleaner_profile_id: string | null
          cleaner_first_name: string | null
          cleaner_last_name: string | null
          cleaner_full_name: string | null
          cleaner_phone: string | null
          service_name: string
          service_description: string | null
          duration_minutes: number
          suburb_name: string
          suburb_postcode: string
          delivery_fee: number
          region_name: string
          state: string
        }
        Relationships: []
      }
      booking_items_view: {
        Row: {
          id: string
          booking_id: string
          service_item_id: string
          item_type: string | null
          qty: number
          unit_price: number
          subtotal: number
          created_at: string
          updated_at: string
          service_item_name: string
          service_item_description: string | null
          service_item_price: number | null
          customer_id: string
          cleaner_id: string | null
          booking_status: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'READY_FOR_PAYMENT'
          booking_total_price: number
          service_name: string
          service_slug: string
        }
        Relationships: []
      }
    }
    Functions: {
      auto_assign_cleaner_simple: {
        Args: {
          booking_id_val: string
        }
        Returns: string
      }
      get_available_cleaners: {
        Args: {
          booking_date_val: string
          start_time_val: string
          end_time_val: string
          suburb_id_val: string
        }
        Returns: {
          cleaner_id: string
          cleaner_name: string
          rating: number
          total_bookings: number
        }[]
      }
      is_booking_editable_by_customer: {
        Args: {
          booking_id: string
        }
        Returns: boolean
      }
      get_service_slug: {
        Args: {
          service_uuid: string
        }
        Returns: string
      }
      get_region_from_suburb: {
        Args: {
          suburb_uuid: string
        }
        Returns: string
      }
      calculate_booking_timestamps: {
        Args: {
          booking_date_val: string
          start_time_val: string
          end_time_val: string
        }
        Returns: {
          start_ts: string
          end_ts: string
        }[]
      }
      calculate_booking_price: {
        Args: {
          p_service_id: string
          p_suburb_id: string
          p_extras: string
        }
        Returns: {
          base_price: number
          extras_price: number
          total_price: number
        }[]
      }
    }
    Enums: {
      user_role: 'ADMIN' | 'CLEANER' | 'CUSTOMER'
      booking_status: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'READY_FOR_PAYMENT'
      payment_status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
      notification_type: 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'PAYMENT_RECEIVED' | 'CLEANER_ASSIGNED'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type aliases for easier use
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type BookingItem = Database['public']['Tables']['booking_items']['Row']
export type Cleaner = Database['public']['Tables']['cleaners']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type ServiceItem = Database['public']['Tables']['service_items']['Row']
export type Region = Database['public']['Tables']['regions']['Row']
export type Suburb = Database['public']['Tables']['suburbs']['Row']
export type ContentBlock = Database['public']['Tables']['content_blocks']['Row']
export type BlogPost = Database['public']['Tables']['blog_posts']['Row']
export type Testimonial = Database['public']['Tables']['testimonials']['Row']

// View types
export type BookingDetailsView = Database['public']['Views']['booking_details_view']['Row']
export type BookingItemsView = Database['public']['Views']['booking_items_view']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type BookingInsert = Database['public']['Tables']['bookings']['Insert']
export type BookingItemInsert = Database['public']['Tables']['booking_items']['Insert']
export type CleanerInsert = Database['public']['Tables']['cleaners']['Insert']
export type ServiceInsert = Database['public']['Tables']['services']['Insert']
export type ServiceItemInsert = Database['public']['Tables']['service_items']['Insert']
export type RegionInsert = Database['public']['Tables']['regions']['Insert']
export type SuburbInsert = Database['public']['Tables']['suburbs']['Insert']
export type ContentBlockInsert = Database['public']['Tables']['content_blocks']['Insert']
export type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert']
export type TestimonialInsert = Database['public']['Tables']['testimonials']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type BookingUpdate = Database['public']['Tables']['bookings']['Update']
export type BookingItemUpdate = Database['public']['Tables']['booking_items']['Update']
export type CleanerUpdate = Database['public']['Tables']['cleaners']['Update']
export type ServiceUpdate = Database['public']['Tables']['services']['Update']
export type ServiceItemUpdate = Database['public']['Tables']['service_items']['Update']
export type RegionUpdate = Database['public']['Tables']['regions']['Update']
export type SuburbUpdate = Database['public']['Tables']['suburbs']['Update']
export type ContentBlockUpdate = Database['public']['Tables']['content_blocks']['Update']
export type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update']
export type TestimonialUpdate = Database['public']['Tables']['testimonials']['Update']

// Enum types
export type UserRole = Database['public']['Enums']['user_role']
export type BookingStatus = Database['public']['Enums']['booking_status']
export type PaymentStatus = Database['public']['Enums']['payment_status']
export type NotificationType = Database['public']['Enums']['notification_type']
