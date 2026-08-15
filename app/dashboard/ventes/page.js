"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "../DashboardHeader";

export default function Ventes() {
  const router = useRouter();
  const [chargement, setChargement] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/connexion");
      return;
    }
    fetch("/api/statistiques", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setChargement(false);
      });
  }, [router]);

  if (chargement) {
    return <main className="min-h-screen px-6 py-12">Chargement...</main>;
  }

  const maxJour = Math.max(1, ...stats.tendance14Jours.map((j) => j.total));

  return (
    <main className="min-h-screen">
      <DashboardHeader actif="ventes" />

      <div className="px-6 py-8 md:px-12">
        <h1 className="font-display text-2xl">Vos ventes</h1>

        {/* Chiffres clés */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-accent-light p-5">
            <p className="text-xs text-accent-dark">Chiffre d'affaires</p>
            <p className="mt-1 font-display text-2xl text-accent-dark">{stats.chiffreAffaires} FCFA</p>
          </div>
          <div className="rounded-xl border border-line bg-ia-light p-5">
            <p className="text-xs text-ia">Commandes</p>
            <p className="mt-1 font-display text-2xl text-ia">{stats.nombreCommandes}</p>
          </div>
          <div className="rounded-xl border border-line bg-leaf-light p-5">
            <p className="text-xs text-leaf">Panier moyen</p>
            <p className="mt-1 font-display text-2xl text-leaf">{stats.panierMoyen} FCFA</p>
          </div>
        </div>

        {/* Tendance 14 jours, simple graphique en barres */}
        <div className="mt-8 rounded-xl border border-line p-5 shadow-sm">
          <p className="text-sm text-muted">Revenu des 14 derniers jours</p>
          <div className="mt-4 flex h-32 items-end gap-1">
            {stats.tendance14Jours.map((j) => (
              <div key={j.jour} className="group relative flex-1">
                <div
                  className="rounded-t bg-accent transition-opacity group-hover:opacity-70"
                  style={{ height: `${Math.max(4, (j.total / maxJour) * 100)}%` }}
                />
                <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-[10px] group-hover:block">
                  {j.total} FCFA
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Quoi : produits qui rapportent le plus */}
          <div>
            <h2 className="font-display text-lg">Ce qui se vend</h2>
            {stats.topProduits.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Aucune vente pour le moment.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {stats.topProduits.map((p, i) => (
                  <li key={p.nom} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-light text-[10px] font-medium text-accent-dark">
                        {i + 1}
                      </span>
                      {p.nom}
                    </span>
                    <span className="text-muted">{p.quantite} vendus · {p.revenu} FCFA</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Qui achète */}
          <div>
            <h2 className="font-display text-lg">Vos meilleurs clients</h2>
            {stats.topClients.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Aucun client pour le moment.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {stats.topClients.map((c) => (
                  <li key={c.email} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm">
                    <span>{c.nom}</span>
                    <span className="text-muted">{c.commandes} cmd · {c.total} FCFA</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
