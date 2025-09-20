"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ServicePricingTable } from "./service-pricing-table"
import { ExtrasTable } from "./extras-table"

export function PricingTabs() {
  return (
    <Tabs defaultValue="service-pricing" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="service-pricing">Service Pricing</TabsTrigger>
        <TabsTrigger value="extras">Extras</TabsTrigger>
      </TabsList>
      
      <TabsContent value="service-pricing" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Service Pricing Rules</CardTitle>
            <CardDescription>
              Configure per-bedroom, per-bathroom pricing and service fees for each service.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ServicePricingTable />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="extras" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Service Extras</CardTitle>
            <CardDescription>
              Manage additional services that customers can add to their bookings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExtrasTable />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

