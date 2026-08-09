import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// Ajouter un produit à SA propre boutique
export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  const boutique = await prisma.boutique.findUnique({
    where: { vendeurId: user.id },
  });
  if (!boutique) {
    return NextResponse.json(
      { erreur: "Créez d'abord votre boutique." },
      { status: 400 }
    );
  }

  const { nom, description, prix, stock, imageUrl, categorie } = await request.json();
  if (!nom || prix == null) {
    return NextResponse.json(
      { erreur: "Le nom et le prix sont requis." },
      { status: 400 }
    );
  }

  const produit = await prisma.produit.create({
    data: {
      nom,
      description,
      prix,
      stock: stock ?? 0,
      imageUrl,
      categorie: categorie || null,
      boutiqueId: boutique.id,
    },
  });

  return NextResponse.json({ produit });
}

// Liste des produits d'une boutique via ?slug=ma-boutique
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ erreur: "slug requis." }, { status: 400 });
  }

  const boutique = await prisma.boutique.findUnique({
    where: { slug },
    include: { produits: { where: { actif: true } } },
  });

  if (!boutique) {
    return NextResponse.json({ erreur: "Boutique introuvable." }, { status: 404 });
  }

  return NextResponse.json({ boutique });
}
