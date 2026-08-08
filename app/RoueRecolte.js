"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

const COULEURS = ["#F5A623", "#FF6B45", "#C8447A", "#1F4B37"];

// Roue de découverte : tire une boutique au hasard parmi les boutiques
// actives et y renvoie l'acheteur. Un vrai outil de découverte habillé en
// petit jeu, pas juste une animation décorative — utile même quand la
// marketplace aura des centaines de boutiques.
export default function RoueRecolte({ boutiques }) {
  const [angle, setAngle] = useState(0);
  const [tirage, setTirage] = useState(null);
  const [enCours, setEnCours] = useState(false);

  const secteurs = useMemo(() => {
    const n = Math.max(boutiques.length, 1);
    return Array.from({ length: n }, (_, i) => (360 / n) * i);
  }, [boutiques]);

  if (boutiques.length === 0) return null;

  function tourner() {
    if (enCours) return;
    setEnCours(true);
    setTirage(null);
    const index = Math.floor(Math.random() * boutiques.length);
    const partSecteur = 360 / boutiques.length;
    // On vise le centre du secteur choisi, + plusieurs tours complets pour
    // l'effet, + un petit décalage aléatoire pour ne pas retomber pile au
    // même endroit visuellement à chaque tirage identique.
    const cible = 360 * 5 + (360 - index * partSecteur - partSecteur / 2) + (Math.random() * 10 - 5);
    setAngle((prev) => prev + cible - (prev % 360 || 0) + (Math.random() * 4 - 2));
    window.setTimeout(() => {
      setTirage(boutiques[index]);
      setEnCours(false);
    }, 4600);
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative shrink-0">
        <div
          className="roue h-36 w-36 rounded-full border-4 border-cream shadow-[6px_8px_0_0_#12301F] sm:h-40 sm:w-40"
          style={{
            transform: `rotate(${angle}deg)`,
            background: `conic-gradient(${boutiques
              .map((_, i) => `${COULEURS[i % COULEURS.length]} ${(360 / boutiques.length) * i}deg ${(360 / boutiques.length) * (i + 1)}deg`)
              .join(", ")})`,
          }}
        >
          {secteurs.map((deg, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 h-0.5 w-16 origin-left bg-cream/40 sm:w-[4.5rem]"
              style={{ transform: `rotate(${deg}deg)` }}
            />
          ))}
        </div>
        {/* Pointeur fixe */}
        <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-cream shadow" />
      </div>

      <div className="flex flex-col items-center gap-3 sm:items-start">
        <button
          onClick={tourner}
          disabled={enCours}
          className="flex items-center gap-2 border-2 border-forest-deep bg-gold px-5 py-2.5 text-sm font-semibold text-forest-deep shadow-[4px_5px_0_0_#12301F] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-none disabled:opacity-60"
        >
          <Sparkles size={16} />
          {enCours ? "Ça tourne..." : "Faire tourner la roue"}
        </button>

        <div className="min-h-[3rem] text-center sm:text-left">
          {tirage ? (
            <p className="animate-apparition text-sm text-cream/90">
              Vous êtes tombé sur{" "}
              <Link href={`/boutique/${tirage.slug}`} className="inline-flex items-center gap-1 font-semibold text-gold underline">
                {tirage.nom} <ArrowRight size={13} />
              </Link>
            </p>
          ) : (
            <p className="text-sm text-cream/70">Une boutique au hasard, à chaque tour.</p>
          )}
        </div>
      </div>
    </div>
  );
}
