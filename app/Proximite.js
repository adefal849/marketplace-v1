"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store } from "lucide-react";
import { CATEGORIES } from "./categories";
import CategoryIcon from "./CategoryIcon";
import { distanceKm, formatDistanceKm } from "@/lib/geo";

// Bloc façon appli mobile, juste sous la nav : catégories toujours
// visibles (pas cachées derrière un clic comme dans TopNav) + boutiques
// triées par distance quand la position est connue. Reprend la mise en
// page des captures de référence (Wago), avec les données réelles de la
// marketplace.
export default function Proximite() {
  const router = useRouter();
  const [boutiques, setBoutiques] = useState([]);
  const [position, setPosition] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    fetch("/api/boutiques")
      .then((res) => res.json())
      .then((data) => setBoutiques(data.boutiques || []))
      .catch(() => setBoutiques([]))
      .finally(() => setChargement(false));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setPosition({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => setPosition(null),
        { timeout: 6000 }
      );
    }
  }, []);

  function chercherCategorie(valeur) {
    router.push(`/?categorie=${valeur}#articles`);
  }

  const avecDistance = boutiques.map((b) => ({
    ...b,
    distance: position ? distanceKm(position.lat, position.lng, b.latitude, b.longitude) : null,
  }));

  // Boutiques localisées et proches d'abord ; le reste garde son ordre
  // (les vendeurs n'ont pas encore tous positionné leur boutique).
  const triees = [...avecDistance].sort((a, b) => {
    if (a.distance == null && b.distance == null) return 0;
    if (a.distance == null) return 1;
    if (b.distance == null) return -1;
    return a.distance - b.distance;
  });

  return (
    <section className="px-6 pt-6 md:px-12">
      <div className="flex gap-4 overflow-x-auto whitespace-nowrap pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((c) => (
          <button
            key={c.valeur}
            onClick={() => chercherCategorie(c.valeur)}
            className="flex shrink-0 flex-col items-center gap-1.5"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-light text-accent-dark">
              <CategoryIcon nom={c.icone} size={18} strokeWidth={1.5} />
            </span>
            <span className="text-xs text-muted">{c.label}</span>
          </button>
        ))}
      </div>

      {!chargement && triees.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-medium text-ink dark:text-paper">
            {position ? "À proximité" : "Boutiques"}
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {triees.slice(0, 6).map((b) => (
              <Link
                key={b.slug}
                href={`/boutique/${b.slug}`}
                className="flex items-center gap-3 rounded-xl border border-line p-3 transition-colors hover:border-ink dark:border-line-dark"
              >
                {b.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.logoUrl}
                    alt={b.nom}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-light text-accent-dark">
                    <Store size={16} strokeWidth={1.5} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink dark:text-paper">{b.nom}</p>
                  {b.description && (
                    <p className="truncate text-xs text-muted">{b.description}</p>
                  )}
                </div>
                {b.distance != null && (
                  <span className="shrink-0 text-xs text-muted">
                    {formatDistanceKm(b.distance)}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
