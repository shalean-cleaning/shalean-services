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

interface Extra {
  id: string
  name: string
  description: string
  price: number
  slug: string
  active: boolean
  created_at: string
}

export function ExtrasTable() {
  const [extras, setExtras] = useState<Extra[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch extras data
    // For now, we'll show a placeholder
    setLoading(false)
  }, [])

  const columns: ColumnDef<Extra>[] = [
    {
      accessorKey: "name",
      header: "Extra Name",
      cell: ({ row }) => {
        const extra = row.original
        return (
          <div className="flex flex-col">
            <span className="font-medium">{extra.name}</span>
            <span className="text-sm text-gray-500">{extra.slug}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string
        return (
          <div className="max-w-xs truncate" title={description}>
            {description || "No description"}
          </div>
        )
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const price = row.getValue("price") as number
        return formatCurrency(price)
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
        const extra = row.original

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
                onClick={() => navigator.clipboard.writeText(extra.id)}
              >
                Copy extra ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href={`/admin/pricing/extras/${extra.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit extra
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete extra
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (loading) {
    return <div>Loading extras data...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Service Extras</h3>
          <p className="text-sm text-gray-500">
            Additional services customers can add to their bookings
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Extra
        </Button>
      </div>
      
      {extras.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No extras configured yet.</p>
          <p className="text-sm">Add extras to provide additional services to customers.</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={extras}
          searchKey="name"
          searchPlaceholder="Search extras..."
        />
      )}
    </div>
  )
}

