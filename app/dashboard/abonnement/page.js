"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import DashboardHeader from "../DashboardHeader";
import { PLANS } from "@/lib/plans";

export default function Abonnement() {
  const router = useRouter();
  const [chargement, setChargement] = useState(true);
  const [abonnement, setAbonnement] = useState(null);
  const [enCours, setEnCours] = useState(null); // code du plan en cours de souscription
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/connexion");
      return;
    }
    fetch("/api/abonnement", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setAbonnement(data.abonnement || null);
        setChargement(false);
      })
      .catch(() => setChargement(false));
  }, [router]);

  const planActuelCode = abonnement?.plan?.code || "GRATUIT";

  async function souscrire(planCode) {
    setErreur("");
    setEnCours(planCode);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/abonnement", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ planCode }),
      });
      const data = await res.json();

      if (!res.ok || !data.urlPaiement) {
        setErreur(data.erreur || "Impossible de démarrer le paiement pour le moment.");
        setEnCours(null);
        return;
      }

      window.location.href = data.urlPaiement;
    } catch {
      setErreur("Une erreur réseau est survenue. Réessayez.");
      setEnCours(null);
    }
  }

  if (chargement) {
    return (
      <main className="min-h-screen bg-canvas dark:bg-ink">
        <DashboardHeader actif="abonnement" />
        <div className="px-6 py-10 md:px-12">
          <div className="h-7 w-40 animate-pulse rounded bg-line dark:bg-line-dark" />
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl border border-line bg-paper dark:border-line-dark dark:bg-panel-dark" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas dark:bg-ink">
      <DashboardHeader actif="abonnement" />

      <div className="px-6 py-10 md:px-12">
        <h1 className="font-display text-2xl text-ink dark:text-paper">Votre abonnement</h1>
        <p className="mt-1 text-sm text-muted">
          Plan actuel : <span className="font-medium text-accent">{PLANS.find((p) => p.code === planActuelCode)?.nom}</span>
          {abonnement?.dateFin && (
            <> — renouvellement le {new Date(abonnement.dateFin).toLocaleDateString("fr-FR")}</>
          )}
        </p>

        {erreur && (
          <div className="mt-4 rounded-lg border border-danger/20 bg-danger-light px-4 py-2 text-sm text-danger dark:bg-danger/10">
            {erreur}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const estActuel = plan.code === planActuelCode;
            return (
              <div
                key={plan.code}
                className={`flex flex-col rounded-xl border p-5 ${
                  estActuel ? "border-accent" : "border-line dark:border-line-dark"
                } bg-paper dark:bg-panel-dark`}
              >
                <p className="font-display text-lg text-ink dark:text-paper">{plan.nom}</p>
                <p className="mt-1 font-display text-2xl text-accent">
                  {plan.prix === 0 ? "Gratuit" : `${plan.prix} FCFA`}
                  {plan.prix > 0 && <span className="text-sm text-muted"> / mois</span>}
                </p>

                <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm text-ink dark:text-paper">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-leaf" />
                    {plan.maxBoutiques ? `${plan.maxBoutiques} boutique${plan.maxBoutiques > 1 ? "s" : ""}` : "Boutiques illimitées"}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-leaf" />
                    {plan.maxProduits ? `${plan.maxProduits} produits / boutique` : "Produits illimités"}
                  </li>
                  {plan.assistantIA && (
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-leaf" /> Assistant IA vendeur
                    </li>
                  )}
                  {plan.statsAvancees && (
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-leaf" /> Statistiques avancées
                    </li>
                  )}
                  {plan.badgePremium && (
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-leaf" /> Badge Premium sur la boutique
                    </li>
                  )}
                </ul>

                <button
                  onClick={() => plan.prix > 0 && souscrire(plan.code)}
                  disabled={estActuel || plan.prix === 0 || enCours === plan.code}
                  className="mt-5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:cursor-default disabled:bg-line disabled:text-muted dark:disabled:bg-line-dark"
                >
                  {estActuel ? "Plan actuel" : enCours === plan.code ? "Redirection..." : plan.prix === 0 ? "—" : "S'abonner"}
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-xs text-muted">
          Paiement sécurisé par CinetPay (Mobile Money et carte bancaire). L'abonnement se
          renouvelle chaque mois ; vous pouvez repasser au plan gratuit à tout moment en
          laissant votre abonnement expirer.
        </p>
      </div>
    </main>
  );
}
