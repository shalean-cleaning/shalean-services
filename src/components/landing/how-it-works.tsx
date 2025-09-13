"use client";

import { motion } from "framer-motion";

type Step = {
  title: string;
  caption: string;
  icon?: React.ReactNode;
};

const steps: Step[] = [
  { title: "Choose", caption: "Pick the service and extras you need." },
  { title: "Book", caption: "Secure your date & time in minutes." },
  { title: "Manage", caption: "Track and reschedule from your dashboard." },
];

export default function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            id="how-heading"
            className="text-2xl sm:text-3xl font-semibold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            Getting your home in order has never been easier.
          </motion.h2>
          <motion.p
            className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            Three quick steps: choose a service, book online, and manage everything in one place.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              className="rounded-xl border p-6"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="text-sm uppercase tracking-wide text-primary/80">Step {i + 1}</div>
              <h3 className="mt-2 text-lg font-medium">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.caption}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}