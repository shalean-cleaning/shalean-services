import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Team - Shalean Services",
  description: "Meet the dedicated professionals behind Shalean Services. Our experienced team of cleaners, housekeepers, and support staff is committed to delivering exceptional service.",
};

export default function OurTeamPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Meet Our Team
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The dedicated professionals who make Shalean Services South Africa's most trusted home care provider.
          </p>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-gray-600">Professional Cleaners</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
            <div className="text-gray-600">Support Staff</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">5+</div>
            <div className="text-gray-600">Years Experience</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">10,000+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
        </div>

        {/* Leadership Team */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Leadership Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-gray-400">👨‍💼</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sarah Johnson</h3>
              <p className="text-blue-600 font-medium mb-2">CEO & Founder</p>
              <p className="text-gray-600 text-sm">
                With over 10 years in the service industry, Sarah founded Shalean Services with a vision to revolutionize home care in South Africa.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-gray-400">👩‍💼</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Michael Chen</h3>
              <p className="text-green-600 font-medium mb-2">Operations Director</p>
              <p className="text-gray-600 text-sm">
                Michael ensures our operations run smoothly across all service areas, maintaining our high standards of quality and efficiency.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-gray-400">👨‍💻</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lisa Mthembu</h3>
              <p className="text-purple-600 font-medium mb-2">Customer Experience Manager</p>
              <p className="text-gray-600 text-sm">
                Lisa leads our customer success team, ensuring every client receives exceptional service and support throughout their journey with us.
              </p>
            </div>
          </div>
        </div>

        {/* Our Cleaners */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Professional Cleaners</h2>
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Rigorous Selection Process</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Comprehensive background checks and reference verification
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Professional cleaning certification and training
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Ongoing performance monitoring and feedback
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Regular skills development and safety training
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What Makes Us Different</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    All cleaners are fully insured and bonded
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Consistent team assignments for regular clients
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Eco-friendly cleaning products and methods
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    24/7 customer support and quality guarantee
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Training & Development */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Training & Development</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎓</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Initial Training</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive 40-hour training program covering cleaning techniques, safety protocols, and customer service.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ongoing Education</h3>
              <p className="text-gray-600 text-sm">
                Monthly training sessions on new techniques, products, and industry best practices.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Certification</h3>
              <p className="text-gray-600 text-sm">
                Industry-recognized certifications in professional cleaning and safety standards.
              </p>
            </div>
          </div>
        </div>

        {/* Join Our Team */}
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Join Our Growing Team
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We're always looking for dedicated professionals who share our commitment to excellence. 
            Join Shalean Services and be part of South Africa's leading home care team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/apply"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Apply to Work With Us
            </a>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
