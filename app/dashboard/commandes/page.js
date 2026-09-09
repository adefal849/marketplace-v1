"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "../DashboardHeader";

const LABELS_STATUT = {
  EN_ATTENTE: "En attente",
  CONFIRMEE: "Confirmée",
  EXPEDIEE: "Expédiée",
  LIVREE: "Livrée",
  ANNULEE: "Annulée",
};

const COULEUR_STATUT = {
  EN_ATTENTE: "border-warning/20 text-warning bg-warning-light dark:bg-warning/10",
  CONFIRMEE: "border-accent/20 text-accent bg-accent-light dark:bg-accent/10",
  EXPEDIEE: "border-accent/20 text-accent bg-accent-light dark:bg-accent/10",
  LIVREE: "border-leaf/20 text-leaf bg-leaf-light dark:bg-leaf/10",
  ANNULEE: "border-danger/20 text-danger bg-danger-light dark:bg-danger/10",
};

const FILTRES = ["TOUTES", "EN_ATTENTE", "CONFIRMEE", "EXPEDIEE", "LIVREE", "ANNULEE"];

export default function Commandes() {
  const router = useRouter();
  const [chargement, setChargement] = useState(true);
  const [commandes, setCommandes] = useState([]);
  const [erreur, setErreur] = useState("");
  const [filtre, setFiltre] = useState("TOUTES");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/connexion");
      return;
    }
    charger(token);
  }, [router]);

  async function charger(token) {
    const res = await fetch("/api/commandes", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setCommandes(data.commandes || []);
    setChargement(false);
  }

  async function changerStatut(id, statut) {
    setErreur("");
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/commandes/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ statut }),
    });

    if (res.ok) {
      setCommandes((actuel) =>
        actuel.map((c) => (c.id === id ? { ...c, statut } : c))
      );
    } else {
      setErreur("Impossible de mettre à jour cette commande. Réessayez.");
    }
  }

  if (chargement) {
    return (
      <main className="min-h-screen bg-canvas dark:bg-ink">
        <DashboardHeader actif="commandes" />
        <div className="px-6 py-10 md:px-12">
          <div className="h-7 w-48 animate-pulse rounded bg-line dark:bg-line-dark" />
          <div className="mt-6 flex flex-col gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl border border-line bg-paper dark:border-line-dark dark:bg-panel-dark" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  const commandesFiltrees =
    filtre === "TOUTES" ? commandes : commandes.filter((c) => c.statut === filtre);

  return (
    <main className="min-h-screen bg-canvas dark:bg-ink">
      <DashboardHeader
        actif="commandes"
        commandesEnAttente={commandes.filter((c) => c.statut === "EN_ATTENTE").length}
      />

      <div className="px-6 py-10 md:px-12">
        <h1 className="font-display text-2xl text-ink dark:text-paper">Commandes ({commandes.length})</h1>

        {erreur && (
          <div className="mt-3 rounded-lg border border-danger/20 bg-danger-light px-4 py-2 text-sm text-danger dark:bg-danger/10">
            {erreur}
          </div>
        )}

        {/* Filtres par statut */}
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTRES.map((f) => (
            <button
              key={f}
              onClick={() => setFiltre(f)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
                filtre === f
                  ? "border-accent bg-accent text-paper"
                  : "border-line bg-paper text-muted hover:border-accent/40 dark:border-line-dark dark:bg-panel-dark"
              }`}
            >
              {f === "TOUTES" ? "Toutes" : LABELS_STATUT[f]}
            </button>
          ))}
        </div>

        {commandesFiltrees.length === 0 ? (
          <p className="mt-6 text-muted">
            {filtre === "TOUTES"
              ? "Aucune commande pour le moment. Vos ventes apparaîtront ici."
              : "Aucune commande dans ce statut."}
          </p>
        ) : (
          <ul className="mt-6 flex flex-col gap-4">
            {commandesFiltrees.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-line bg-paper p-4 shadow-sm transition-shadow hover:shadow-md dark:border-line-dark dark:bg-panel-dark"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-ink dark:text-paper">{c.clientNom}</p>
                    {c.boutique?.nom && (
                      <p className="text-xs text-muted">{c.boutique.nom}</p>
                    )}
                    <p className="text-sm text-muted">
                      {c.clientEmail}
                      {c.clientTel ? ` — ${c.clientTel}` : ""}
                    </p>
                    {c.adresseLivraison && (
                      <p className="mt-1 text-xs text-muted">Repère : {c.adresseLivraison}</p>
                    )}
                    {c.latitudeLivraison != null && c.longitudeLivraison != null && (
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${c.latitudeLivraison}&mlon=${c.longitudeLivraison}#map=16/${c.latitudeLivraison}/${c.longitudeLivraison}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs underline text-accent"
                      >
                        Voir le lieu de livraison sur la carte
                      </a>
                    )}
                  </div>
                  <select
                    value={c.statut}
                    onChange={(e) => changerStatut(c.id, e.target.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-accent ${COULEUR_STATUT[c.statut]}`}
                  >
                    {Object.entries(LABELS_STATUT).map(([valeur, libelle]) => (
                      <option key={valeur} value={valeur}>
                        {libelle}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Livraison : affiché seulement si l'API renvoie ces champs */}
                {(c.adresse || c.modeLivraison || c.suivi) && (
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 text-xs text-muted dark:border-line-dark">
                    {c.modeLivraison && <span>Livraison : {c.modeLivraison}</span>}
                    {c.adresse && <span>Adresse : {c.adresse}</span>}
                    {c.suivi && <span>Suivi : {c.suivi}</span>}
                  </div>
                )}

                <ul className="mt-3 border-t border-line pt-3 text-sm text-ink dark:border-line-dark dark:text-paper">
                  {c.lignes.map((l) => (
                    <li key={l.id} className="flex justify-between py-0.5">
                      <span>
                        {l.quantite} × {l.produit.nom}
                      </span>
                      <span>{l.quantite * l.prixUnitaire} FCFA</span>
                    </li>
                  ))}
                  {c.fraisLivraison !== undefined && (
                    <li className="flex justify-between py-0.5 text-muted">
                      <span>Frais de livraison</span>
                      <span>{c.fraisLivraison} FCFA</span>
                    </li>
                  )}
                </ul>

                <p className="mt-3 text-right font-display text-accent">{c.total} FCFA</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
