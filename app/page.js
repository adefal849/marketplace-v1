import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Accueil() {
  const boutiques = await prisma.boutique.findMany({
    where: { actif: true },
    select: { nom: true, slug: true, description: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen">
      <header className="flex items-center justify-between border-b border-line px-6 py-5 md:px-12">
        <span className="font-display text-lg tracking-tight">Marketplace</span>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/connexion" className="hover:underline">
            Connexion vendeur
          </Link>
          <Link
            href="/inscription"
            className="border border-ink px-4 py-2 hover:bg-ink hover:text-paper transition-colors"
          >
            Créer ma boutique
          </Link>
        </nav>
      </header>

      <section className="px-6 py-20 md:px-12 md:py-32">
        <h1 className="max-w-3xl font-display text-4xl leading-tight md:text-6xl">
          Chaque boutique a une adresse. Chaque vente vous appartient.
        </h1>
        <p className="mt-6 max-w-xl text-muted">
          Ouvrez votre boutique en ligne en quelques minutes. Ajoutez vos produits,
          recevez vos commandes, gardez le contrôle.
        </p>
      </section>

      <section className="border-t border-line px-6 py-16 md:px-12">
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
