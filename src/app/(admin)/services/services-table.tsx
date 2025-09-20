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
import { Service } from "@/lib/database.types"
import { formatCurrency } from "@/lib/utils"

interface ServicesTableProps {
  services: Service[]
}

export function ServicesTable({ services }: ServicesTableProps) {
  const [_selectedServices, _setSelectedServices] = useState<Service[]>([])

  const columns: ColumnDef<Service>[] = [
    {
      accessorKey: "name",
      header: "Service Name",
      cell: ({ row }) => {
        const service = row.original
        return (
          <div className="flex flex-col">
            <span className="font-medium">{service.name}</span>
            <span className="text-sm text-gray-500">{service.slug}</span>
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
      accessorKey: "base_fee",
      header: "Base Fee",
      cell: ({ row }) => {
        const fee = row.getValue("base_fee") as number
        return formatCurrency(fee)
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
        const service = row.original

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
                onClick={() => navigator.clipboard.writeText(service.id)}
              >
                Copy service ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href={`/admin/services/${service.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View details
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={`/admin/services/${service.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit service
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete service
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
        data={services}
        searchKey="name"
        searchPlaceholder="Search services..."
      />
    </div>
  )
}

