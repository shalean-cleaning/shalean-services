"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
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
import { Area } from "@/lib/database.types"

interface LocationsTableProps {
  locations: Area[]
}

export function LocationsTable({ locations }: LocationsTableProps) {
  const [selectedLocations, setSelectedLocations] = useState<Area[]>([])

  const columns: ColumnDef<Area>[] = [
    {
      accessorKey: "name",
      header: "Location Name",
      cell: ({ row }) => {
        const location = row.original
        return (
          <div className="flex flex-col">
            <span className="font-medium">{location.name}</span>
            <span className="text-sm text-gray-500">{location.slug}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "price_adjustment_pct",
      header: "Price Adjustment",
      cell: ({ row }) => {
        const adjustment = row.getValue("price_adjustment_pct") as number
        const isPositive = adjustment > 0
        const isNegative = adjustment < 0
        const isNeutral = adjustment === 0
        
        return (
          <div className={`font-medium ${
            isPositive ? "text-green-600" : 
            isNegative ? "text-red-600" : 
            "text-gray-600"
          }`}>
            {isPositive ? "+" : ""}{adjustment}%
          </div>
        )
      },
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("active") as boolean
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"))
        return date.toLocaleDateString()
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const location = row.original

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
                onClick={() => navigator.clipboard.writeText(location.id)}
              >
                Copy location ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href={`/admin/locations/${location.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View details
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={`/admin/locations/${location.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit location
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete location
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={locations}
        searchKey="name"
        searchPlaceholder="Search locations..."
      />
    </div>
  )
}

