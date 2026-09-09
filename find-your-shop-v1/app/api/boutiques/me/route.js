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

  const { id, nom, logoUrl, bannerUrl, description, apropos, couleurAccent, latitude, longitude } = await request.json();
  if (!id) {
    return NextResponse.json({ erreur: "id requis." }, { status: 400 });
  }
  if (nom !== undefined && !nom.trim()) {
    return NextResponse.json({ erreur: "Le nom ne peut pas être vide." }, { status: 400 });
  }
  // Couleur hex simple, ex: #2563eb ou #fff — évite d'enregistrer n'importe
  // quelle chaîne dans un champ qui finit injecté en style CSS.
  if (couleurAccent !== undefined && couleurAccent !== null && !/^#[0-9a-fA-F]{3,8}$/.test(couleurAccent)) {
    return NextResponse.json({ erreur: "Couleur invalide." }, { status: 400 });
  }
  if (latitude !== undefined && latitude !== null && (typeof latitude !== "number" || latitude < -90 || latitude > 90)) {
    return NextResponse.json({ erreur: "Latitude invalide." }, { status: 400 });
  }
  if (longitude !== undefined && longitude !== null && (typeof longitude !== "number" || longitude < -180 || longitude > 180)) {
    return NextResponse.json({ erreur: "Longitude invalide." }, { status: 400 });
  }

  const appartient = await prisma.boutique.findFirst({ where: { id, vendeurId: user.id } });
  if (!appartient) {
    return NextResponse.json({ erreur: "Boutique introuvable." }, { status: 404 });
  }

  const boutique = await prisma.boutique.update({
    where: { id },
    data: {
      ...(nom !== undefined ? { nom: nom.trim() } : {}),
      ...(logoUrl !== undefined ? { logoUrl } : {}),
      ...(bannerUrl !== undefined ? { bannerUrl } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(apropos !== undefined ? { apropos: apropos ? String(apropos).slice(0, 2000) : null } : {}),
      ...(couleurAccent !== undefined ? { couleurAccent } : {}),
      ...(latitude !== undefined ? { latitude } : {}),
      ...(longitude !== undefined ? { longitude } : {}),
    },
  });

  return NextResponse.json({ boutique });
}
