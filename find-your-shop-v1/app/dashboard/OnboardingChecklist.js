"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

// Checklist de démarrage façon Shopify — mais seulement des étapes qui
// correspondent à une vraie fonctionnalité de l'app (pas de thème, pas
// de domaine, pas de paiement : ça n'existe pas encore ici).
export default function OnboardingChecklist({ boutique, onAjouterProduit }) {
  const etapes = [
    {
      fait: boutique.produits.length > 0,
      texte: "Ajouter votre premier produit",
      action: onAjouterProduit,
    },
    {
      fait: Boolean(boutique.logoUrl),
      texte: "Ajouter une photo à votre boutique",
      lien: "/dashboard/parametres",
    },
    {
      fait: Boolean(boutique.description),
      texte: "Rédiger la description de votre boutique",
      lien: "/dashboard/parametres",
    },
  ];

  const fait = etapes.filter((e) => e.fait).length;

  if (fait === etapes.length) return null;

  return (
    <section className="border border-line p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg">Finalisez votre boutique</h3>
        <span className="text-sm text-muted">
          {fait}/{etapes.length}
        </span>
      </div>

      <div className="mt-3 h-1 w-full bg-line">
        <div
          className="h-1 bg-ink transition-all"
          style={{ width: `${(fait / etapes.length) * 100}%` }}
        />
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {etapes.map((e, i) => {
          const contenu = (
            <span className="flex items-center gap-2 text-sm">
              {e.fait ? (
                <CheckCircle2 size={16} className="shrink-0" />
              ) : (
                <Circle size={16} className="shrink-0 text-muted" />
              )}
              <span className={e.fait ? "text-muted line-through" : ""}>{e.texte}</span>
            </span>
          );

          if (e.fait) return <li key={i}>{contenu}</li>;

          if (e.lien) {
            return (
              <li key={i}>
                <Link href={e.lien} className="hover:underline">
                  {contenu}
                </Link>
              </li>
            );
          }

          return (
            <li key={i}>
              <button onClick={e.action} className="text-left hover:underline">
                {contenu}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
