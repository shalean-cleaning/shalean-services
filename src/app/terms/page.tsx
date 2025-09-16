import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Shalean Services',
  description: 'Terms of Service for Shalean Cleaning Services',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using Shalean Services, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-700 mb-4">
                Shalean Services provides professional cleaning services for residential and commercial properties. 
                Our services include but are not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Regular house cleaning</li>
                <li>Deep cleaning services</li>
                <li>Move-in/move-out cleaning</li>
                <li>Commercial cleaning</li>
                <li>Specialized cleaning services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Booking and Payment</h2>
              <p className="text-gray-700 mb-4">
                All bookings are subject to availability and confirmation. Payment terms include:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Payment is due at the time of service unless otherwise arranged</li>
                <li>We accept major credit cards and digital payment methods</li>
                <li>Cancellation policies apply as outlined in your booking confirmation</li>
                <li>Pricing may vary based on service type, property size, and special requirements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Customer Responsibilities</h2>
              <p className="text-gray-700 mb-4">
                Customers are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Providing accurate information about their property and cleaning needs</li>
                <li>Ensuring safe access to the property</li>
                <li>Securing or removing valuable items before service</li>
                <li>Providing necessary supplies if not included in the service</li>
                <li>Being present or providing access instructions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Service Guarantee</h2>
              <p className="text-gray-700 mb-4">
                We stand behind our work and offer a satisfaction guarantee. If you are not completely 
                satisfied with our service, please contact us within 24 hours and we will return to 
                address any concerns at no additional charge.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                Shalean Services' liability is limited to the cost of the service provided. We are not 
                responsible for damage to items that are not properly secured or for pre-existing damage 
                to property or belongings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cancellation Policy</h2>
              <p className="text-gray-700 mb-4">
                Cancellations made more than 24 hours in advance are free of charge. Cancellations 
                made within 24 hours may be subject to a cancellation fee. Same-day cancellations 
                may result in a full charge.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Privacy</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which also governs 
                your use of our services, to understand our practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these terms at any time. Changes will be effective 
                immediately upon posting. Your continued use of our services constitutes acceptance 
                of any changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@shalean-services.com<br />
                  <strong>Phone:</strong> +1 (555) CLEAN-UP<br />
                  <strong>Address:</strong> 123 Cleaning Street, Your City, ST 12345
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
