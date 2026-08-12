import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import slugify from "slugify";

// Créer une boutique (jusqu'à 4 par vendeur)
export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  const { nom, description } = await request.json();
  if (!nom) {
    return NextResponse.json(
      { erreur: "Le nom de la boutique est requis." },
      { status: 400 }
    );
  }

  // Le compte admin peut ouvrir autant de boutiques qu'il veut, un vendeur
  // normal reste plafonné à 4.
  if (user.role !== "ADMIN") {
    const nombreBoutiques = await prisma.boutique.count({ where: { vendeurId: user.id } });
    if (nombreBoutiques >= 4) {
      return NextResponse.json(
        { erreur: "Maximum 4 boutiques par compte." },
        { status: 409 }
      );
    }
  }

  let slugBase = slugify(nom, { lower: true, strict: true });
  let slug = slugBase;
  let compteur = 1;
  // Évite les collisions de slug (ex: "mode" déjà pris -> "mode-2")
  while (await prisma.boutique.findUnique({ where: { slug } })) {
    slug = `${slugBase}-${++compteur}`;
  }

  const boutique = await prisma.boutique.create({
    data: { nom, description, slug, vendeurId: user.id },
  });

  return NextResponse.json({ boutique });
}

// Lister les boutiques actives (utilisé pour la page d'accueil)
export async function GET() {
  const boutiques = await prisma.boutique.findMany({
    where: { actif: true },
    select: { id: true, nom: true, slug: true, description: true, logoUrl: true },
  });
  return NextResponse.json({ boutiques });
}
