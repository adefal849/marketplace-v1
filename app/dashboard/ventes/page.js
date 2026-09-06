"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "../DashboardHeader";

export default function Ventes() {
  const router = useRouter();
  const [chargement, setChargement] = useState(true);
  const [stats, setStats] = useState(null);
  const [erreur, setErreur] = useState("");

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
      })
      .catch(() => {
        setErreur("Impossible de charger vos statistiques pour le moment.");
        setChargement(false);
      });
  }, [router]);

  if (chargement) {
    return (
      <main className="min-h-screen bg-canvas dark:bg-ink">
        <DashboardHeader actif="ventes" />
        <div className="px-6 py-8 md:px-12">
          <div className="h-7 w-40 animate-pulse rounded bg-line dark:bg-line-dark" />
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl border border-line bg-paper dark:border-line-dark dark:bg-panel-dark" />
            ))}
          </div>
          <div className="mt-8 h-48 animate-pulse rounded-xl border border-line bg-paper dark:border-line-dark dark:bg-panel-dark" />
        </div>
      </main>
    );
  }

  if (erreur || !stats) {
    return (
      <main className="min-h-screen bg-canvas dark:bg-ink">
        <DashboardHeader actif="ventes" />
        <div className="px-6 py-12 md:px-12">
          <div className="rounded-xl border border-danger/20 bg-danger-light p-5 text-sm text-danger dark:bg-danger/10">
            {erreur || "Une erreur est survenue."}
          </div>
        </div>
      </main>
    );
  }

  const maxJour = Math.max(1, ...stats.tendance14Jours.map((j) => j.total));

  return (
    <main className="min-h-screen bg-canvas dark:bg-ink">
      <DashboardHeader actif="ventes" />

      <div className="px-6 py-8 md:px-12">
        <h1 className="font-display text-2xl text-ink dark:text-paper">Vos ventes</h1>

        {/* Solde vendeur, si disponible côté API */}
        {(stats.soldeDisponible !== undefined || stats.soldeEnAttente !== undefined) && (
          <div className="mt-4 flex flex-wrap gap-3">
            {stats.soldeDisponible !== undefined && (
              <div className="flex items-center gap-2 rounded-full border border-leaf/20 bg-leaf-light px-4 py-2 text-sm dark:bg-leaf/10">
                <span className="text-muted">Solde disponible</span>
                <span className="font-medium text-leaf">{stats.soldeDisponible} FCFA</span>
              </div>
            )}
            {stats.soldeEnAttente !== undefined && (
              <div className="flex items-center gap-2 rounded-full border border-warning/20 bg-warning-light px-4 py-2 text-sm dark:bg-warning/10">
                <span className="text-muted">En attente</span>
                <span className="font-medium text-warning">{stats.soldeEnAttente} FCFA</span>
              </div>
            )}
          </div>
        )}

        {/* Chiffres clés */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-paper p-5 shadow-sm dark:border-line-dark dark:bg-panel-dark">
            <p className="text-xs text-muted">Chiffre d&apos;affaires</p>
            <p className="mt-1 font-display text-2xl text-accent">{stats.chiffreAffaires} FCFA</p>
          </div>
          <div className="rounded-xl border border-line bg-paper p-5 shadow-sm dark:border-line-dark dark:bg-panel-dark">
            <p className="text-xs text-muted">Commandes</p>
            <p className="mt-1 font-display text-2xl text-ink dark:text-paper">{stats.nombreCommandes}</p>
          </div>
          <div className="rounded-xl border border-line bg-paper p-5 shadow-sm dark:border-line-dark dark:bg-panel-dark">
            <p className="text-xs text-muted">Panier moyen</p>
            <p className="mt-1 font-display text-2xl text-leaf">{stats.panierMoyen} FCFA</p>
          </div>
        </div>

        {/* Tendance 14 jours, simple graphique en barres */}
        <div className="mt-8 rounded-xl border border-line bg-paper p-5 shadow-sm dark:border-line-dark dark:bg-panel-dark">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">Revenu des 14 derniers jours</p>
            <button
              onClick={() => window.print()}
              className="rounded-full border border-line px-3 py-1 text-xs text-muted outline-none transition-colors hover:border-accent/40 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent dark:border-line-dark"
            >
              Exporter
            </button>
          </div>
          <div className="mt-4 flex h-32 items-end gap-1">
            {stats.tendance14Jours.map((j) => (
              <div key={j.jour} className="group relative flex-1">
                <div
                  className="rounded-t bg-accent transition-opacity group-hover:opacity-70"
                  style={{ height: `${Math.max(4, (j.total / maxJour) * 100)}%` }}
                />
                <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-[10px] text-ink group-hover:block dark:text-paper">
                  {j.total} FCFA
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Quoi : produits qui rapportent le plus */}
          <div>
            <h2 className="font-display text-lg text-ink dark:text-paper">Ce qui se vend</h2>
            {stats.topProduits.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Vos premières ventes apparaîtront ici.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {stats.topProduits.map((p, i) => (
                  <li
                    key={p.nom}
                    className="flex items-center justify-between rounded-lg border border-line bg-paper px-3 py-2 text-sm dark:border-line-dark dark:bg-panel-dark"
                  >
                    <span className="flex items-center gap-2 text-ink dark:text-paper">
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
            <h2 className="font-display text-lg text-ink dark:text-paper">Vos meilleurs clients</h2>
            {stats.topClients.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Aucun client pour le moment.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {stats.topClients.map((c) => (
                  <li
                    key={c.email}
                    className="flex items-center justify-between rounded-lg border border-line bg-paper px-3 py-2 text-sm dark:border-line-dark dark:bg-panel-dark"
                  >
                    <span className="text-ink dark:text-paper">{c.nom}</span>
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
