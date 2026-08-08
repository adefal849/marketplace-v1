import Link from "next/link";
import { ShoppingBag, Store } from "lucide-react";
import RoueRecolte from "./RoueRecolte";

// Formes décoratives : positions/tailles/couleurs fixes (pas de Math.random
// ici) pour que le rendu serveur et client correspondent exactement.
const FORMES = [
  { top: "8%", left: "4%", size: 90, color: "#F5A623", classe: "animate-deriver" },
  { top: "62%", left: "82%", size: 130, color: "#FF6B45", classe: "animate-deriver-lent" },
  { top: "78%", left: "10%", size: 60, color: "#C8447A", classe: "animate-deriver" },
  { top: "15%", left: "88%", size: 70, color: "#FBF1DF", classe: "animate-deriver-lent" },
];

export default function Hero({ boutiques }) {
  return (
    <section className="relative overflow-hidden bg-forest-deep px-6 py-16 text-cream md:px-12 md:py-24">
      {FORMES.map((f, i) => (
        <div
          key={i}
          className={`forme-flottante ${f.classe} opacity-25`}
          style={{ top: f.top, left: f.left, width: f.size, height: f.size, background: f.color }}
        />
      ))}

      <div className="relative mx-auto max-w-3xl">
        <p className="font-body text-xs uppercase tracking-[0.2em] text-gold">
          Divine Harvest Store
        </p>
        <h1 className="mt-4 font-hero text-4xl font-extrabold leading-[1.05] sm:text-5xl md:text-6xl">
          Récoltez le meilleur,
          <br />
          boutique après boutique.
        </h1>
        <p className="mt-5 max-w-xl text-base text-cream/80 sm:text-lg">
          Des vendeurs indépendants, un seul marché. Achetez, discutez en
          direct, ou ouvrez votre boutique en quelques minutes — sans
          intermédiaire.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#articles"
            className="flex items-center gap-2 border-2 border-cream bg-cream px-5 py-2.5 text-sm font-semibold text-forest-deep transition-transform hover:-translate-y-0.5"
          >
            <ShoppingBag size={16} /> Découvrir le marché
          </a>
          <Link
            href="/inscription"
            className="flex items-center gap-2 border-2 border-cream/40 px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:border-cream"
          >
            <Store size={16} /> Ouvrir ma boutique
          </Link>
        </div>

        <div className="mt-14 border-t border-cream/15 pt-10">
          <RoueRecolte boutiques={boutiques} />
        </div>
      </div>
    </section>
  );
}
