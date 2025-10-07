import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h1 className="text-3xl font-semibold">Vault</h1>
        <p className="text-neutral-600 dark:text-neutral-300">A privacy-first password generator and encrypted vault.</p>
        <div className="flex gap-3 justify-center">
          <Link className="px-4 py-2 rounded bg-black text-white dark:bg-white dark:text-black" href="/signup">Get started</Link>
          <Link className="px-4 py-2 rounded border" href="/signin">Sign in</Link>
          <Link className="px-4 py-2 rounded border" href="/vault">Open Vault</Link>
        </div>
      </div>
    </div>
  );
}
