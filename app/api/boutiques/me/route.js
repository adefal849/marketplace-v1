import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  const boutique = await prisma.boutique.findUnique({
    where: { vendeurId: user.id },
    include: { produits: true },
  });

  return NextResponse.json({ boutique });
}
