import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CleanerDashboard() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Cleaner Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage your bookings and availability
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today&apos;s Bookings</CardTitle>
                <CardDescription>Your scheduled cleanings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  View and manage your bookings for today.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
                <CardDescription>Future scheduled cleanings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  See your upcoming bookings and prepare accordingly.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
                <CardDescription>Set your working hours</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Update your availability schedule and working hours.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your cleaner profile</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Update your bio, experience, and hourly rate.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Earnings</CardTitle>
                <CardDescription>Track your income</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  View your earnings and payment history.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Ratings</CardTitle>
                <CardDescription>Customer feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  See customer ratings and reviews for your work.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
