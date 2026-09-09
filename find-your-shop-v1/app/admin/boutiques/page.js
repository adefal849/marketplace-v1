"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import DashboardHeader from "../../dashboard/DashboardHeader";

export default function AdminBoutiques() {
  const [chargement, setChargement] = useState(true);
  const [interdit, setInterdit] = useState(false);
  const [boutiques, setBoutiques] = useState([]);

  useEffect(() => {
    charger();
  }, []);

  async function charger() {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/boutiques", { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 403) {
      setInterdit(true);
      setChargement(false);
      return;
    }
    const data = await res.json();
    setBoutiques(data.boutiques || []);
    setChargement(false);
  }

  async function basculer(id, actif) {
    const token = localStorage.getItem("token");
    await fetch("/api/admin/boutiques", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, actif: !actif }),
    });
    setBoutiques((liste) => liste.map((b) => (b.id === id ? { ...b, actif: !actif } : b)));
  }

  if (chargement) return <main className="min-h-screen px-6 py-12">Chargement...</main>;
  if (interdit) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <ShieldAlert size={32} />
        <p className="mt-3 text-sm text-muted">Cette section est réservée aux administrateurs.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <DashboardHeader actif="admin" />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="font-display text-2xl">Boutiques ({boutiques.length})</h1>

        <ul className="mt-6 flex flex-col gap-3">
          {boutiques.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 border border-line p-4">
              <div>
                <Link href={`/boutique/${b.slug}`} target="_blank" className="font-display underline">
                  {b.nom}
                </Link>
                <p className="text-xs text-muted">
                  {b.vendeur?.nom} — {b.vendeur?.email}
                </p>
                <p className="text-xs text-muted">
                  {b._count?.produits ?? 0} produits · {b._count?.signalements ?? 0} signalement(s)
                </p>
              </div>
              <button
                onClick={() => basculer(b.id, b.actif)}
                className={`shrink-0 border px-3 py-1.5 text-xs ${
                  b.actif ? "border-line" : "border-accent bg-accent text-ink"
                }`}
              >
                {b.actif ? "Suspendre" : "Réactiver"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
