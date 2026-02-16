import { Suspense } from "react";
import { BillingContent } from "@/components/billing/billing-content";

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        Billing & Subscription
      </h1>
      <Suspense
        fallback={
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        }
      >
        <BillingContent />
      </Suspense>
    </div>
  );
}
