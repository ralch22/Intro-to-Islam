"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import Link from "next/link";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  if (session?.user) {
    const initials = session.user.name
      ? session.user.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "?";

    return (
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full bg-[#E81C74] flex items-center justify-center text-white font-bold text-sm cursor-default"
          title={session.user.name ?? session.user.email ?? ""}
        >
          {initials}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-gray-500 hover:text-gray-700 font-medium hidden sm:block"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="bg-[#E81C74] hover:bg-pink-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
    >
      Sign In
    </Link>
  );
}
