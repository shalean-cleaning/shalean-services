'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { LogoutButton } from '@/components/auth/LogoutButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase-client'
import { formatDateYMD } from '@/lib/dates'

export default function AccountPage() {
  const { user, profile, loading } = useUser()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name)
      setLastName(profile.last_name)
      setPhone(profile.phone || '')
    }
  }, [profile])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setUpdating(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
        })
        .eq('id', user.id)

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Profile updated successfully!')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Profile Information</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                    {success}
                  </div>
                )}
                <Button type="submit" disabled={updating}>
                  {updating ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Account Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Role</span>
                  <span className="text-sm text-gray-600 capitalize">
                    {profile?.role?.toLowerCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Member Since</span>
                  <span className="text-sm text-gray-600">
                    {profile?.created_at ? formatDateYMD(profile.created_at) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Status</span>
                  <span className="text-sm text-gray-600">
                    {profile?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="text-lg font-medium mb-4">Actions</h3>
              <div className="space-y-3">
                <LogoutButton className="w-full" />
                {profile?.role === 'ADMIN' && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/admin')}
                  >
                    Admin Dashboard
                  </Button>
                )}
                {profile?.role === 'CLEANER' && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/cleaner')}
                  >
                    Cleaner Dashboard
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
