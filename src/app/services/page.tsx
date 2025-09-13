import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, Home, Building, Sparkles, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Services",
  description: "Professional cleaning services for homes and businesses. Residential, commercial, deep cleaning, and move-in/move-out services.",
};

export default function Services() {
  const services = [
    {
      icon: Home,
      title: "Residential Cleaning",
      description: "Regular house cleaning services to keep your home spotless and comfortable.",
      features: [
        "Weekly, bi-weekly, or monthly cleaning",
        "All rooms cleaned thoroughly",
        "Kitchen and bathroom deep clean",
        "Dusting and vacuuming",
        "Trash removal",
      ],
      price: "Starting at $120",
      href: "/services/residential",
    },
    {
      icon: Building,
      title: "Commercial Cleaning",
      description: "Professional office and commercial space cleaning for businesses.",
      features: [
        "Office cleaning and maintenance",
        "Restroom sanitization",
        "Floor care and maintenance",
        "Window cleaning",
        "Customized cleaning schedules",
      ],
      price: "Starting at $200",
      href: "/services/commercial",
    },
    {
      icon: Sparkles,
      title: "Deep Cleaning",
      description: "Intensive cleaning services for move-ins, move-outs, and special occasions.",
      features: [
        "Complete home deep clean",
        "Inside appliances cleaned",
        "Baseboards and trim detailed",
        "Light fixtures cleaned",
        "Cabinet fronts and handles",
      ],
      price: "Starting at $300",
      href: "/services/deep-cleaning",
    },
    {
      icon: Truck,
      title: "Move-in/Move-out Cleaning",
      description: "Specialized cleaning services for moving transitions.",
      features: [
        "Empty property cleaning",
        "Cabinet and drawer cleaning",
        "Appliance deep clean",
        "Window cleaning",
        "Floor care and protection",
      ],
      price: "Starting at $250",
      href: "/services/move-cleaning",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Our Services
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Professional cleaning services tailored to your specific needs. 
              From regular home cleaning to commercial office maintenance, we&apos;ve got you covered.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{service.title}</h2>
                        <p className="text-primary font-semibold">{service.price}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-6">{service.description}</p>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">What&apos;s Included:</h3>
                      <ul className="space-y-2">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center text-gray-600">
                            <CheckCircle className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex gap-3">
                      <Link href={service.href} className="flex-1">
                        <Button className="w-full">Learn More</Button>
                      </Link>
                      <Link href="/quote" className="flex-1">
                        <Button variant="outline" className="w-full">Get Quote</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Work</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our simple process ensures you get the best cleaning service every time.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Quote</h3>
              <p className="text-gray-600">Contact us for a free, detailed quote tailored to your needs.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Schedule</h3>
              <p className="text-gray-600">Choose a convenient time that works with your schedule.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Clean</h3>
              <p className="text-gray-600">Our professional team arrives with all supplies and equipment.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">4</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Enjoy</h3>
              <p className="text-gray-600">Relax in your clean, fresh space with our satisfaction guarantee.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Get your free quote today and experience the difference of professional cleaning services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Get Free Quote
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
