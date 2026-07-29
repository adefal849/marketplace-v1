"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import CartBadge from "./CartBadge";

const LIENS = [
  { href: "/", label: "Accueil" },
  { href: "/#boutiques", label: "Acheter" },
  { href: "/inscription", label: "Vendre" },
  { href: "/#categories", label: "Catégories" },
  { href: "/contact", label: "Contact" },
  { href: "/connexion", label: "Connexion vendeur" },
];

// En-tête minimale : logo + panier toujours visibles, le reste de la
// navigation est replié derrière l'icône 🔍 pour ne jamais déborder,
// même sur petit écran.
export default function TopNav() {
  const [ouvert, setOuvert] = useState(false);

  return (
    <div className="border-b border-line">
      <div className="flex items-center justify-between gap-4 px-6 py-4 md:px-12">
        <Link href="/" className="font-display text-lg">
          Marketplace
        </Link>
        <div className="flex items-center gap-4">
          <CartBadge />
          <button
            onClick={() => setOuvert(!ouvert)}
            aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {ouvert ? <X size={20} /> : <Search size={20} />}
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
