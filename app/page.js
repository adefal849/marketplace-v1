import Link from "next/link";
import { ShoppingBag, Store, ArrowRight, ArrowDown, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import TopNav from "./TopNav";
import ArticlesFeed from "./ArticlesFeed";
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
      select: { nom: true, slug: true, description: true, logoUrl: true, couleurAccent: true },
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
          className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-leaf opacity-20 blur-3xl"
        />
        <div aria-hidden className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-ia opacity-20 blur-3xl" />

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

          {/* Gros bouton "descendre" plutôt qu'un bandeau qui défile tout
              seul : la page d'accueil est longue par choix (articles,
              boutiques...), ce bouton donne juste un point de départ clair. */}
          <a
            href="#articles"
            className="mt-14 flex w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-paper/30 py-4 text-sm text-paper/70 transition-colors hover:border-paper hover:text-paper sm:w-auto sm:px-10"
          >
            Découvrir la marketplace <ArrowDown size={16} />
          </a>
        </div>
      </section>

      {/* Les articles juste après : c'est ce que les gens viennent voir */}
      <section id="articles" className="px-6 py-10 md:px-12">
        <ArticlesFeed produits={produits} />
      </section>

      {/* Boutiques, façon profils : logo en rond, nom, un aperçu — on clique
          et on entre dans la boutique */}
      <section id="boutiques" className="px-6 py-16 md:px-12">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-accent" />
          <h2 className="font-display text-2xl">Boutiques</h2>
        </div>

        {boutiques.length === 0 ? (
          <p className="mt-6 text-muted">
            Aucune boutique pour le moment. Soyez le premier à en ouvrir une.
          </p>
        ) : (
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {boutiques.map((b) => (
              <li key={b.slug}>
                <Link
                  href={`/boutique/${b.slug}`}
                  className="group flex h-full flex-col items-center gap-3 border border-line p-6 text-center transition-colors hover:border-ink"
                  style={b.couleurAccent ? { "--accent": b.couleurAccent } : undefined}
                >
                  {b.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.logoUrl}
                      alt={b.nom}
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-accent/30"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-light text-accent-dark">
                      <Store size={22} strokeWidth={1.5} />
                    </div>
                  )}
                  <h3 className="font-display text-lg group-hover:underline">{b.nom}</h3>
                  {b.description && <p className="line-clamp-2 text-sm text-muted">{b.description}</p>}
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
