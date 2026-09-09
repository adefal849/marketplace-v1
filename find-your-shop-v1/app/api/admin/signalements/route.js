import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/adminAuth";

export async function GET(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ erreur: "Accès réservé aux administrateurs." }, { status: 403 });
  }

  const signalements = await prisma.signalement.findMany({
    include: { boutique: { select: { nom: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ signalements });
}

export async function PATCH(request) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ erreur: "Accès réservé aux administrateurs." }, { status: 403 });
  }

  const { id, statut } = await request.json();
  if (!id || !["NOUVEAU", "TRAITE"].includes(statut)) {
    return NextResponse.json({ erreur: "Paramètres invalides." }, { status: 400 });
  }

  const signalement = await prisma.signalement.update({ where: { id }, data: { statut } });
  return NextResponse.json({ signalement });
}
