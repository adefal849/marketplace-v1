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

export async function PATCH(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  const { logoUrl, description } = await request.json();

  const boutique = await prisma.boutique.update({
    where: { vendeurId: user.id },
    data: {
      ...(logoUrl !== undefined ? { logoUrl } : {}),
      ...(description !== undefined ? { description } : {}),
    },
  });

  return NextResponse.json({ boutique });
}
