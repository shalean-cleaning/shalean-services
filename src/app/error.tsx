"use client";
import { useEffect } from "react";
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error("[GlobalError]", { message: error.message, digest: error.digest, stack: error.stack });
  }, [error]);
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full rounded-xl border p-6 shadow-sm">
          <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
          {process.env.NODE_ENV !== "production"
            ? <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-3 rounded border">{String(error.stack || error.message)}</pre>
            : (error?.digest ? <p className="text-xs text-gray-500">Digest: {error.digest}</p> : null)}
          <button onClick={() => reset()} className="mt-4 px-3 py-2 rounded bg-blue-600 text-white text-sm">Retry</button>
        </div>
      </body>
    </html>
  );
}
