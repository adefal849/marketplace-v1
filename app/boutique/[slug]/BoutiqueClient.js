"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../../CartContext";
import AssistantChat from "./AssistantChat";

export default function BoutiqueClient({ boutique }) {
  const { ajouter, nombreArticles } = useCart();
  const [ajoutes, setAjoutes] = useState({});

  function handleAjouter(produit) {
    ajouter(produit, boutique);
    setAjoutes((a) => ({ ...a, [produit.id]: true }));
    setTimeout(() => {
      setAjoutes((a) => ({ ...a, [produit.id]: false }));
    }, 1500);
  }

  return (
    <>
      <header className="flex items-start justify-between gap-4 border-b border-line pb-8">
        <div>
          <h1 className="font-display text-4xl">{boutique.nom}</h1>
          {boutique.description && (
            <p className="mt-2 max-w-xl text-muted">{boutique.description}</p>
          )}
        </div>
        <Link
          href="/panier"
          className="whitespace-nowrap border border-current px-3 py-1 text-xs"
        >
          Panier{nombreArticles > 0 ? ` (${nombreArticles})` : ""}
        </Link>
      </header>

      <section className="mt-10">
        {boutique.produits.length === 0 ? (
          <p className="text-muted">Cette boutique n'a pas encore de produits.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3 md:grid-cols-4">
            {boutique.produits.map((p) => (
              <li key={p.id} className="flex flex-col bg-paper p-4">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt={p.nom}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="aspect-square w-full bg-line" />
                )}
                <h3 className="mt-3 text-sm">{p.nom}</h3>
                <p className="mt-1 font-display">{p.prix} FCFA</p>
                <button
                  onClick={() => handleAjouter(p)}
                  disabled={p.stock <= 0}
                  className="mt-3 border border-ink px-3 py-2 text-xs transition-colors hover:bg-ink hover:text-paper disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink"
                >
                  {p.stock <= 0
                    ? "Rupture de stock"
                    : ajoutes[p.id]
                    ? "Ajouté ✓"
                    : "Ajouter au panier"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AssistantChat slug={boutique.slug} boutiqueNom={boutique.nom} />
    </>
  );
}
