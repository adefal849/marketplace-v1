import Link from "next/link";
import { ShoppingBag, Store } from "lucide-react";
import { prisma } from "@/lib/prisma";
import TopNav from "./TopNav";
import Decouverte from "./Decouverte";
import Vitrine from "./Vitrine";

export const dynamic = "force-dynamic";

export default async function Accueil() {
  const boutiques = await prisma.boutique.findMany({
    where: { actif: true },
    select: { nom: true, slug: true, description: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen">
      <TopNav />

      {/* Hero : fond en grille de points discrète + message publicitaire
          + choix acheter/vendre */}
      <section
        className="relative border-b border-line px-6 py-20 text-line md:px-12 md:py-28"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "-12px -12px",
        }}
      >
        <div className="relative text-ink">
          <h1 className="max-w-2xl font-display text-4xl leading-tight md:text-6xl">
            Chaque boutique a une adresse. Chaque vente vous appartient.
          </h1>
          <p className="mt-6 max-w-xl text-muted">
            La marketplace qui connecte acheteurs et vendeurs, sans intermédiaire.
            Trouvez ce qu'il vous faut, ou ouvrez votre boutique en quelques minutes.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:max-w-md">
            <a
              href="#decouverte"
              className="flex flex-1 items-center justify-center gap-2 border border-ink bg-ink px-5 py-4 text-sm text-paper transition-colors hover:bg-paper hover:text-ink"
            >
              <ShoppingBag size={16} /> Je veux acheter
            </a>
            <Link
              href="/inscription"
              className="flex flex-1 items-center justify-center gap-2 border border-ink px-5 py-4 text-sm transition-colors hover:bg-ink hover:text-paper"
            >
              <Store size={16} /> Je veux vendre
            </Link>
          </div>
        </div>
      </section>

      <Vitrine />

      {/* Recherche + catégories + résultats */}
      <section id="decouverte" className="border-b border-line px-6 py-12 md:px-12">
        <Decouverte />
      </section>

      <section id="boutiques" className="px-6 py-16 md:px-12">
        <h2 className="mb-8 font-display text-2xl">Boutiques</h2>

        {boutiques.length === 0 ? (
          <p className="text-muted">
            Aucune boutique pour le moment. Soyez le premier à en ouvrir une.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 md:grid-cols-3">
            {boutiques.map((b) => (
              <li key={b.slug} className="bg-paper p-6">
                <Link href={`/boutique/${b.slug}`} className="group">
                  <h3 className="font-display text-xl group-hover:underline">
                    {b.nom}
                  </h3>
                  {b.description && (
                    <p className="mt-2 text-sm text-muted">{b.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
