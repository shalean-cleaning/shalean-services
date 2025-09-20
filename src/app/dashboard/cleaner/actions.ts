"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function updateBookingStatus(bookingId: string, newStatus: string) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  // Verify the user is a cleaner
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "CLEANER") {
    throw new Error("Unauthorized: Only cleaners can update booking status")
  }

  // Verify the booking is assigned to this cleaner
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("cleaner_id, status")
    .eq("id", bookingId)
    .single()

  if (fetchError) {
    throw new Error("Booking not found")
  }

  if (booking.cleaner_id !== user.id) {
    throw new Error("Unauthorized: You can only update your own bookings")
  }

  // Validate status transition
  const validTransitions: Record<string, string[]> = {
    "CONFIRMED": ["IN_PROGRESS", "CANCELLED"],
    "IN_PROGRESS": ["COMPLETED", "CANCELLED"],
    "COMPLETED": [], // No transitions from completed
    "CANCELLED": [] // No transitions from cancelled
  }

  if (!validTransitions[booking.status]?.includes(newStatus)) {
    throw new Error(`Invalid status transition from ${booking.status} to ${newStatus}`)
  }

  // Update the booking status
  const { error: updateError } = await supabase
    .from("bookings")
    .update({ 
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", bookingId)

  if (updateError) {
    throw new Error("Failed to update booking status")
  }

  // Revalidate the dashboard page to show updated data
  revalidatePath("/dashboard/cleaner")
  
  return { success: true }
}

export async function getCleanerProfile(userId: string) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) {
    throw new Error("Failed to fetch cleaner profile")
  }

  return profile
}

export async function updateCleanerProfile(userId: string, updates: {
  first_name?: string
  last_name?: string
  phone?: string
}) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || user.id !== userId) {
    throw new Error("Unauthorized")
  }

  // Verify the user is a cleaner
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "CLEANER") {
    throw new Error("Unauthorized: Only cleaners can update their profile")
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId)

  if (error) {
    throw new Error("Failed to update profile")
  }

  revalidatePath("/dashboard/cleaner/profile")
  
  return { success: true }
}
