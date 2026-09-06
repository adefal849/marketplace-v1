import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// Public : fiche produit. Pas d'authentification requise, mais on ne
// renvoie que les produits actifs d'une boutique active (mêmes règles
// que /api/produits et que la page boutique publique).
export async function GET(request, { params }) {
  const produit = await prisma.produit.findUnique({
    where: { id: params.id },
    include: {
      boutique: {
        select: { nom: true, slug: true, logoUrl: true, couleurAccent: true, actif: true },
      },
    },
  });

  if (!produit || !produit.actif || !produit.boutique.actif) {
    return NextResponse.json({ erreur: "Produit introuvable." }, { status: 404 });
  }

  return NextResponse.json({ produit });
}

export async function DELETE(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  const produit = await prisma.produit.findUnique({
    where: { id: params.id },
    include: { boutique: true },
  });

  if (!produit || produit.boutique.vendeurId !== user.id) {
    return NextResponse.json({ erreur: "Produit introuvable." }, { status: 404 });
  }

  await prisma.produit.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
