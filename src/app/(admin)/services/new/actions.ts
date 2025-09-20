"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

interface CreateServiceData {
  name: string
  description: string
  base_fee: number
  active: boolean
}

export async function createService(data: CreateServiceData) {
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

  // Create the service
  const { data: service, error } = await supabase
    .from("services")
    .insert({
      name: data.name,
      description: data.description,
      slug: slug,
      base_fee: data.base_fee,
      active: data.active,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating service:", error)
    return { success: false, error: error.message }
  }

  // Revalidate the services page
  revalidatePath("/admin/services")

  return { success: true, service }
}

