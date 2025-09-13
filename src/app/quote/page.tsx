import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Clock, CheckCircle, Phone, Zap } from "lucide-react";
import QuickQuote from "@/components/landing/quick-quote";

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

      {/* Quick Quote Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Instant Quote Calculator</h2>
              <p className="text-lg text-gray-600 mb-8">
                Get an instant price estimate for your cleaning service. No waiting, 
                no hassle - just select your preferences and see your quote in real-time.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-gray-600">Instant price calculation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-600">Transparent pricing breakdown</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calculator className="w-5 h-5 text-primary" />
                  <span className="text-gray-600">Real-time updates</span>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Quote Calculator</CardTitle>
                <CardDescription>
                  Select your service preferences and get an instant price estimate.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuickQuote />
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
