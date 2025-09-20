import { CheckCircle, Clock, DollarSign, Users } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Apply to Work",
  description: "Join the Shalean Cleaning Services team. Apply for cleaning positions with competitive pay, flexible hours, and professional development opportunities.",
  alternates: {
    canonical: '/apply',
  },
};

export default function Apply() {
  const benefits = [
    {
      icon: DollarSign,
      title: "Competitive Pay",
      description: "Fair compensation with performance-based bonuses and incentives.",
    },
    {
      icon: Clock,
      title: "Flexible Schedule",
      description: "Work hours that fit your lifestyle with flexible scheduling options.",
    },
    {
      icon: Users,
      title: "Team Environment",
      description: "Join a supportive team that values collaboration and mutual respect.",
    },
    {
      icon: CheckCircle,
      title: "Professional Development",
      description: "Ongoing training and opportunities for career advancement.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Join Our Team
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Be part of a growing team that&apos;s passionate about providing exceptional cleaning services. 
              We&apos;re looking for dedicated individuals who share our commitment to quality and customer satisfaction.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Work With Us?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We offer competitive benefits and a positive work environment for our team members.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Apply Now</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Fill out the application form below and we&apos;ll get back to you within 48 hours.
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Employment Application</CardTitle>
              <CardDescription>
                Please fill out all required fields. We&apos;ll review your application and contact you soon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
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

                {/* Position Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Position Information</h3>
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                      Position Applying For *
                    </label>
                    <select
                      id="position"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select a position</option>
                      <option value="residential-cleaner">Residential Cleaner</option>
                      <option value="commercial-cleaner">Commercial Cleaner</option>
                      <option value="team-lead">Team Lead</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Cleaning Experience
                    </label>
                    <select
                      id="experience"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select experience level</option>
                      <option value="0">No experience</option>
                      <option value="1">1 year</option>
                      <option value="2">2 years</option>
                      <option value="3">3 years</option>
                      <option value="4">4 years</option>
                      <option value="5+">5+ years</option>
                    </select>
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Availability</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Days *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <label key={day} className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2"
                            name="availableDays"
                            value={day.toLowerCase()}
                          />
                          <span className="text-sm text-gray-700">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Hours
                    </label>
                    <select
                      id="hours"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select preferred hours</option>
                      <option value="morning">Morning (8AM-12PM)</option>
                      <option value="afternoon">Afternoon (12PM-5PM)</option>
                      <option value="evening">Evening (5PM-9PM)</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                  <div>
                    <label htmlFor="transportation" className="block text-sm font-medium text-gray-700 mb-2">
                      Do you have reliable transportation? *
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="radio" name="transportation" value="yes" className="mr-2" required />
                        <span className="text-gray-700">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="transportation" value="no" className="mr-2" required />
                        <span className="text-gray-700">No</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="background" className="block text-sm font-medium text-gray-700 mb-2">
                      Are you willing to undergo a background check? *
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="radio" name="background" value="yes" className="mr-2" required />
                        <span className="text-gray-700">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="background" value="no" className="mr-2" required />
                        <span className="text-gray-700">No</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter / Additional Comments
                    </label>
                    <textarea
                      id="coverLetter"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Tell us why you'd like to work with Shalean Services..."
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" size="lg">
                  Submit Application
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Questions About Working With Us?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Contact us directly if you have any questions about our positions or application process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Call: (555) CLEAN-UP
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
              Email Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
