"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import DashboardHeader from "../../dashboard/DashboardHeader";

export default function AdminSignalements() {
  const [chargement, setChargement] = useState(true);
  const [interdit, setInterdit] = useState(false);
  const [signalements, setSignalements] = useState([]);

  useEffect(() => {
    charger();
  }, []);

  async function charger() {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/signalements", { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 403) {
      setInterdit(true);
      setChargement(false);
      return;
    }
    const data = await res.json();
    setSignalements(data.signalements || []);
    setChargement(false);
  }

  async function marquerTraite(id) {
    const token = localStorage.getItem("token");
    await fetch("/api/admin/signalements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, statut: "TRAITE" }),
    });
    setSignalements((liste) => liste.map((s) => (s.id === id ? { ...s, statut: "TRAITE" } : s)));
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
        <h1 className="font-display text-2xl">Signalements ({signalements.length})</h1>

        {signalements.length === 0 ? (
          <p className="mt-6 text-sm text-muted">Aucun signalement pour le moment.</p>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {signalements.map((s) => (
              <li
                key={s.id}
                className={`border p-4 ${s.statut === "NOUVEAU" ? "border-accent" : "border-line"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/boutique/${s.boutique.slug}`} target="_blank" className="font-display underline">
                      {s.boutique.nom}
                    </Link>
                    <p className="mt-1 text-sm">{s.raison}</p>
                    {s.details && <p className="mt-1 text-xs text-muted">{s.details}</p>}
                    {s.clientEmail && <p className="mt-1 text-xs text-muted">Contact : {s.clientEmail}</p>}
                    <p className="mt-1 text-xs text-muted">{new Date(s.createdAt).toLocaleString("fr-FR")}</p>
                  </div>
                  {s.statut === "NOUVEAU" && (
                    <button onClick={() => marquerTraite(s.id)} className="shrink-0 border border-ink px-3 py-1.5 text-xs">
                      Marquer traité
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
