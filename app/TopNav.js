"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Search, X } from "lucide-react";
import CartBadge from "./CartBadge";
import LogoDivineHarvest from "./LogoDivineHarvest";
import ThemeToggle from "./ThemeToggle";
import { CATEGORIES } from "./categories";
import CategoryIcon from "./CategoryIcon";

const LIENS = [
  { href: "/", label: "Accueil" },
  { href: "/#articles", label: "Acheter" },
  { href: "/inscription", label: "Vendre" },
  { href: "/contact", label: "Contact" },
  { href: "/connexion", label: "Connexion vendeur" },
];

// En-tête fixe et compacte : logo, panier, deux icônes (recherche, menu).
// Chacune ouvre son propre petit panneau plutôt que d'occuper de la place
// en permanence — ça évite le fouillis vu sur les captures précédentes.
export default function TopNav() {
  const router = useRouter();
  const [rechercheOuverte, setRechercheOuverte] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [recherche, setRecherche] = useState("");

  function lancerRecherche(e) {
    e.preventDefault();
    if (!recherche.trim()) return;
    router.push(`/?q=${encodeURIComponent(recherche.trim())}#articles`);
    setRechercheOuverte(false);
  }

  function chercherCategorie(valeur) {
    router.push(`/?categorie=${valeur}#articles`);
    setRechercheOuverte(false);
  }

  return (
    <div className="sticky top-0 z-30 border-b border-line bg-paper text-ink dark:border-line-dark dark:bg-ink dark:text-paper">
      <div className="flex items-center justify-between gap-3 px-6 py-3 md:px-12">
        <Link href="/" className="flex shrink-0 items-center gap-1.5 font-display text-lg">
          <LogoDivineHarvest size={18} />
          Divine Harvest Store
        </Link>

        <div className="flex shrink-0 items-center gap-4">
          <button
            onClick={() => {
              setRechercheOuverte(!rechercheOuverte);
              setMenuOuvert(false);
            }}
            aria-label={rechercheOuverte ? "Fermer la recherche" : "Rechercher"}
          >
            {rechercheOuverte ? <X size={20} /> : <Search size={20} />}
          </button>
          <CartBadge />
          <button
            onClick={() => {
              setMenuOuvert(!menuOuvert);
              setRechercheOuverte(false);
            }}
            aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
            className="flex items-center"
          >
            <ChevronDown size={20} className={menuOuvert ? "rotate-180 transition-transform" : "transition-transform"} />
          </button>
        </div>
      </div>

      {rechercheOuverte && (
        <div className="border-t border-line px-6 py-4 md:px-12">
          <form onSubmit={lancerRecherche} className="flex items-center border border-ink px-3">
            <Search size={15} className="shrink-0 text-muted" />
            <input
              autoFocus
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un produit, une boutique..."
              className="w-full bg-transparent px-2 py-2 text-sm outline-none"
            />
          </form>

          <div className="mt-4 flex gap-2 overflow-x-auto whitespace-nowrap pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((c) => (
              <button
                key={c.valeur}
                onClick={() => chercherCategorie(c.valeur)}
                className="flex shrink-0 items-center gap-1.5 border border-line px-3 py-1.5 text-xs hover:border-ink"
              >
                <CategoryIcon nom={c.icone} size={14} /> {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {menuOuvert && (
        <nav className="flex flex-col border-t border-line px-6 dark:border-line-dark md:px-12">
          {LIENS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setMenuOuvert(false)}
              className="border-b border-line py-3 text-sm last:border-b-0 dark:border-line-dark"
            >
              {l.label}
            </Link>
          ))}
          <div className="py-3">
            <ThemeToggle />
          </div>
        </nav>
      )}
    </div>
  );
}
