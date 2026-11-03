"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import LoadingAnimation from "@/components/loading-animation";
import { useAuth } from "@/lib/auth";

export default function AuthGate({ children }: { children: ReactNode }) {
  const { status, error } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      const callbackURL = encodeURIComponent(pathname);
      router.replace(`/login?callbackURL=${callbackURL}`);
    }
  }, [pathname, router, status]);

  if (status === "loading") {
    return (
      <main className="flex flex-1 items-center justify-center bg-[#0b0b12] px-5 py-20">
        <LoadingAnimation label="Checking your sign-in…" />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex flex-1 items-center justify-center bg-[#0b0b12] px-5 py-20 text-center text-white">
        <div className="max-w-md">
          <p role="alert" className="text-sm text-rose-200">
            {error ?? "Unable to verify your sign-in."}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  return children;
}
