import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifierMotDePasse, creerToken } from "@/lib/auth";

export async function POST(request) {
  const { email, motDePasse } = await request.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { erreur: "Email ou mot de passe incorrect." },
      { status: 401 }
    );
  }

  const valide = await verifierMotDePasse(motDePasse, user.motDePasse);
  if (!valide) {
    return NextResponse.json(
      { erreur: "Email ou mot de passe incorrect." },
      { status: 401 }
    );
  }

  const token = creerToken({ id: user.id, role: user.role });

  return NextResponse.json({
    token,
    user: { id: user.id, nom: user.nom, email: user.email, role: user.role },
  });
}
