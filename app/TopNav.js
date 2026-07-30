"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, ChevronDown, Search } from "lucide-react";
import CartBadge from "./CartBadge";

const LIENS = [
  { href: "/", label: "Accueil" },
  { href: "/#boutiques", label: "Acheter" },
  { href: "/inscription", label: "Vendre" },
  { href: "/#categories", label: "Catégories" },
  { href: "/contact", label: "Contact" },
  { href: "/connexion", label: "Connexion vendeur" },
];

// En-tête fixe : logo, recherche directement accessible (plus besoin de
// descendre dans la page), panier, et le reste de la navigation replié
// derrière un menu déroulant pour ne jamais déborder.
export default function TopNav() {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [recherche, setRecherche] = useState("");

  function lancerRecherche(e) {
    e.preventDefault();
    if (!recherche.trim()) return;
    router.push(`/?q=${encodeURIComponent(recherche.trim())}#decouverte`);
  }

  return (
    <div className="sticky top-0 z-30 border-b border-line bg-paper">
      <div className="flex items-center gap-3 px-6 py-3 md:px-12">
        <Link href="/" className="flex shrink-0 items-center gap-1.5 font-display text-lg">
          <Store size={18} strokeWidth={1.5} />
          Marketplace
        </Link>

        <form onSubmit={lancerRecherche} className="flex flex-1 items-center border border-line px-3">
          <Search size={15} className="shrink-0 text-muted" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher..."
            className="w-full bg-transparent px-2 py-1.5 text-sm outline-none"
          />
        </form>

        <div className="flex shrink-0 items-center gap-3">
          <CartBadge />
          <button
            onClick={() => setOuvert(!ouvert)}
            aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
            className="flex items-center"
          >
            <ChevronDown size={20} className={ouvert ? "rotate-180 transition-transform" : "transition-transform"} />
          </button>
        </div>
      </div>

      {ouvert && (
        <nav className="flex flex-col border-t border-line px-6 md:px-12">
          {LIENS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setOuvert(false)}
              className="border-b border-line py-3 text-sm last:border-b-0"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
