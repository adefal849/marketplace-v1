import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { CATEGORIES } from "@/app/categories";

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
  if (!nom || !nom.trim() || prix == null) {
    return NextResponse.json(
      { erreur: "Le nom et le prix sont requis." },
      { status: 400 }
    );
  }

  const prixNombre = Number(prix);
  if (!Number.isFinite(prixNombre) || prixNombre < 0) {
    return NextResponse.json({ erreur: "Le prix doit être un nombre positif." }, { status: 400 });
  }

  const stockNombre = Number.isFinite(Number(stock)) ? Math.max(0, Math.floor(Number(stock))) : 0;

  if (categorie && !CATEGORIES.some((c) => c.valeur === categorie)) {
    return NextResponse.json({ erreur: "Catégorie invalide." }, { status: 400 });
  }

  const produit = await prisma.produit.create({
    data: {
      nom: nom.trim().slice(0, 120),
      description: description ? String(description).slice(0, 2000) : null,
      prix: Math.round(prixNombre),
      stock: stockNombre,
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
