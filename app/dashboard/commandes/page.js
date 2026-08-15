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
  EN_ATTENTE: "border-accent text-accent-dark bg-accent-light",
  CONFIRMEE: "border-ia text-ia bg-ia-light",
  EXPEDIEE: "border-ia text-ia bg-ia-light",
  LIVREE: "border-leaf text-leaf bg-leaf-light",
  ANNULEE: "border-line text-muted bg-line/30",
};

export default function Commandes() {
  const router = useRouter();
  const [chargement, setChargement] = useState(true);
  const [commandes, setCommandes] = useState([]);
  const [erreur, setErreur] = useState("");

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
      setErreur("Impossible de mettre à jour cette commande.");
    }
  }

  if (chargement) {
    return <main className="min-h-screen px-6 py-12">Chargement...</main>;
  }

  return (
    <main className="min-h-screen">
      <DashboardHeader
        actif="commandes"
        commandesEnAttente={commandes.filter((c) => c.statut === "EN_ATTENTE").length}
      />

      <div className="px-6 py-10 md:px-12">
        <h1 className="font-display text-2xl">Commandes ({commandes.length})</h1>
        {erreur && <p className="mt-2 text-sm">{erreur}</p>}

        {commandes.length === 0 ? (
          <p className="mt-4 text-muted">Aucune commande pour le moment.</p>
        ) : (
          <ul className="mt-6 flex flex-col gap-4">
            {commandes.map((c) => (
              <li key={c.id} className="rounded-xl border border-line p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display">{c.clientNom}</p>
                    {c.boutique?.nom && (
                      <p className="text-xs text-muted">{c.boutique.nom}</p>
                    )}
                    <p className="text-sm text-muted">
                      {c.clientEmail}
                      {c.clientTel ? ` — ${c.clientTel}` : ""}
                    </p>
                  </div>
                  <select
                    value={c.statut}
                    onChange={(e) => changerStatut(c.id, e.target.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium ${COULEUR_STATUT[c.statut]}`}
                  >
                    {Object.entries(LABELS_STATUT).map(([valeur, libelle]) => (
                      <option key={valeur} value={valeur}>
                        {libelle}
                      </option>
                    ))}
                  </select>
                </div>

                <ul className="mt-3 border-t border-line pt-3 text-sm">
                  {c.lignes.map((l) => (
                    <li key={l.id} className="flex justify-between py-0.5">
                      <span>
                        {l.quantite} × {l.produit.nom}
                      </span>
                      <span>{l.quantite * l.prixUnitaire} FCFA</span>
                    </li>
                  ))}
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
