import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PageBoutique({ params }) {
  const boutique = await prisma.boutique.findUnique({
    where: { slug: params.slug, actif: true },
    include: { produits: { where: { actif: true } } },
  });

  if (!boutique) notFound();

  return (
    <main className="min-h-screen px-6 py-12 md:px-12">
      <header className="border-b border-line pb-8">
        <h1 className="font-display text-4xl">{boutique.nom}</h1>
        {boutique.description && (
          <p className="mt-2 max-w-xl text-muted">{boutique.description}</p>
        )}
      </header>

      <section className="mt-10">
        {boutique.produits.length === 0 ? (
          <p className="text-muted">Cette boutique n'a pas encore de produits.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3 md:grid-cols-4">
            {boutique.produits.map((p) => (
              <li key={p.id} className="flex flex-col bg-paper p-4">
                <div className="aspect-square w-full bg-line" />
                <h3 className="mt-3 text-sm">{p.nom}</h3>
                <p className="mt-1 font-display">{p.prix} FCFA</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
