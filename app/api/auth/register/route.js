import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashMotDePasse, creerToken } from "@/lib/auth";

export async function POST(request) {
  const { email, motDePasse, nom } = await request.json();

  if (!email || !motDePasse || !nom) {
    return NextResponse.json(
      { erreur: "Email, mot de passe et nom sont requis." },
      { status: 400 }
    );
  }

  const existant = await prisma.user.findUnique({ where: { email } });
  if (existant) {
    return NextResponse.json(
      { erreur: "Un compte existe déjà avec cet email." },
      { status: 409 }
    );
  }

  const motDePasseHash = await hashMotDePasse(motDePasse);

  const user = await prisma.user.create({
    data: { email, nom, motDePasse: motDePasseHash },
  });

  const token = creerToken({ id: user.id, role: user.role });

  return NextResponse.json({
    token,
    user: { id: user.id, nom: user.nom, email: user.email, role: user.role },
  });
}
