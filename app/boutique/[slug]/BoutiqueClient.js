"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Store } from "lucide-react";
import { useCart } from "../../CartContext";
import { estVideo } from "../../media";
import AssistantChat from "./AssistantChat";
import ContactVendeurChat from "./ContactVendeurChat";
import BackButton from "../../BackButton";

const SEPT_JOURS_MS = 7 * 24 * 60 * 60 * 1000;

export default function BoutiqueClient({ boutique }) {
  const { ajouter, nombreArticles } = useCart();
  const [ajoutes, setAjoutes] = useState({});
  // Question envoyée à l'assistant depuis un produit précis : le fait de
  // changer `cle` (même texte) rouvre le chat et relance une question.
  const [questionProduit, setQuestionProduit] = useState(null);

  function handleAjouter(produit) {
    ajouter(produit, boutique);
    setAjoutes((a) => ({ ...a, [produit.id]: true }));
    setTimeout(() => {
      setAjoutes((a) => ({ ...a, [produit.id]: false }));
    }, 1500);
  }

  function demanderDisponibilite(produit) {
    setQuestionProduit({
      texte: `Est-ce que "${produit.nom}" est bien disponible et de bonne qualité ?`,
      cle: Date.now(),
    });
  }

  return (
    <>
      <BackButton secours="/" texte="Toutes les boutiques" />

      {/* En-tête façon profil : photo (ou icône par défaut), nom, description */}
      <header className="flex items-start justify-between gap-4 border-b border-line pb-8">
        <div className="flex items-center gap-4">
          {boutique.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={boutique.logoUrl}
              alt={boutique.nom}
              className="h-16 w-16 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-line">
              <Store size={24} strokeWidth={1.5} />
            </div>
          )}
          <div>
            <h1 className="font-display text-3xl md:text-4xl">{boutique.nom}</h1>
            {boutique.description && (
              <p className="mt-1 max-w-xl text-sm text-muted">{boutique.description}</p>
            )}
          </div>
        </div>
        <Link
          href="/panier"
          className="shrink-0 whitespace-nowrap border border-current px-3 py-1 text-xs"
        >
          Panier{nombreArticles > 0 ? ` (${nombreArticles})` : ""}
        </Link>
      </header>

      <section className="mt-10">
        {boutique.produits.length === 0 ? (
          <p className="text-muted">Cette boutique n'a pas encore de produits.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3 md:grid-cols-4">
            {boutique.produits.map((p) => {
              const nouveau = Date.now() - new Date(p.createdAt).getTime() < SEPT_JOURS_MS;
              const stockFaible = p.stock > 0 && p.stock <= 3;

              return (
                <li key={p.id} className="relative flex flex-col bg-paper p-4">
                  {/* Badges discrets, façon grandes marketplaces */}
                  <div className="absolute left-4 top-4 flex flex-col gap-1">
                    {nouveau && (
                      <span className="w-fit bg-ink px-2 py-0.5 text-[10px] uppercase tracking-wide text-paper">
                        Nouveau
                      </span>
                    )}
                    {stockFaible && (
                      <span className="w-fit bg-paper px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink ring-1 ring-ink">
                        Plus que {p.stock}
                      </span>
                    )}
                  </div>

                  {p.imageUrl ? (
                    estVideo(p.imageUrl) ? (
                      <video
                        src={p.imageUrl}
                        className="aspect-square w-full object-cover"
                        muted
                        loop
                        playsInline
                        controls
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.nom}
                        className="aspect-square w-full object-cover"
                      />
                    )
                  ) : (
                    <div className="aspect-square w-full bg-line" />
                  )}
                  <h3 className="mt-3 text-sm">{p.nom}</h3>
                  <p className="mt-1 font-display">{p.prix} FCFA</p>
                  <button
                    onClick={() => handleAjouter(p)}
                    disabled={p.stock <= 0}
                    className="mt-3 flex items-center justify-center gap-1.5 border border-ink px-3 py-2 text-xs transition-colors hover:bg-ink hover:text-paper disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink"
                  >
                    {p.stock <= 0 ? (
                      "Rupture de stock"
                    ) : ajoutes[p.id] ? (
                      <>
                        <Check size={14} /> Ajouté
                      </>
                    ) : (
                      "Ajouter au panier"
                    )}
                  </button>
                  <button
                    onClick={() => demanderDisponibilite(p)}
                    className="mt-2 text-[11px] text-muted underline underline-offset-2"
                  >
                    Ce produit existe-t-il encore ?
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <AssistantChat
        slug={boutique.slug}
        boutiqueNom={boutique.nom}
        questionExterne={questionProduit}
      />
      <ContactVendeurChat slug={boutique.slug} boutiqueNom={boutique.nom} />
    </>
  );
}
