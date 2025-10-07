"use client";
import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stored = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const shouldDark = stored ? stored === 'dark' : isDark;
    setEnabled(shouldDark);
    document.documentElement.classList.toggle('dark', shouldDark);
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  return (
    <button onClick={toggle} className="text-sm px-3 py-1 border rounded">
      {enabled ? 'Light' : 'Dark'} mode
    </button>
  );
}

