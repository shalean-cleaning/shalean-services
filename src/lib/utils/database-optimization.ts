/**
 * Database query optimization utilities
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

/**
 * Optimized query builder for common database operations
 */
export class QueryBuilder {
  private client: SupabaseClient<Database>;
  
  constructor(client: SupabaseClient<Database>) {
    this.client = client;
  }
  
  /**
   * Get services with optimized fields
   */
  async getServices() {
    return this.client
      .from('services')
      .select('id, name, slug, description, base_fee, active')
      .eq('active', true)
      .order('name');
  }
  
  /**
   * Get extras with optimized fields
   */
  async getExtras() {
    return this.client
      .from('extras')
      .select('id, name, slug, description, price, active')
      .eq('active', true)
      .order('name');
  }
  
  /**
   * Get regions with optimized fields
   */
  async getRegions() {
    return this.client
      .from('regions')
      .select('id, name, slug, state, active')
      .eq('active', true)
      .order('name');
  }
  
  /**
   * Get suburbs with optimized fields
   */
  async getSuburbs(regionId?: string) {
    let query = this.client
      .from('suburbs')
      .select('id, name, slug, postcode, delivery_fee, price_adjustment_pct, active, region_id')
      .eq('active', true)
      .order('name');
    
    if (regionId) {
      query = query.eq('region_id', regionId);
    }
    
    return query;
  }
  
  /**
   * Get cleaners with optimized fields
   */
  async getCleaners() {
    return this.client
      .from('cleaners')
      .select('id, name, bio, avatar_url, active, rating, total_ratings, experience_years')
      .eq('active', true)
      .order('name');
  }
  
  /**
   * Get bookings with optimized fields and joins
   */
  async getBookings(cleanerId?: string, limit: number = 50) {
    let query = this.client
      .from('bookings')
      .select(`
        id,
        booking_date,
        start_time,
        end_time,
        status,
        total_price,
        address,
        notes,
        special_instructions,
        bedrooms,
        bathrooms,
        services!inner (
          name,
          description
        ),
        profiles!bookings_customer_id_fkey (
          first_name,
          last_name,
          phone
        ),
        suburbs (
          name,
          postcode
        )
      `)
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(limit);
    
    if (cleanerId) {
      query = query.eq('cleaner_id', cleanerId);
    }
    
    return query;
  }
  
  /**
   * Get today's bookings for a cleaner
   */
  async getTodaysBookings(cleanerId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    return this.client
      .from('bookings')
      .select(`
        id,
        booking_date,
        start_time,
        end_time,
        status,
        total_price,
        address,
        notes,
        special_instructions,
        bedrooms,
        bathrooms,
        services!inner (
          name,
          description
        ),
        profiles!bookings_customer_id_fkey (
          first_name,
          last_name,
          phone
        ),
        suburbs (
          name,
          postcode
        )
      `)
      .eq('cleaner_id', cleanerId)
      .eq('booking_date', today)
      .in('status', ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'])
      .order('start_time', { ascending: true });
  }
  
  /**
   * Get upcoming bookings for a cleaner
   */
  async getUpcomingBookings(cleanerId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    return this.client
      .from('bookings')
      .select(`
        id,
        booking_date,
        start_time,
        end_time,
        status,
        total_price,
        address,
        notes,
        special_instructions,
        bedrooms,
        bathrooms,
        services!inner (
          name,
          description
        ),
        profiles!bookings_customer_id_fkey (
          first_name,
          last_name,
          phone
        ),
        suburbs (
          name,
          postcode
        )
      `)
      .eq('cleaner_id', cleanerId)
      .gt('booking_date', today)
      .in('status', ['CONFIRMED', 'IN_PROGRESS'])
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true });
  }
}

/**
 * Database connection pool manager
 */
export class DatabasePool {
  private static instance: DatabasePool;
  private clients: Map<string, SupabaseClient<Database>> = new Map();
  
  private constructor() {}
  
