import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { LocationsTable } from "./locations-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

async function getLocations() {
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
    redirect("/auth/login?returnTo=/admin/locations")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "ADMIN") {
    redirect("/")
  }

  const { data: locations, error } = await supabase
    .from("areas")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching locations:", error)
    return []
  }

  return locations || []
}

export default async function LocationsPage() {
  const locations = await getLocations()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
          <p className="mt-2 text-gray-600">
            Manage serviceable areas and their pricing adjustments.
          </p>
        </div>
        <Link href="/admin/locations/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </Link>
      </div>

      <LocationsTable locations={locations} />
    </div>
  )
}

