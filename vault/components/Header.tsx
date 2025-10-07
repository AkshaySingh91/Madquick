"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import DarkModeToggle from "./DarkModeToggle";

export default function Header() {
  const { status } = useSession();
  return (
    <header className="w-full max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
      <Link href="/" className="font-semibold">Vault</Link>
      <div className="flex items-center gap-3">
        <DarkModeToggle />
        {status === 'authenticated' ? (
          <>
            <Link className="text-sm underline" href="/vault">Dashboard</Link>
            <button className="text-sm px-3 py-1 border rounded" onClick={() => signOut({ callbackUrl: '/signin' })}>Sign out</button>
          </>
        ) : (
          <>
            <Link className="text-sm underline" href="/signin">Sign in</Link>
            <Link className="text-sm underline" href="/signup">Sign up</Link>
          </>
        )}
      </div>
    </header>
  );
}

