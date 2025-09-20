"use client"

// import { useState } from "react"
import { Calendar, Clock, DollarSign } from "lucide-react"
import { JobCard } from "./job-card"

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

interface JobDashboardProps {
  jobs: Job[]
}

export function JobDashboard({ jobs }: JobDashboardProps) {
  const today = new Date().toISOString().split('T')[0]
  
  // Separate jobs into today's and upcoming
  const todaysJobs = jobs.filter(job => job.booking_date === today)
  const upcomingJobs = jobs.filter(job => job.booking_date > today)
  const completedJobs = jobs.filter(job => job.status === "COMPLETED")

  const _getStatusColor = (status: string) => {
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

  return (
    <div className="space-y-8">
      {/* Today's Jobs */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Today's Jobs</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {todaysJobs.length}
          </span>
        </div>
        
        {todaysJobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No jobs scheduled for today</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {todaysJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Jobs */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Jobs</h2>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {upcomingJobs.length}
          </span>
        </div>
        
        {upcomingJobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No upcoming jobs scheduled</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {upcomingJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900">{todaysJobs.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingJobs.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                ${completedJobs.reduce((sum, job) => sum + job.total_price, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
