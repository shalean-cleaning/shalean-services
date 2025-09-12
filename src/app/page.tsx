"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-semibold">Shalean Cleaning Services</h1>
        <p className="text-muted-foreground">
          Next.js 15 app with TailwindCSS, shadcn/ui, React Query, Supabase, and more.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h2 className="font-medium">Design System</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm">Button</Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm">Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Hello</DialogTitle>
                    <DialogDescription>shadcn/ui is configured.</DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <h2 className="font-medium">Toast</h2>
            <div className="mt-3">
              <Button size="sm" onClick={() => import("sonner").then(({ toast }) => toast.success("Setup complete"))}>Show toast</Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
