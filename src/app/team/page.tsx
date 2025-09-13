import { Calendar, User, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Our Team",
  description: "Meet the dedicated professionals behind Shalean Cleaning Services - experienced, trained, and committed to excellence.",
};

export default function OurTeam() {
  const teamMembers = [
    {
      name: "Sarah Shalean",
      role: "Founder & CEO",
      bio: "With over 10 years in hospitality management, Sarah founded Shalean Services to bring professional cleaning standards to residential and commercial spaces.",
      image: "SS",
    },
    {
      name: "Maria Johnson",
      role: "Operations Manager",
      bio: "Maria ensures every cleaning service meets our high standards and coordinates our team to deliver consistent, quality results.",
      image: "MJ",
    },
    {
      name: "David Chen",
      role: "Lead Supervisor",
      bio: "David leads our cleaning teams and trains new staff members to maintain our commitment to excellence and customer satisfaction.",
      image: "DC",
    },
    {
      name: "Lisa Rodriguez",
      role: "Customer Relations Manager",
      bio: "Lisa handles customer communications and ensures every client receives personalized attention and exceptional service.",
      image: "LR",
    },
    {
      name: "James Wilson",
      role: "Quality Assurance Specialist",
      bio: "James conducts quality inspections and ensures our cleaning standards meet the highest expectations before we complete any job.",
      image: "JW",
    },
    {
      name: "Amanda Taylor",
      role: "Training Coordinator",
      bio: "Amanda develops training programs and ensures all team members are equipped with the latest cleaning techniques and safety protocols.",
      image: "AT",
    },
  ];

  const values = [
    {
      title: "Professionalism",
      description: "We maintain the highest standards of professionalism in everything we do.",
    },
    {
      title: "Reliability",
      description: "You can count on us to be there when we say we will, every time.",
    },
    {
      title: "Excellence",
      description: "We strive for excellence in every cleaning task and customer interaction.",
    },
    {
      title: "Integrity",
      description: "We conduct business with honesty, transparency, and respect.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Our Team
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Meet the dedicated professionals behind Shalean Cleaning Services. 
              Our team is committed to delivering exceptional cleaning solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Leadership Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experienced professionals dedicated to providing the best cleaning services.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">{member.image}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-primary font-medium mb-3">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These values guide our team and shape how we serve our customers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Our Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Join Our Team</h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              We&apos;re always looking for dedicated, professional individuals to join our growing team. 
              If you&apos;re passionate about providing excellent service, we&apos;d love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/apply">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Apply Now
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Work With Us?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We offer competitive benefits and a positive work environment for our team members.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Flexible Schedule</h3>
              <p className="text-gray-600">Work hours that fit your lifestyle with flexible scheduling options.</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Professional Development</h3>
              <p className="text-gray-600">Ongoing training and opportunities for career advancement.</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Competitive Pay</h3>
              <p className="text-gray-600">Fair compensation with performance-based bonuses and incentives.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
