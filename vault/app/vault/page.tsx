"use client";
import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { deriveKeyFromPassword, encryptJson, decryptJson } from "@/lib/crypto";
import PasswordGenerator from "@/components/PasswordGenerator";

type VaultPayload = {
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
};

export default function VaultPage() {
  const sessionResult = (useSession as unknown as () => { data?: { user?: { kdfSalt?: string; id?: string } }; status?: "authenticated" | "unauthenticated" | "loading" })?.();
  type SessionShape = { user?: { kdfSalt?: string; id?: string } } | null | undefined;
  const session = sessionResult?.data as SessionShape;
  const status = sessionResult?.status ?? "unauthenticated";
  const [masterPassword, setMasterPassword] = useState("");
  type ServerItem = { _id: string; ciphertext: string; iv: string };
  const [items, setItems] = useState<ServerItem[]>([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<VaultPayload>({ title: "", username: "", password: "", url: "", notes: "" });
  // const [loading, setLoading] = useState(false);

  const derivedKey = useMemo(() => {
    if (!session?.user?.kdfSalt || !masterPassword) return null;
    return deriveKeyFromPassword(masterPassword, session.user.kdfSalt).key;
  }, [masterPassword, session?.user?.kdfSalt]);

  async function fetchItems() {
    const res = await fetch("/api/vault");
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.items || []);
  }

  useEffect(() => {
    if (status === "authenticated") fetchItems();
  }, [status]);

  async function createItem() {
    if (!derivedKey) return alert("Enter your master password to encrypt");
    const { ciphertextBase64, ivBase64 } = encryptJson(form, derivedKey);
    const res = await fetch("/api/vault", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ciphertext: ciphertextBase64, iv: ivBase64 }) });
    if (res.ok) {
      setForm({ title: "", username: "", password: "", url: "", notes: "" });
      fetchItems();
    }
  }

  // Example update flow, currently unused in UI
  // async function updateItem(id: string, payload: VaultPayload) {
  //   if (!derivedKey) return alert("Enter your master password to encrypt");
  //   const { ciphertextBase64, ivBase64 } = encryptJson(payload, derivedKey);
  //   const res = await fetch(`/api/vault/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ciphertext: ciphertextBase64, iv: ivBase64 }) });
  //   if (res.ok) fetchItems();
  // }

  async function deleteItem(id: string) {
    const res = await fetch(`/api/vault/${id}`, { method: "DELETE" });
    if (res.ok) fetchItems();
  }

  function decrypted(item: ServerItem): VaultPayload | null {
    if (!derivedKey) return null;
    try {
      return decryptJson<VaultPayload>(item.ciphertext, item.iv, derivedKey);
    } catch {
      return null;
    }
  }

  const filtered = items.filter((it) => {
    const d = decrypted(it);
    if (!d) return false;
    const hay = `${d.title} ${d.username}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  });

  if (status === "loading") return <div className="p-6">Loading...</div>;
  if (status === "unauthenticated") return <div className="p-6">Please sign in.</div>;

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Vault</h1>
        <button className="text-sm underline" onClick={() => signOut({ callbackUrl: "/signin" })}>Sign out</button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <input type="password" placeholder="Enter master password to decrypt" value={masterPassword} onChange={(e) => setMasterPassword(e.target.value)} className="flex-1 border p-2 rounded" />
      </div>

      <PasswordGenerator onGenerate={(pwd) => setForm((f) => ({ ...f, password: pwd }))} />

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-4 space-y-2">
          <h2 className="font-medium">Add item</h2>
          <input className="w-full border p-2 rounded" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="w-full border p-2 rounded" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input className="w-full border p-2 rounded" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input className="w-full border p-2 rounded" placeholder="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          <textarea className="w-full border p-2 rounded" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button onClick={createItem} className="w-full bg-black text-white rounded p-2">Save</button>
        </div>

        <div className="space-y-3">
          <input className="w-full border p-2 rounded" placeholder="Search by title or username" value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="space-y-2">
            {filtered.map((it) => {
              const d = decrypted(it);
              return (
                <div key={it._id} className="border rounded p-3">
                  {d ? (
                    <div className="space-y-1">
                      <div className="font-medium">{d.title}</div>
                      <div className="text-sm text-neutral-600">{d.username}</div>
                      {d.url && (
                        <a className="text-sm underline" href={d.url} target="_blank" rel="noreferrer">{d.url}</a>
                      )}
                      {d.notes && <div className="text-sm whitespace-pre-wrap">{d.notes}</div>}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={async () => {
                            await navigator.clipboard.writeText(d.password);
                            setTimeout(async () => {
                              try {
                                const txt = await navigator.clipboard.readText();
                                if (txt === d.password) await navigator.clipboard.writeText("");
                              } catch {}
                            }, 15000);
                          }}
                          className="text-sm px-2 py-1 border rounded"
                        >
                          Copy password
                        </button>
                        <button onClick={() => deleteItem(it._id)} className="text-sm px-2 py-1 border rounded">Delete</button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-600">Unlock with your master password</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

