import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

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
