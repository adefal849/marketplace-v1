import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// Sans ?id= : liste toutes les boutiques du vendeur (jusqu'à 4).
// Avec ?id= : une boutique précise, avec ses produits (vérifie qu'elle
// appartient bien au vendeur avant de la renvoyer).
export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const boutique = await prisma.boutique.findFirst({
      where: { id, vendeurId: user.id },
      include: { produits: true },
    });
    if (!boutique) {
      return NextResponse.json({ erreur: "Boutique introuvable." }, { status: 404 });
    }
    return NextResponse.json({ boutique });
  }

  const boutiques = await prisma.boutique.findMany({
    where: { vendeurId: user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ boutiques });
}

export async function PATCH(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  const { id, logoUrl, description } = await request.json();
  if (!id) {
    return NextResponse.json({ erreur: "id requis." }, { status: 400 });
  }

  const appartient = await prisma.boutique.findFirst({ where: { id, vendeurId: user.id } });
  if (!appartient) {
    return NextResponse.json({ erreur: "Boutique introuvable." }, { status: 404 });
  }

  const boutique = await prisma.boutique.update({
    where: { id },
    data: {
      ...(logoUrl !== undefined ? { logoUrl } : {}),
      ...(description !== undefined ? { description } : {}),
    },
  });

  return NextResponse.json({ boutique });
}
