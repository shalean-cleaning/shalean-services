import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Shield, Award, Users, Clock, Heart, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Why Choose Shalean Services",
  description: "Discover why thousands of customers choose Shalean Cleaning Services - professional, reliable, and exceptional cleaning solutions.",
};

export default function WhyChooseUs() {
  const reasons = [
    {
      icon: Shield,
      title: "Fully Insured & Bonded",
      description: "Complete protection for your peace of mind with comprehensive insurance coverage.",
    },
    {
      icon: Award,
      title: "5-Star Rated Service",
      description: "Consistently rated 5 stars by our satisfied customers across all platforms.",
    },
    {
      icon: Users,
      title: "Professional Team",
      description: "Trained, experienced, and background-checked cleaning professionals.",
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Convenient appointment times including evenings and weekends.",
    },
    {
      icon: Heart,
      title: "100% Satisfaction Guarantee",
      description: "We stand behind our work with a complete satisfaction guarantee.",
    },
    {
      icon: Star,
      title: "Premium Quality",
      description: "High-quality supplies and equipment for superior cleaning results.",
    },
  ];

  const stats = [
    { number: "500+", label: "Happy Customers" },
    { number: "5.0", label: "Average Rating" },
    { number: "3+", label: "Years Experience" },
    { number: "100%", label: "Satisfaction Rate" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Why Choose Shalean Services?
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              We&apos;re not just another cleaning company. We&apos;re your trusted partners in creating 
              clean, healthy, and comfortable spaces for your home and business.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reasons Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Sets Us Apart</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These are the key reasons why customers choose us over the competition.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{reason.title}</h3>
                  <p className="text-gray-600">{reason.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don&apos;t just take our word for it. Here&apos;s what our satisfied customers have to say.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                &ldquo;Shalean Services has been cleaning our home for over a year. They&apos;re reliable, 
                thorough, and always leave our house spotless. Highly recommended!&rdquo;
              </p>
              <div className="font-semibold text-gray-900">Sarah M.</div>
              <div className="text-sm text-gray-500">Residential Customer</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                &ldquo;Professional, punctual, and incredibly thorough. Our office has never looked 
                better. The team is trustworthy and respectful of our workspace.&rdquo;
              </p>
              <div className="font-semibold text-gray-900">Michael R.</div>
              <div className="text-sm text-gray-500">Commercial Customer</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                &ldquo;Outstanding service! They cleaned our house before we moved in and it was 
                absolutely perfect. Attention to detail is exceptional.&rdquo;
              </p>
              <div className="font-semibold text-gray-900">Jennifer L.</div>
              <div className="text-sm text-gray-500">Move-in Cleaning</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Experience the Difference
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of satisfied customers who trust Shalean Services for their cleaning needs.
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
