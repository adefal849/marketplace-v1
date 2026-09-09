"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Minus, Plus, Store } from "lucide-react";
import { useCart } from "../../CartContext";
import { estVideo } from "../../media";
import BackButton from "../../BackButton";

const SEPT_JOURS_MS = 7 * 24 * 60 * 60 * 1000;

export default function ProduitClient({ produit, autresProduits }) {
  const { ajouter, nombreArticles } = useCart();
  const [quantite, setQuantite] = useState(1);
  const [ajoute, setAjoute] = useState(false);

  const nouveau = Date.now() - new Date(produit.createdAt).getTime() < SEPT_JOURS_MS;
  const enRupture = produit.stock <= 0;
  const stockFaible = produit.stock > 0 && produit.stock <= 3;

  const styleAccent = produit.boutique.couleurAccent
    ? { "--accent": produit.boutique.couleurAccent }
    : undefined;

  function handleAjouter() {
    ajouter(produit, produit.boutique, quantite);
    setAjoute(true);
    setTimeout(() => setAjoute(false), 1500);
  }

  return (
    <div style={styleAccent}>
      <div className="flex items-center justify-between gap-4">
        <BackButton secours={`/boutique/${produit.boutique.slug}`} texte={produit.boutique.nom} />
        <Link href="/panier" className="shrink-0 whitespace-nowrap border border-current px-3 py-1 text-xs">
          Panier{nombreArticles > 0 ? ` (${nombreArticles})` : ""}
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Image / vidéo produit */}
        <div className="relative">
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
            {nouveau && (
              <span className="w-fit rounded-full bg-leaf px-2 py-0.5 text-[10px] uppercase tracking-wide text-paper">
                Nouveau
              </span>
            )}
            {stockFaible && (
              <span className="w-fit rounded-full bg-accent px-2 py-0.5 text-[10px] uppercase tracking-wide text-paper">
                Plus que {produit.stock}
              </span>
            )}
          </div>

          {produit.imageUrl ? (
            estVideo(produit.imageUrl) ? (
              <video
                src={produit.imageUrl}
                className="aspect-square w-full rounded-xl object-cover"
                muted
                loop
                playsInline
                controls
              />
            ) : (
              <div className="relative aspect-square w-full overflow-hidden rounded-xl">
                <Image
                  src={produit.imageUrl}
                  alt={produit.nom}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
            )
          ) : (
            <div className="aspect-square w-full rounded-xl bg-line" />
          )}
        </div>

        {/* Infos et achat */}
        <div>
          {produit.categorie && (
            <p className="text-xs uppercase tracking-wide text-muted">{produit.categorie}</p>
          )}
          <h1 className="mt-1 font-display text-2xl md:text-3xl">{produit.nom}</h1>
          <p className="mt-2 font-display text-2xl text-accent">{produit.prix} FCFA</p>

          <Link
            href={`/boutique/${produit.boutique.slug}`}
            className="mt-4 flex w-fit items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm transition-colors hover:border-accent"
          >
            {produit.boutique.logoUrl ? (
              <Image
                src={produit.boutique.logoUrl}
                alt=""
                width={20}
                height={20}
                className="h-5 w-5 rounded-full object-cover"
              />
            ) : (
              <Store size={14} />
            )}
            {produit.boutique.nom}
          </Link>

          {produit.description && (
            <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-ink">
              {produit.description}
            </p>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-line">
              <button
                onClick={() => setQuantite((q) => Math.max(1, q - 1))}
                disabled={enRupture}
                className="p-2.5 disabled:opacity-40"
                aria-label="Diminuer la quantité"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-sm">{quantite}</span>
              <button
                onClick={() => setQuantite((q) => (produit.stock ? Math.min(produit.stock, q + 1) : q + 1))}
                disabled={enRupture}
                className="p-2.5 disabled:opacity-40"
                aria-label="Augmenter la quantité"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              onClick={handleAjouter}
              disabled={enRupture}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-accent px-5 py-3 text-sm font-medium text-paper transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            >
              {enRupture ? (
                "Rupture de stock"
              ) : ajoute ? (
                <>
                  <Check size={16} /> Ajouté au panier
                </>
              ) : (
                "Ajouter au panier"
              )}
            </button>
          </div>
        </div>
      </div>

      {autresProduits.length > 0 && (
        <section className="mt-14 border-t border-line pt-8">
          <h2 className="font-display text-lg">Autres articles de {produit.boutique.nom}</h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {autresProduits.map((p) => (
              <li key={p.id} className="overflow-hidden rounded-xl border border-line bg-paper transition-shadow hover:shadow-md">
                <Link href={`/produit/${p.id}`}>
                  {p.imageUrl ? (
                    estVideo(p.imageUrl) ? (
                      <video src={p.imageUrl} className="aspect-square w-full object-cover" muted playsInline />
                    ) : (
                      <div className="relative aspect-square w-full">
                        <Image src={p.imageUrl} alt={p.nom} fill sizes="25vw" className="object-cover" />
                      </div>
                    )
                  ) : (
                    <div className="aspect-square w-full bg-line" />
                  )}
                  <div className="p-3">
                    <h3 className="text-sm">{p.nom}</h3>
                    <p className="mt-1 font-display text-accent">{p.prix} FCFA</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
