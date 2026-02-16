"use client";

export default function BillingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-12">
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="text-xl font-bold text-red-900">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-red-700">
          {error.message || "Failed to load billing information."}
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
