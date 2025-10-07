"use client";
import { useEffect, useMemo, useState } from "react";

const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // Removed I, O
const LOWER = "abcdefghjkmnpqrstuvwxyz"; // Removed l, i
const NUM = "23456789"; // Removed 0,1
const SYM = "!@#$%^&*()-_=+[]{};:,.?/";

export default function PasswordGenerator({ onGenerate }: { onGenerate?: (pwd: string) => void }) {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNum, setUseNum] = useState(true);
  const [useSym, setUseSym] = useState(false);
  const [excludeLookalike, setExcludeLookalike] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const charset = useMemo(() => {
    let chars = "";
    if (useUpper) chars += UPPER;
    if (useLower) chars += LOWER;
    if (useNum) chars += NUM;
    if (useSym) chars += SYM;
    if (!excludeLookalike) {
      chars += "IOlio01"; // re-add lookalikes if user allows
    }
    return chars;
  }, [useUpper, useLower, useNum, useSym, excludeLookalike]);

  function generate() {
    if (!charset) return;
    const arr = new Uint32Array(length);
    if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(arr);
    } else {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 0xffffffff);
    }
    const result: string[] = [];
    for (let i = 0; i < length; i++) {
      const idx = arr[i] % charset.length;
      result.push(charset[idx]);
    }
    const pwd = result.join("");
    setPassword(pwd);
    onGenerate?.(pwd);
  }

  async function copy() {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(async () => {
      try {
        const current = await navigator.clipboard.readText();
        if (current === password) {
          await navigator.clipboard.writeText("");
        }
      } catch {}
      setCopied(false);
    }, 15000);
  }

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full rounded-lg border p-4 bg-white dark:bg-neutral-900">
      <div className="flex items-center gap-2">
        <input value={password} readOnly className="flex-1 bg-transparent outline-none text-sm" />
        <button onClick={copy} className="px-3 py-1 text-sm rounded bg-black text-white dark:bg-white dark:text-black">
          {copied ? "Copied" : "Copy"}
        </button>
        <button onClick={generate} className="px-3 py-1 text-sm rounded border">Regenerate</button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span className="w-16">Length</span>
          <input type="range" min={8} max={32} value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="flex-1" />
          <span className="w-8 text-right">{length}</span>
        </label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)} />Uppercase</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={useLower} onChange={(e) => setUseLower(e.target.checked)} />Lowercase</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={useNum} onChange={(e) => setUseNum(e.target.checked)} />Numbers</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={useSym} onChange={(e) => setUseSym(e.target.checked)} />Symbols</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={excludeLookalike} onChange={(e) => setExcludeLookalike(e.target.checked)} />Exclude look‑alike</label>
      </div>
    </div>
  );
}