  static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool();
    }
    return DatabasePool.instance;
  }
  
  getClient(key: string = 'default'): SupabaseClient<Database> {
    if (!this.clients.has(key)) {
      const client = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      this.clients.set(key, client);
    }
    
    return this.clients.get(key)!;
  }
  
  getQueryBuilder(key: string = 'default'): QueryBuilder {
    return new QueryBuilder(this.getClient(key));
  }
}

/**
 * Database query cache with TTL
 */
export class QueryCache {
  private cache = new Map<string, { data: any; expires: number }>();
  private ttl: number;
  
  constructor(ttl: number = 5 * 60 * 1000) { // 5 minutes default
    this.ttl = ttl;
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }
  
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.ttl
    });
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  generateKey(table: string, filters: Record<string, any> = {}): string {
    const filterString = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|');
    
    return `${table}:${filterString}`;
  }
}

/**
 * Optimized database operations with caching
 */
export class OptimizedDatabase {
  private queryBuilder: QueryBuilder;
  private cache: QueryCache;
  
  constructor() {
    const pool = DatabasePool.getInstance();
    this.queryBuilder = pool.getQueryBuilder();
    this.cache = new QueryCache();
  }
  
  async getServices() {
    const cacheKey = this.cache.generateKey('services');
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const { data, error } = await this.queryBuilder.getServices();
    
    if (error) {
      throw error;
    }
    
    this.cache.set(cacheKey, data);
    return data;
  }
  
  async getExtras() {
    const cacheKey = this.cache.generateKey('extras');
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const { data, error } = await this.queryBuilder.getExtras();
    
    if (error) {
      throw error;
    }
    
    this.cache.set(cacheKey, data);
    return data;
  }
  
  async getRegions() {
    const cacheKey = this.cache.generateKey('regions');
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const { data, error } = await this.queryBuilder.getRegions();
    
    if (error) {
      throw error;
    }
    
    this.cache.set(cacheKey, data);
    return data;
  }
  
  async getSuburbs(regionId?: string) {
    const cacheKey = this.cache.generateKey('suburbs', { regionId: regionId || 'all' });
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const { data, error } = await this.queryBuilder.getSuburbs(regionId);
    
    if (error) {
      throw error;
    }
    
    this.cache.set(cacheKey, data);
    return data;
  }
  
  async getCleaners() {
    const cacheKey = this.cache.generateKey('cleaners');
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const { data, error } = await this.queryBuilder.getCleaners();
    
    if (error) {
      throw error;
    }
    
    this.cache.set(cacheKey, data);
    return data;
  }
  
  async getBookings(cleanerId?: string, limit: number = 50) {
    const cacheKey = this.cache.generateKey('bookings', { cleanerId: cleanerId || 'all', limit });
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const { data, error } = await this.queryBuilder.getBookings(cleanerId, limit);
    
    if (error) {
      throw error;
    }
    
    this.cache.set(cacheKey, data);
    return data;
  }
  
  async getTodaysBookings(cleanerId: string) {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = this.cache.generateKey('bookings_today', { cleanerId, date: today });
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const { data, error } = await this.queryBuilder.getTodaysBookings(cleanerId);
    
    if (error) {
      throw error;
    }
    
    this.cache.set(cacheKey, data);
    return data;
  }
  
  async getUpcomingBookings(cleanerId: string) {
    const cacheKey = this.cache.generateKey('bookings_upcoming', { cleanerId });
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const { data, error } = await this.queryBuilder.getUpcomingBookings(cleanerId);
    
    if (error) {
      throw error;
    }
    
    this.cache.set(cacheKey, data);
    return data;
  }
  
  /**
   * Clear cache for specific table
   */
  clearCache(table: string): void {
    const keys = Array.from(this.cache['cache'].keys());
    keys.forEach(key => {
      if (key.startsWith(`${table}:`)) {
        this.cache.delete(key);
      }
    });
  }
  
  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const optimizedDb = new OptimizedDatabase();
