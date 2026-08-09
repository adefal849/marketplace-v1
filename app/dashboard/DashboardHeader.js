"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Search, Bell, X } from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import LogoDivineHarvest from "../LogoDivineHarvest";

const SECTIONS = [
  { href: "/", label: "Accueil (voir les boutiques)" },
  { href: "/dashboard", cle: "dashboard", label: "Tableau de bord" },
  { href: "/dashboard/commandes", cle: "commandes", label: "Commandes" },
  { href: "/dashboard/messages", cle: "messages", label: "Messages" },
  { href: "/dashboard/ventes", cle: "ventes", label: "Ventes" },
  { href: "/dashboard/parametres", cle: "parametres", label: "Paramètres" },
];

// En-tête sombre façon back-office (barre compacte, menu en tiroir,
// recherche/notifications/avatar à droite) plutôt qu'une longue liste de
// liens qui finit par déborder sur mobile.
export default function DashboardHeader({ actif, commandesEnAttente = 0, messagesNonLus = 0, boutiqueSlug }) {
  const router = useRouter();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [avatarOuvert, setAvatarOuvert] = useState(false);
  const avatarRef = useRef(null);

  const notifications = commandesEnAttente + messagesNonLus;

  useEffect(() => {
    function fermerSiExterieur(e) {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOuvert(false);
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
    <header className="sticky top-0 z-30 bg-ink text-paper">
      <div className="flex items-center gap-3 px-4 py-3 md:px-8">
        <button onClick={() => setMenuOuvert(!menuOuvert)} aria-label="Menu">
          {menuOuvert ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link href="/dashboard" className="flex shrink-0 items-center gap-1.5 font-display text-base">
          <LogoDivineHarvest size={16} />
          <span className="hidden sm:inline">Divine Harvest Store</span>
        </Link>

        <div className="ml-2 flex flex-1 items-center gap-2 rounded-full bg-paper/10 px-3 py-1.5 text-sm text-paper/70">
          <Search size={15} />
          <span className="hidden sm:inline">Rechercher dans votre boutique</span>
        </div>

        <Link href="/dashboard/commandes" aria-label="Notifications" className="relative">
          <Bell size={20} />
          {notifications > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-paper px-1 text-[10px] font-medium text-ink">
              {notifications}
            </span>
          )}
        </Link>

        <div ref={avatarRef} className="relative">
          <button
            onClick={() => setAvatarOuvert(!avatarOuvert)}
            aria-label="Compte"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-paper text-sm font-medium text-ink"
          >
            DH
          </button>

          {avatarOuvert && (
            <div className="absolute right-0 top-10 z-10 flex w-48 flex-col border border-line bg-paper py-1 text-sm text-ink shadow-sm">
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
              <Link href="/dashboard/parametres" className="px-4 py-2 hover:bg-line/20" onClick={() => setAvatarOuvert(false)}>
                Paramètres
              </Link>
              <div className="flex items-center justify-between px-4 py-2">
                <span>Thème</span>
                <ThemeToggle />
              </div>
              <button onClick={deconnexion} className="px-4 py-2 text-left hover:bg-line/20">
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>

      {menuOuvert && (
        <nav className="flex flex-col border-t border-paper/20 px-4 md:px-8">
          {SECTIONS.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              onClick={() => setMenuOuvert(false)}
              className={`border-b border-paper/10 py-3 text-sm last:border-b-0 ${
                actif === s.cle ? "font-medium" : "text-paper/80"
              }`}
            >
              {s.label}
              {s.cle === "commandes" && commandesEnAttente > 0 ? ` (${commandesEnAttente})` : ""}
              {s.cle === "messages" && messagesNonLus > 0 ? ` (${messagesNonLus})` : ""}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
