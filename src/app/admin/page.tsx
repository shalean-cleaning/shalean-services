import Link from "next/link"
import { 
  Package, 
  DollarSign, 
  MapPin, 
  Users, 
  BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const quickActions = [
  {
    title: "Services",
    description: "Manage cleaning services and pricing",
    href: "/admin/services",
    icon: Package,
    color: "bg-blue-500"
  },
  {
    title: "Pricing",
    description: "Configure pricing rules and extras",
    href: "/admin/pricing", 
    icon: DollarSign,
    color: "bg-green-500"
  },
  {
    title: "Locations",
    description: "Manage serviceable areas and suburbs",
    href: "/admin/locations",
    icon: MapPin,
    color: "bg-purple-500"
  },
  {
    title: "Cleaners",
    description: "Manage cleaner profiles and availability",
    href: "/admin/cleaners",
    icon: Users,
    color: "bg-orange-500"
  },
  {
    title: "Reports",
    description: "View analytics and business insights",
    href: "/admin/reports",
    icon: BarChart3,
    color: "bg-indigo-500"
  }
]

export default function AdminPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage your cleaning service platform from this central hub.
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Card key={action.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {action.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={action.href}>
                  <Button className="w-full">
                    Manage {action.title}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and changes across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activity to display</p>
              <p className="text-sm">Activity will appear here as you manage the platform</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}