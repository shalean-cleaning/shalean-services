"use client"

import { useState, useEffect } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Edit, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/ui/data-table"
import { formatCurrency } from "@/lib/utils"
import { Service } from "@/lib/database.types"

interface ServicePricing {
  service_id: string
  service_name: string
  per_bedroom: number
  per_bathroom: number
  service_fee_flat: number
  service_fee_pct: number
  active_from: string
  active_to?: string
}

export function ServicePricingTable() {
  const [pricing, setPricing] = useState<ServicePricing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch service pricing data
    // For now, we'll show a placeholder
    setLoading(false)
  }, [])

  const columns: ColumnDef<ServicePricing>[] = [
    {
      accessorKey: "service_name",
      header: "Service",
      cell: ({ row }) => {
        const service = row.original
        return (
          <div className="font-medium">{service.service_name}</div>
        )
      },
    },
    {
      accessorKey: "per_bedroom",
      header: "Per Bedroom",
      cell: ({ row }) => {
        const amount = row.getValue("per_bedroom") as number
        return formatCurrency(amount)
      },
    },
    {
      accessorKey: "per_bathroom",
      header: "Per Bathroom",
      cell: ({ row }) => {
        const amount = row.getValue("per_bathroom") as number
        return formatCurrency(amount)
      },
    },
    {
      accessorKey: "service_fee_flat",
      header: "Service Fee (Flat)",
      cell: ({ row }) => {
        const amount = row.getValue("service_fee_flat") as number
        return amount > 0 ? formatCurrency(amount) : "-"
      },
    },
    {
      accessorKey: "service_fee_pct",
      header: "Service Fee (%)",
      cell: ({ row }) => {
        const percentage = row.getValue("service_fee_pct") as number
        return percentage > 0 ? `${percentage}%` : "-"
      },
    },
    {
      accessorKey: "active_from",
      header: "Active From",
      cell: ({ row }) => {
        const date = new Date(row.getValue("active_from"))
        return date.toLocaleDateString()
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const pricing = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(pricing.service_id)}
              >
                Copy service ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href={`/admin/pricing/service-pricing/${pricing.service_id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit pricing
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete pricing
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (loading) {
    return <div>Loading pricing data...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Service Pricing Rules</h3>
          <p className="text-sm text-gray-500">
            Configure how pricing is calculated for each service
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Pricing Rule
        </Button>
      </div>
      
      {pricing.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No pricing rules configured yet.</p>
          <p className="text-sm">Add pricing rules to define how services are priced.</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={pricing}
          searchKey="service_name"
          searchPlaceholder="Search services..."
        />
      )}
    </div>
  )
}

