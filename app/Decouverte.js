"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "./categories";
import CategoryIcon from "./CategoryIcon";

// Barre de recherche + catégories, avec résultats affichés en direct.
// Reste discret quand rien n'est cherché : l'accueil garde la liste des
// boutiques en dessous comme avant.
export default function Decouverte() {
  const [q, setQ] = useState("");
  const [categorie, setCategorie] = useState(null);
  const [resultats, setResultats] = useState(null);
  const [recherche, setRecherche] = useState(false);

  useEffect(() => {
    if (!q.trim() && !categorie) {
      setResultats(null);
      return;
    }

    setRecherche(true);
    const delai = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (categorie) params.set("categorie", categorie);
        const res = await fetch(`/api/recherche?${params}`);
        const data = await res.json();
        setResultats(data);
      } catch {
        setResultats({ produits: [], boutiques: [] });
      } finally {
        setRecherche(false);
      }
    }, 350);

    return () => clearTimeout(delai);
  }, [q, categorie]);

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un produit ou une boutique..."
          className="w-full border border-ink px-4 py-3 text-sm"
        />
      </div>

      <div
        id="categories"
        className="mt-4 flex gap-2 overflow-x-auto whitespace-nowrap pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {CATEGORIES.map((c) => (
          <button
            key={c.valeur}
            onClick={() => setCategorie(categorie === c.valeur ? null : c.valeur)}
            className={`flex shrink-0 items-center gap-1.5 border px-3 py-1.5 text-xs ${
              categorie === c.valeur ? "border-ink bg-ink text-paper" : "border-line"
            }`}
          >
            <CategoryIcon nom={c.icone} size={14} /> {c.label}
          </button>
        ))}
      </div>

      {(q.trim() || categorie) && (
        <div className="mt-8">
          {recherche && <p className="text-sm text-muted">Recherche...</p>}

          {resultats && !recherche && (
            <>
              {resultats.boutiques.length > 0 && (
                <div className="mb-8">
                  <p className="mb-3 text-sm text-muted">Boutiques</p>
                  <ul className="flex flex-col gap-2">
                    {resultats.boutiques.map((b) => (
                      <li key={b.slug}>
                        <Link href={`/boutique/${b.slug}`} className="underline">
                          {b.nom}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {resultats.produits.length === 0 && resultats.boutiques.length === 0 ? (
                <p className="text-sm text-muted">Aucun résultat.</p>
              ) : (
                <ul className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3 md:grid-cols-4">
                  {resultats.produits.map((p) => (
                    <li key={p.id} className="bg-paper p-4">
                      <Link href={`/boutique/${p.boutique.slug}`}>
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imageUrl} alt={p.nom} className="aspect-square w-full object-cover" />
                        ) : (
                          <div className="aspect-square w-full bg-line" />
                        )}
                        <h3 className="mt-3 text-sm">{p.nom}</h3>
                        <p className="mt-1 font-display">{p.prix} FCFA</p>
                        <p className="mt-1 text-xs text-muted">{p.boutique.nom}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
