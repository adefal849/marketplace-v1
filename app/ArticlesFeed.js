"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CATEGORIES } from "./categories";
import CategoryIcon from "./CategoryIcon";
import { estVideo } from "./media";

function Feed({ produits }) {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [categorie, setCategorie] = useState(searchParams.get("categorie") || null);

  const filtres = useMemo(() => {
    const texte = q.trim().toLowerCase();
    return produits.filter((p) => {
      const okCategorie = !categorie || p.categorie === categorie;
      const okTexte =
        !texte ||
        p.nom.toLowerCase().includes(texte) ||
        p.boutique.nom.toLowerCase().includes(texte);
      return okCategorie && okTexte;
    });
  }, [produits, q, categorie]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl">Tous les articles</h2>
        {q && (
          <button onClick={() => setQ("")} className="text-xs text-muted underline">
            Effacer "{q}"
          </button>
        )}
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto whitespace-nowrap pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setCategorie(null)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${!categorie ? "border-accent bg-accent text-paper" : "border-line hover:border-accent"}`}
        >
          Tout
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.valeur}
            onClick={() => setCategorie(categorie === c.valeur ? null : c.valeur)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
              categorie === c.valeur ? "border-accent bg-accent text-paper" : "border-line hover:border-accent"
            }`}
          >
            <CategoryIcon nom={c.icone} size={14} /> {c.label}
          </button>
        ))}
      </div>

      {filtres.length === 0 ? (
        <p className="mt-8 text-sm text-muted">Aucun article ne correspond.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filtres.map((p) => (
            <li key={p.id} className="overflow-hidden rounded-xl border border-line bg-paper transition-shadow hover:shadow-md">
              <Link href={`/boutique/${p.boutique.slug}`}>
                {p.imageUrl ? (
                  estVideo(p.imageUrl) ? (
                    <video src={p.imageUrl} className="aspect-square w-full object-cover" muted playsInline />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.nom} className="aspect-square w-full object-cover" />
                  )
                ) : (
                  <div className="aspect-square w-full bg-line" />
                )}
                <div className="p-3">
                  <h3 className="text-sm">{p.nom}</h3>
                  <p className="mt-1 font-display text-accent">{p.prix} FCFA</p>
                  <p className="mt-1 text-xs text-muted">{p.boutique.nom}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ArticlesFeed({ produits }) {
  return (
    <Suspense fallback={null}>
      <Feed produits={produits} />
    </Suspense>
  );
}
