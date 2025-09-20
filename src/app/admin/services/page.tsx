import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ServicesTable } from "./services-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

async function getServices() {
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

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login?returnTo=/admin/services")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "ADMIN") {
    redirect("/")
  }

  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching services:", error)
    return []
  }

  return services || []
}

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="mt-2 text-gray-600">
            Manage your cleaning services and their pricing.
          </p>
        </div>
        <Link href="/admin/services/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </Link>
      </div>

      <ServicesTable services={services} />
    </div>
  )
}

