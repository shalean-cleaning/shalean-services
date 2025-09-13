import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Clock, CheckCircle, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Get a Free Quote",
  description: "Get a free, no-obligation quote for professional cleaning services. Quick response within 24 hours.",
};

export default function Quote() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Get Your Free Quote
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Ready to experience professional cleaning services? Get your free, 
              no-obligation quote today. We&apos;ll respond within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Quote Form */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Request Your Quote</h2>
              <p className="text-lg text-gray-600 mb-8">
                Fill out the form below with your cleaning needs and we&apos;ll provide you with 
                a detailed, personalized quote within 24 hours.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-600">Free, no-obligation quote</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-gray-600">Response within 24 hours</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calculator className="w-5 h-5 text-primary" />
                  <span className="text-gray-600">Detailed pricing breakdown</span>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quote Request Form</CardTitle>
                <CardDescription>
                  Please provide as much detail as possible for an accurate quote.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <Input id="firstName" placeholder="John" required />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <Input id="lastName" placeholder="Doe" required />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <Input id="email" type="email" placeholder="john@example.com" required />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <Input id="phone" type="tel" placeholder="(555) 123-4567" required />
                      </div>
                    </div>
                  </div>

                  {/* Service Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Service Information</h3>
                    <div>
                      <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">
                        Service Type *
                      </label>
                      <select
                        id="serviceType"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      >
                        <option value="">Select a service type</option>
                        <option value="residential">Residential Cleaning</option>
                        <option value="commercial">Commercial Cleaning</option>
                        <option value="deep">Deep Cleaning</option>
                        <option value="move">Move-in/Move-out Cleaning</option>
                        <option value="one-time">One-time Cleaning</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                        Cleaning Frequency
                      </label>
                      <select
                        id="frequency"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select frequency</option>
                        <option value="weekly">Weekly</option>
                        <option value="bi-weekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="one-time">One-time</option>
                        <option value="custom">Custom schedule</option>
                      </select>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Property Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Bedrooms
                        </label>
                        <select
                          id="bedrooms"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">Select bedrooms</option>
                          <option value="1">1 bedroom</option>
                          <option value="2">2 bedrooms</option>
                          <option value="3">3 bedrooms</option>
                          <option value="4">4 bedrooms</option>
                          <option value="5+">5+ bedrooms</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Bathrooms
                        </label>
                        <select
                          id="bathrooms"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">Select bathrooms</option>
                          <option value="1">1 bathroom</option>
                          <option value="1.5">1.5 bathrooms</option>
                          <option value="2">2 bathrooms</option>
                          <option value="2.5">2.5 bathrooms</option>
                          <option value="3">3 bathrooms</option>
                          <option value="3+">3+ bathrooms</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="squareFootage" className="block text-sm font-medium text-gray-700 mb-2">
                        Approximate Square Footage
                      </label>
                      <Input id="squareFootage" placeholder="e.g., 1500" />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                    <div>
                      <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-2">
                        Special Requests or Notes
                      </label>
                      <textarea
                        id="specialRequests"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Any specific areas you'd like us to focus on, special instructions, or additional services needed..."
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Start Date
                      </label>
                      <Input id="preferredDate" type="date" />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" size="lg">
                    Get My Free Quote
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Information */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our pricing is based on the size of your space, frequency of service, and specific requirements.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Residential Cleaning</h3>
              <div className="text-3xl font-bold text-primary mb-4">Starting at $120</div>
              <p className="text-gray-600 mb-4">Regular home cleaning services</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• All rooms cleaned</li>
                <li>• Kitchen & bathroom deep clean</li>
                <li>• Dusting & vacuuming</li>
                <li>• Trash removal</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 text-center border-2 border-primary">
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Commercial Cleaning</h3>
              <div className="text-3xl font-bold text-primary mb-4">Starting at $200</div>
              <p className="text-gray-600 mb-4">Professional office cleaning</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Office cleaning & maintenance</li>
                <li>• Restroom sanitization</li>
                <li>• Floor care & maintenance</li>
                <li>• Window cleaning</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Deep Cleaning</h3>
              <div className="text-3xl font-bold text-primary mb-4">Starting at $300</div>
              <p className="text-gray-600 mb-4">Intensive cleaning service</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Complete home deep clean</li>
                <li>• Inside appliances cleaned</li>
                <li>• Baseboards & trim detailed</li>
                <li>• Light fixtures cleaned</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Need Immediate Assistance?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Call us directly for immediate quotes or to discuss your cleaning needs with our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+1555CLEANUP">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <Phone className="mr-2 w-4 h-4" />
                Call: (555) CLEAN-UP
              </Button>
            </a>
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
              Live Chat
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
