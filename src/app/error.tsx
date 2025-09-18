"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // Log once in dev for debugging
      console.error("[ErrorBoundary]", error);
    }
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">
        Please try again, or return to the homepage.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border px-4 py-2 hover:bg-gray-50"
        >
          Go Home
        </Link>
      </div>

      {process.env.NODE_ENV !== "production" && error?.message ? (
        <pre className="mt-8 overflow-auto rounded-lg bg-gray-100 p-4 text-left text-sm text-gray-700">
          {error.message}
        </pre>
      ) : null}
        </div>
  );
}
