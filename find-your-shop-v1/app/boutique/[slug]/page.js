import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BoutiqueClient from "./BoutiqueClient";

export default async function PageBoutique({ params }) {
  const boutique = await prisma.boutique.findUnique({
    where: { slug: params.slug, actif: true },
    include: { produits: { where: { actif: true } } },
  });

  if (!boutique) notFound();

  return (
    <main className="min-h-screen px-6 py-12 md:px-12">
      <BoutiqueClient boutique={boutique} />
    </main>
  );
}
