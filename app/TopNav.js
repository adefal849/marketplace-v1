"use client";

import Link from "next/link";
import CartBadge from "./CartBadge";

// Petite barre de navigation qu'on fait défiler au doigt (overflow-x-auto)
// plutôt qu'un menu qui prend toute la largeur — pensée pour mobile.
export default function TopNav() {
  const liens = [
    { href: "/", label: "Accueil" },
    { href: "/#boutiques", label: "Acheter" },
    { href: "/inscription", label: "Vendre" },
    { href: "/#categories", label: "Catégories" },
    { href: "/contact", label: "Contact" },
    { href: "/connexion", label: "Connexion vendeur" },
  ];

  return (
    <div className="flex items-center gap-4 border-b border-line px-6 py-3 md:px-12">
      <Link href="/" className="shrink-0 font-display text-lg">
        Marketplace
      </Link>

      <nav className="flex flex-1 gap-2 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {liens.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className="shrink-0 border border-line px-3 py-1.5 text-xs hover:border-ink"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <CartBadge />
    </div>
  );
}
