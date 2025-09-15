"use client";
import { useState } from "react";

export default function QuotePage() {
  const [status, setStatus] = useState<"idle"|"loading"|"ok"|"error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const res = await fetch("/api/quote", { method: "POST", body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Request failed");
      setStatus("ok");
      (e.target as HTMLFormElement).reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <h1 className="text-2xl font-semibold mb-2">Get a Free Quote</h1>
      <p className="text-muted-foreground mb-6">
        Tell us a bit about your home and preferred service. We'll reply with pricing and availability.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input name="name" required placeholder="Full name" className="input input-bordered w-full" />
          <input name="email" required type="email" placeholder="Email" className="input input-bordered w-full" />
          <input name="phone" required placeholder="Phone" className="input input-bordered w-full md:col-span-2" />
          <input name="location" placeholder="Suburb / Area" className="input input-bordered w-full md:col-span-2" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <select name="service" className="select select-bordered w-full">
            <option>Standard Cleaning</option>
            <option>Deep Cleaning</option>
            <option>Move-In/Out</option>
            <option>Airbnb</option>
            <option>Post-Construction</option>
          </select>
          <input name="date" type="date" className="input input-bordered w-full" />
        </div>
        <textarea name="notes" placeholder="Anything else we should know?" className="textarea textarea-bordered w-full" rows={5} />
        <button disabled={status==="loading"} className="btn btn-primary">
          {status==="loading" ? "Sending..." : "Submit request"}
        </button>
        {status==="ok" && <p className="text-green-600">Thanks! We'll be in touch shortly.</p>}
        {status==="error" && <p className="text-red-600">Something went wrong. Please try again.</p>}
      </form>
    </div>
  );
}