"use client"

import { useState } from "react"
import { Calendar, Clock, MapPin, User, Phone, Home, Bath, CheckCircle, Car } from "lucide-react"
import { updateBookingStatus } from "./actions"

interface Job {
  id: string
  booking_date: string
  start_time: string
  end_time: string
  status: string
  total_price: number
  address: string | null
  notes: string | null
  special_instructions: string | null
  bedrooms: number | null
  bathrooms: number | null
  services: {
    name: string
    description: string
  } | null
  profiles: {
    first_name: string
    last_name: string
    phone: string | null
  } | null
  suburbs: {
    name: string
    postcode: string
  } | null
}

interface JobCardProps {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800"
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800"
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmed"
      case "IN_PROGRESS":
        return "In Progress"
      case "COMPLETED":
        return "Completed"
      case "CANCELLED":
        return "Cancelled"
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      await updateBookingStatus(job.id, newStatus)
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getAvailableActions = () => {
    switch (job.status) {
      case "CONFIRMED":
        return [
          { label: "On My Way", status: "IN_PROGRESS", icon: Car, color: "bg-blue-600 hover:bg-blue-700" }
        ]
      case "IN_PROGRESS":
        return [
          { label: "Mark Complete", status: "COMPLETED", icon: CheckCircle, color: "bg-green-600 hover:bg-green-700" }
        ]
      default:
        return []
    }
  }

  const availableActions = getAvailableActions()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {job.services?.name || "Cleaning Service"}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
              {getStatusText(job.status)}
            </span>
          </div>

          {/* Customer Info */}
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {job.profiles?.first_name} {job.profiles?.last_name}
            </span>
            {job.profiles?.phone && (
              <>
                <span className="text-gray-300">•</span>
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{job.profiles.phone}</span>
              </>
            )}
          </div>

          {/* Date and Time */}
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{formatDate(job.booking_date)}</span>
            <span className="text-gray-300">•</span>
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {formatTime(job.start_time)} - {formatTime(job.end_time)}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {job.address && `${job.address}, `}
              {job.suburbs?.name} {job.suburbs?.postcode}
            </span>
          </div>

          {/* Property Details */}
          {(job.bedrooms || job.bathrooms) && (
            <div className="flex items-center gap-4 mb-3">
              {job.bedrooms && (
                <div className="flex items-center gap-1">
                  <Home className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{job.bedrooms} bedroom{job.bedrooms !== 1 ? 's' : ''}</span>
                </div>
              )}
              {job.bathrooms && (
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{job.bathrooms} bathroom{job.bathrooms !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {job.notes && (
            <div className="mb-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Notes:</span> {job.notes}
              </p>
            </div>
          )}

          {/* Special Instructions */}
          {job.special_instructions && (
            <div className="mb-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Special Instructions:</span> {job.special_instructions}
              </p>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">${job.total_price.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {availableActions.length > 0 && (
          <div className="flex flex-col gap-2 ml-4">
            {availableActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.status}
                  onClick={() => handleStatusUpdate(action.status)}
                  disabled={isUpdating}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${action.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Icon className="h-4 w-4" />
                  {isUpdating ? "Updating..." : action.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
