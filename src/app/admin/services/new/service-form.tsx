"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { createService } from "./actions"

export function ServiceForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_fee: "",
    active: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await createService({
        name: formData.name,
        description: formData.description,
        base_fee: parseFloat(formData.base_fee),
        active: formData.active,
      })

      if (result.success) {
        router.push("/admin/services")
      } else {
        console.error("Error creating service:", result.error)
        // TODO: Show error message to user
      }
    } catch (error) {
      console.error("Error creating service:", error)
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Service Details</CardTitle>
        <CardDescription>
          Fill in the details for your new cleaning service.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Regular House Cleaning"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe what this service includes..."
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="base_fee">Base Fee (AUD) *</Label>
            <Input
              id="base_fee"
              type="number"
              step="0.01"
              min="0"
              value={formData.base_fee}
              onChange={(e) => handleInputChange("base_fee", e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleInputChange("active", checked as boolean)}
            />
            <Label htmlFor="active">Service is active</Label>
          </div>

          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Creating..." : "Create Service"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/services")}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

