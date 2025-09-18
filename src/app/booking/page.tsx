import { getServices } from "@/lib/services";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Home, Sparkles, Truck, Hammer } from "lucide-react";

const serviceIcons = {
  'standard-cleaning': Home,
  'deep-cleaning': Sparkles,
  'move-in-out': Truck,
  'post-construction': Hammer,
};

export default async function BookingPage() {
  const services = await getServices();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Book Your Cleaning Service
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose from our range of professional cleaning services and book your appointment today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const IconComponent = serviceIcons[service.slug as keyof typeof serviceIcons] || Home;
            
            return (
              <Card key={service.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {service.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Starting from</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${service.base_price}
                      </span>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/book/${service.slug}`}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Book This Service
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Not sure which service you need?
          </p>
          <Button variant="outline" asChild>
            <Link href="/quote">
              Get a Custom Quote
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}