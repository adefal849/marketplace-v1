import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashMotDePasse } from "@/lib/auth";

export async function POST(request) {
  const { token, nouveauMotDePasse } = await request.json();

  if (!token || !nouveauMotDePasse) {
    return NextResponse.json({ erreur: "Données manquantes." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { resetToken: token } });

  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return NextResponse.json(
      { erreur: "Ce lien est invalide ou a expiré. Refaites une demande." },
      { status: 400 }
    );
  }

  const motDePasseHash = await hashMotDePasse(nouveauMotDePasse);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      motDePasse: motDePasseHash,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return NextResponse.json({ message: "Mot de passe mis à jour." });
}
