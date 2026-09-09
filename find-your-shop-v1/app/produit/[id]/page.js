import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProduitClient from "./ProduitClient";

async function getProduit(id) {
  return prisma.produit.findUnique({
    where: { id },
    include: {
      boutique: {
        select: { id: true, nom: true, slug: true, logoUrl: true, couleurAccent: true, actif: true },
      },
    },
  });
}

export async function generateMetadata({ params }) {
  const produit = await getProduit(params.id);
  if (!produit || !produit.actif || !produit.boutique.actif) {
    return { title: "Produit introuvable — Find Your Shop" };
  }
  const description = produit.description
    ? produit.description.slice(0, 155)
    : `${produit.nom} — vendu par ${produit.boutique.nom} sur Find Your Shop.`;

  return {
    title: `${produit.nom} — ${produit.boutique.nom} | Find Your Shop`,
    description,
    openGraph: {
      title: produit.nom,
      description,
      images: produit.imageUrl ? [produit.imageUrl] : undefined,
    },
  };
}

export default async function PageProduit({ params }) {
  const produit = await getProduit(params.id);

  if (!produit || !produit.actif || !produit.boutique.actif) notFound();

  // Autres articles de la même boutique, pour donner envie de continuer à
  // parcourir sans revenir en arrière — exclut le produit courant.
  const autresProduits = await prisma.produit.findMany({
    where: { boutiqueId: produit.boutiqueId, actif: true, id: { not: produit.id } },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <main className="min-h-screen px-6 py-10 md:px-12">
      <ProduitClient produit={produit} autresProduits={autresProduits} />
    </main>
  );
}
