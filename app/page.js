import Link from "next/link";
import { Store } from "lucide-react";
import { prisma } from "@/lib/prisma";
import TopNav from "./TopNav";
import Hero from "./Hero";
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

      <Hero boutiques={boutiques} />

      {/* Les articles : c'est ce que les gens viennent voir */}
      <section id="articles" className="px-6 py-10 md:px-12">
        <ArticlesFeed produits={produits} />
      </section>

      {/* Bandeau vendre, condensé, sous les articles plutôt qu'en pleine
          page d'accueil */}
      <section className="border-y border-line bg-cream/40 px-6 py-10 md:px-12 dark:bg-transparent">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-xl">Vous vendez aussi ?</h2>
            <p className="mt-1 text-sm text-muted">
              Ouvrez votre boutique en quelques minutes, sans intermédiaire.
            </p>
          </div>
          <Link
            href="/inscription"
            className="flex w-full items-center justify-center gap-2 border-2 border-forest-deep bg-gold px-5 py-2.5 text-sm font-semibold text-forest-deep shadow-[3px_4px_0_0_#12301F] transition-transform hover:-translate-y-0.5 sm:w-auto"
          >
            <Store size={15} /> Ouvrir ma boutique
          </Link>
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
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {boutiques.map((b, i) => (
              <li
                key={b.slug}
                className="carte-jeu border-2 border-ink bg-paper p-6 shadow-[4px_5px_0_0_#0a0a0a] dark:border-paper dark:shadow-[4px_5px_0_0_#e5e5e5]"
              >
                <Link href={`/boutique/${b.slug}`} className="group">
                  <span
                    className="mb-3 inline-block h-2 w-8"
                    style={{ background: ["#F5A623", "#FF6B45", "#C8447A", "#1F4B37"][i % 4] }}
                  />
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
