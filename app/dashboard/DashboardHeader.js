"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "../ThemeToggle";

// En-tête compacte partagée par toutes les pages du dashboard vendeur.
// Seules les 2 sections principales (Tableau de bord / Commandes) restent
// visibles directement ; le reste (paramètres, thème, lien boutique
// publique, déconnexion) est regroupé dans un menu déroulant pour ne pas
// surcharger la barre du haut.
export default function DashboardHeader({ actif, commandesEnAttente = 0, messagesNonLus = 0, boutiqueSlug }) {
  const router = useRouter();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function fermerSiExterieur(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOuvert(false);
      }
    }
    document.addEventListener("mousedown", fermerSiExterieur);
    return () => document.removeEventListener("mousedown", fermerSiExterieur);
  }, []);

  function deconnexion() {
    localStorage.removeItem("token");
    router.push("/");
  }

  return (
    <header className="flex items-center justify-between border-b border-line px-6 py-4">
      {/* Le nom ramène au tableau de bord vendeur, pas à la vitrine
          publique : on reste dans l'espace admin. */}
      <Link href="/dashboard" className="font-display text-lg">
        Marketplace
      </Link>

      <nav className="flex items-center gap-5 text-sm">
        <Link href="/" className="hover:underline">
          Accueil
        </Link>
        <Link
          href="/dashboard"
          className={actif === "dashboard" ? "font-medium underline" : "hover:underline"}
        >
          Tableau de bord
        </Link>
        <Link
          href="/dashboard/commandes"
          className={actif === "commandes" ? "font-medium underline" : "hover:underline"}
        >
          Commandes{commandesEnAttente > 0 ? ` (${commandesEnAttente})` : ""}
        </Link>
        <Link
          href="/dashboard/messages"
          className={actif === "messages" ? "font-medium underline" : "hover:underline"}
        >
          Messages{messagesNonLus > 0 ? ` (${messagesNonLus})` : ""}
        </Link>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOuvert((v) => !v)}
            aria-label="Menu"
            className="flex h-8 w-8 items-center justify-center border border-current text-sm"
          >
            ⋯
          </button>

          {menuOuvert && (
            <div className="absolute right-0 top-10 z-10 flex w-48 flex-col border border-line bg-paper py-1 text-sm shadow-sm">
              {boutiqueSlug && (
                <a
                  href={`/boutique/${boutiqueSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 hover:bg-line/20"
                >
                  Voir ma boutique
                </a>
              )}
              <Link
                href="/dashboard/parametres"
                className="px-4 py-2 hover:bg-line/20"
                onClick={() => setMenuOuvert(false)}
              >
                Paramètres
              </Link>
              <div className="flex items-center justify-between px-4 py-2">
                <span>Thème</span>
                <ThemeToggle />
              </div>
              <button
                onClick={deconnexion}
                className="px-4 py-2 text-left hover:bg-line/20"
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
