"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

interface CreateLocationData {
  name: string
  price_adjustment_pct: number
  active: boolean
}

export async function createLocation(data: CreateLocationData) {
  const cookieStore = cookies()
  
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

  // Check authentication and admin role
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "ADMIN") {
    redirect("/")
  }

  // Generate slug from name
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  // Create the location
  const { data: location, error } = await supabase
    .from("areas")
    .insert({
      name: data.name,
      slug: slug,
      price_adjustment_pct: data.price_adjustment_pct,
      active: data.active,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating location:", error)
    return { success: false, error: error.message }
  }

  // Revalidate the locations page
  revalidatePath("/admin/locations")

  return { success: true, location }
}

