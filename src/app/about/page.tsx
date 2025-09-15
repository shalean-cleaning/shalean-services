export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">About Us</h1>
        <div className="prose max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            We are a professional cleaning service dedicated to providing high-quality cleaning solutions for your home and business.
          </p>
          <p className="text-gray-600">
            Our team of experienced cleaners is committed to delivering exceptional service and ensuring your complete satisfaction.
          </p>
        </div>
      </div>
    </div>
  );
}