import Link from "next/link";
import { ShoppingBag, Store } from "lucide-react";
import { prisma } from "@/lib/prisma";
import TopNav from "./TopNav";
import ArticlesFeed from "./ArticlesFeed";
import Vitrine from "./Vitrine";
import Footer from "./Footer";

export const dynamic = "force-dynamic";

export default async function Accueil() {
  const [produits, boutiques] = await Promise.all([
    prisma.produit.findMany({
      where: { actif: true, boutique: { actif: true } },
      include: { boutique: { select: { nom: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
    prisma.boutique.findMany({
      where: { actif: true },
      select: { nom: true, slug: true, description: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <main className="min-h-screen">
      <TopNav />

      {/* Les articles en premier : c'est ce que les gens viennent voir */}
      <section id="articles" className="px-6 py-10 md:px-12">
        <ArticlesFeed produits={produits} />
      </section>

      {/* Bandeau vendre, condensé, sous les articles plutôt qu'en pleine
          page d'accueil */}
      <section className="border-y border-line px-6 py-10 md:px-12">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-xl">Vous vendez aussi ?</h2>
            <p className="mt-1 text-sm text-muted">
              Ouvrez votre boutique en quelques minutes, sans intermédiaire.
            </p>
          </div>
          <div className="flex w-full gap-3 sm:w-auto">
            <a
              href="#articles"
              className="flex flex-1 items-center justify-center gap-2 border border-line px-4 py-2.5 text-sm sm:flex-none"
            >
              <ShoppingBag size={15} /> Acheter
            </a>
            <Link
              href="/inscription"
              className="flex flex-1 items-center justify-center gap-2 border border-ink bg-ink px-4 py-2.5 text-sm text-paper transition-colors hover:bg-paper hover:text-ink sm:flex-none"
            >
              <Store size={15} /> Vendre
            </Link>
          </div>
        </div>
      </section>

      <Vitrine />

      {/* Boutiques, pour ceux qui préfèrent parcourir par vendeur */}
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

      <Footer />
    </main>
  );
}
