import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - Shalean Services",
  description: "Learn about Shalean Services, South Africa's premier cleaning and home management company. Our story, mission, and commitment to excellence.",
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About Shalean Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted partner for professional cleaning, housekeeping, and home management services across South Africa.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            At Shalean Services, we believe that a clean, well-maintained home is the foundation of a happy, healthy life. 
            Our mission is to provide exceptional cleaning and home management services that give you more time to focus 
            on what matters most to you.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Founded with a vision to revolutionize home services in South Africa, Shalean Services has grown from a 
            small local cleaning company to a trusted name in professional home management.
          </p>
          <p className="text-gray-600 leading-relaxed">
            We started with a simple belief: everyone deserves a clean, comfortable home without the stress of 
            maintaining it themselves. Today, we serve thousands of satisfied customers across major South African cities, 
            bringing peace of mind and exceptional service to every home we touch.
          </p>
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality First</h3>
              <p className="text-gray-600">
                We never compromise on quality. Every service is delivered with attention to detail and a commitment to excellence.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Trust & Reliability</h3>
              <p className="text-gray-600">
                Our customers trust us with their most valuable asset - their home. We earn that trust through consistent, reliable service.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Excellence</h3>
              <p className="text-gray-600">
                Our team of trained professionals brings expertise, efficiency, and a positive attitude to every job.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Focus</h3>
              <p className="text-gray-600">
                Your satisfaction is our priority. We listen, adapt, and go above and beyond to meet your unique needs.
              </p>
            </div>
          </div>
        </div>

        {/* Services Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Do</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧹</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Cleaning</h3>
              <p className="text-gray-600 text-sm">
                Regular and deep cleaning services for homes and offices
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Housekeeping</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive home management and maintenance services
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👶</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nanny Care</h3>
              <p className="text-gray-600 text-sm">
                Trusted childcare services for busy families
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Ready to Experience the Shalean Difference?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of satisfied customers who trust us with their home care needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/quote"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Get a Free Quote
            </a>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
