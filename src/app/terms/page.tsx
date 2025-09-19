import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Shalean Services",
  description: "Shalean Services Terms of Service. Read our terms and conditions for using our professional cleaning and home management services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-gray-600 mb-6">
            <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using Shalean Services' website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Shalean Services provides professional cleaning, housekeeping, and home management services including but not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Regular and deep cleaning services</li>
                <li>Housekeeping and home maintenance</li>
                <li>Nanny and childcare services</li>
                <li>Home organization and management</li>
                <li>Specialized cleaning services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                As a user of our services, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Provide accurate and complete information when booking services</li>
                <li>Ensure safe access to your property for our service providers</li>
                <li>Notify us of any special requirements or restrictions</li>
                <li>Pay for services as agreed in your service contract</li>
                <li>Treat our staff with respect and professionalism</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Booking and Cancellation Policy</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Booking</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                All service bookings must be made through our official channels. Bookings are confirmed upon receipt of payment or as otherwise agreed.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Cancellation</h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li><strong>24+ hours notice:</strong> Full refund or rescheduling</li>
                <li><strong>Less than 24 hours:</strong> 50% cancellation fee</li>
                <li><strong>Same day cancellation:</strong> 100% cancellation fee</li>
                <li><strong>No-show:</strong> 100% service charge</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Payment Terms</h2>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Payment is due at the time of service unless otherwise arranged</li>
                <li>We accept major credit cards, bank transfers, and other approved payment methods</li>
                <li>Late payment fees may apply to overdue accounts</li>
                <li>All prices are in South African Rand (ZAR) unless otherwise specified</li>
                <li>Prices are subject to change with 30 days' notice</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Service Guarantee</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We stand behind our work with the following guarantee:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>100% satisfaction guarantee on all cleaning services</li>
                <li>Free re-cleaning within 24 hours if you're not satisfied</li>
                <li>Full replacement guarantee for any items damaged during service</li>
                <li>Professional, insured, and bonded service providers</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To the maximum extent permitted by law, Shalean Services shall not be liable for:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Damages exceeding the total amount paid for the specific service</li>
                <li>Issues arising from client-provided equipment or materials</li>
                <li>Acts of God or circumstances beyond our control</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Insurance and Bonding</h2>
              <p className="text-gray-600 leading-relaxed">
                All Shalean Services staff are fully insured and bonded. We maintain comprehensive liability insurance to protect both our clients and our service providers. Details of our insurance coverage are available upon request.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Privacy and Data Protection</h2>
              <p className="text-gray-600 leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of our services, to understand our practices regarding the collection and use of your personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Intellectual Property</h2>
              <p className="text-gray-600 leading-relaxed">
                All content, trademarks, and intellectual property on our website and in our materials are owned by Shalean Services or our licensors. You may not use, reproduce, or distribute any content without our written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Dispute Resolution</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Any disputes arising from these terms or our services shall be resolved through:
              </p>
              <ol className="list-decimal list-inside text-gray-600 mb-4 space-y-2">
                <li>Good faith negotiation between the parties</li>
                <li>Mediation through a mutually agreed mediator</li>
                <li>Binding arbitration under South African law</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These terms shall be governed by and construed in accordance with the laws of South Africa. Any legal action or proceeding arising under these terms shall be brought exclusively in the courts of South Africa.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services after changes are posted constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">
                  <strong>Email:</strong> legal@shalean.co.za<br />
                  <strong>Phone:</strong> +27 12 345 6789<br />
                  <strong>Address:</strong> 123 Business Street, Johannesburg, South Africa
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
