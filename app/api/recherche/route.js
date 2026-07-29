import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Recherche publique simple : par mot-clé (nom produit/boutique) et/ou
// par catégorie. Pas de moteur de recherche externe, juste Prisma —
// largement suffisant pour le volume actuel.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const categorie = searchParams.get("categorie") || undefined;

  if (!q && !categorie) {
    return NextResponse.json({ produits: [], boutiques: [] });
  }

  const produits = await prisma.produit.findMany({
    where: {
      actif: true,
      boutique: { actif: true },
      ...(categorie ? { categorie } : {}),
      ...(q ? { nom: { contains: q, mode: "insensitive" } } : {}),
    },
    include: { boutique: { select: { nom: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  const boutiques = q
    ? await prisma.boutique.findMany({
        where: { actif: true, nom: { contains: q, mode: "insensitive" } },
        select: { nom: true, slug: true, description: true },
        take: 12,
      })
    : [];

  return NextResponse.json({ produits, boutiques });
}
