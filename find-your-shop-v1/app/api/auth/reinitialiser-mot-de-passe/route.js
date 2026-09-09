import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashMotDePasse } from "@/lib/auth";

export async function POST(request) {
  const { token, motDePasse } = await request.json();

  if (!token || !motDePasse || motDePasse.length < 6) {
    return NextResponse.json(
      { erreur: "Le mot de passe doit contenir au moins 6 caractères." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { resetToken: token } });

  if (!user || !user.resetTokenExpire || user.resetTokenExpire < new Date()) {
    return NextResponse.json(
      { erreur: "Ce lien est invalide ou a expiré. Refaites une demande." },
      { status: 400 }
    );
  }

  const motDePasseHash = await hashMotDePasse(motDePasse);

  await prisma.user.update({
    where: { id: user.id },
    data: { motDePasse: motDePasseHash, resetToken: null, resetTokenExpire: null },
  });

  return NextResponse.json({ message: "Mot de passe mis à jour." });
}
