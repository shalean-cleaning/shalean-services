import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-red-600">
            Access Denied
          </CardTitle>
          <CardDescription className="text-center">
            You don&apos;t have permission to access this page. Please contact an administrator if you believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Link href="/">
              <Button className="w-full">
                Go Home
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <Link href="/auth/login">
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
