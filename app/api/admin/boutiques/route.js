import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/adminAuth";

export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ erreur: "Accès réservé aux administrateurs." }, { status: 403 });
  }

  const boutiques = await prisma.boutique.findMany({
    include: {
      vendeur: { select: { nom: true, email: true } },
      _count: { select: { produits: true, signalements: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ boutiques });
}

// Active/suspend une boutique
export async function PATCH(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ erreur: "Accès réservé aux administrateurs." }, { status: 403 });
  }

  const { id, actif } = await request.json();
  if (!id || typeof actif !== "boolean") {
    return NextResponse.json({ erreur: "Paramètres invalides." }, { status: 400 });
  }

  const boutique = await prisma.boutique.update({ where: { id }, data: { actif } });
  return NextResponse.json({ boutique });
}
