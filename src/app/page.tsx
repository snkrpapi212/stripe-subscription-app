import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-8 text-4xl font-bold">Subscription App</h1>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700">
            Sign In
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <div className="flex flex-col items-center gap-4">
          <UserButton />
          <Link
            href="/settings/billing"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
          >
            Manage Billing
          </Link>
        </div>
      </SignedIn>
    </main>
  );
}
