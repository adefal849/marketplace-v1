import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const STATUTS_VALIDES = [
  "EN_ATTENTE",
  "CONFIRMEE",
  "EXPEDIEE",
  "LIVREE",
  "ANNULEE",
];

// Changer le statut d'une commande — seul le vendeur propriétaire de la
// boutique concernée peut le faire.
export async function PATCH(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  const { statut } = await request.json();
  if (!STATUTS_VALIDES.includes(statut)) {
    return NextResponse.json({ erreur: "Statut invalide." }, { status: 400 });
  }

  const commande = await prisma.commande.findUnique({
    where: { id: params.id },
    include: { boutique: true },
  });

  if (!commande || commande.boutique.vendeurId !== user.id) {
    return NextResponse.json({ erreur: "Commande introuvable." }, { status: 404 });
  }

  const miseAJour = await prisma.commande.update({
    where: { id: params.id },
    data: { statut },
  });

  return NextResponse.json({ commande: miseAJour });
}
