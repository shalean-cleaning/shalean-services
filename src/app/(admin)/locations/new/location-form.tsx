"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { createLocation } from "./actions"

export function LocationForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    price_adjustment_pct: "0",
    active: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await createLocation({
        name: formData.name,
        price_adjustment_pct: parseFloat(formData.price_adjustment_pct),
        active: formData.active,
      })

      if (result.success) {
        router.push("/admin/locations")
      } else {
        console.error("Error creating location:", result.error)
        // TODO: Show error message to user
      }
    } catch (error) {
      console.error("Error creating location:", error)
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
        <CardTitle>Location Details</CardTitle>
        <CardDescription>
          Add a new serviceable area with optional pricing adjustments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Location Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Sydney CBD, Melbourne Inner"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price_adjustment_pct">Price Adjustment (%)</Label>
            <Input
              id="price_adjustment_pct"
              type="number"
              step="0.01"
              value={formData.price_adjustment_pct}
              onChange={(e) => handleInputChange("price_adjustment_pct", e.target.value)}
              placeholder="0.00"
            />
            <p className="text-sm text-gray-500">
              Positive values increase prices, negative values decrease prices. Leave at 0 for no adjustment.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleInputChange("active", checked as boolean)}
            />
            <Label htmlFor="active">Location is active</Label>
          </div>

          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Creating..." : "Create Location"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/locations")}
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

