"use client"

import { useState } from "react"
import { updateCleanerProfile } from "../actions"

interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  role: string
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ProfileFormProps {
  profile: Profile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    phone: profile.phone || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      await updateCleanerProfile(profile.id, formData)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Message */}
          {message && (
            <div className={`rounded-md p-4 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Email (read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="mt-1">
              <input
                type="email"
                id="email"
                value={profile.email}
                disabled
                className="block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Email cannot be changed. Contact support if you need to update your email.
            </p>
          </div>

          {/* First Name */}
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="first_name"
                id="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="last_name"
                id="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="mt-1">
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+61 4XX XXX XXX"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Optional. Used for customer contact and emergency situations.
            </p>
          </div>

          {/* Role (read-only) */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="role"
                value={profile.role}
                disabled
                className="block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Account Status (read-only) */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Account Status
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="status"
                value={profile.is_active ? 'Active' : 'Inactive'}
                disabled
                className="block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
