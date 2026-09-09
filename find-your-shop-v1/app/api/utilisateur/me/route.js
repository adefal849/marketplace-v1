import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  const utilisateur = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, nom: true, email: true },
  });

  return NextResponse.json({ utilisateur });
}

export async function PATCH(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  const { nom } = await request.json();
  if (!nom) {
    return NextResponse.json({ erreur: "Le nom est requis." }, { status: 400 });
  }

  const utilisateur = await prisma.user.update({
    where: { id: user.id },
    data: { nom },
    select: { id: true, nom: true, email: true },
  });

  return NextResponse.json({ utilisateur });
}
