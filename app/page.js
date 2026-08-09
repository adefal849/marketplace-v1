import Link from "next/link";
import { ShoppingBag, Store, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import TopNav from "./TopNav";
import ArticlesFeed from "./ArticlesFeed";
import Vitrine from "./Vitrine";
import Footer from "./Footer";
import LogoDivineHarvest from "./LogoDivineHarvest";

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

      {/* Hero coloré, percutant : explique le site en une phrase et pousse
          vers acheter / vendre / se connecter. Reste au-dessus des
          articles pour que le site se comprenne en un coup d'œil. */}
      <section className="relative overflow-hidden bg-ink px-6 py-16 text-paper md:px-12 md:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent opacity-30 blur-3xl md:h-[28rem] md:w-[28rem]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-accent-dark opacity-20 blur-3xl"
        />

        <div className="relative">
          <div className="flex items-center gap-2 text-accent">
            <LogoDivineHarvest size={22} />
            <span className="text-xs font-medium uppercase tracking-widest">Divine Harvest Store</span>
          </div>

          <h1 className="mt-5 max-w-2xl font-hero text-4xl font-extrabold leading-[1.1] md:text-6xl">
            Le marché où chaque vendeur a sa boutique,
            <span className="text-accent"> et chaque achat compte.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-paper/70 md:text-lg">
            Trouvez des articles vendus directement par de vrais vendeurs, sans intermédiaire.
            Ou ouvrez votre propre boutique en quelques minutes et commencez à vendre aujourd'hui.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#articles"
              className="flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-ink transition-transform hover:scale-[1.03] active:scale-95"
            >
              <ShoppingBag size={16} /> Voir les articles
            </a>
            <Link
              href="/inscription"
              className="flex items-center justify-center gap-2 rounded-full border border-paper/30 px-6 py-3.5 text-sm font-medium transition-colors hover:border-paper hover:bg-paper/10"
            >
              <Store size={16} /> Ouvrir ma boutique
            </Link>
            <Link
              href="/connexion"
              className="flex items-center justify-center gap-1 px-6 py-3.5 text-sm text-paper/70 underline-offset-4 hover:text-paper hover:underline"
            >
              J'ai déjà un compte <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Les articles juste après : c'est ce que les gens viennent voir */}
      <section id="articles" className="px-6 py-10 md:px-12">
        <ArticlesFeed produits={produits} />
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
