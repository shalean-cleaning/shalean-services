import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { JobDashboard } from "../job-dashboard"

async function getCompletedJobs(userId: string) {
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

  // Get completed bookings assigned to this cleaner
  const { data: bookings, error } = await supabase
    .from("bookings")
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
      services (
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
    .eq("cleaner_id", userId)
    .eq("status", "COMPLETED")
    .order("booking_date", { ascending: false })
    .order("start_time", { ascending: false })
    .limit(50) // Limit to last 50 completed jobs

  if (error) {
    console.error("Error fetching completed jobs:", error)
    return []
  }

  return bookings || []
}

export default async function CompletedJobsPage() {
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

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login?returnTo=/dashboard/cleaner/completed")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "CLEANER") {
    redirect("/")
  }

  const jobs = await getCompletedJobs(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Completed Jobs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your recently completed cleaning jobs
        </p>
      </div>

      <JobDashboard jobs={jobs} />
    </div>
  )
}
