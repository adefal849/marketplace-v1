import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashMotDePasse, creerToken } from "@/lib/auth";
import { limiterTaux, ipDepuisRequete } from "@/lib/rateLimit";

export async function POST(request) {
  const { email, motDePasse, nom, pays } = await request.json();

  const { autorise, attendreSec } = limiterTaux(`register:${ipDepuisRequete(request)}`, {
    max: 5,
    fenetreMs: 10 * 60_000,
  });
  if (!autorise) {
    return NextResponse.json(
      { erreur: `Trop d'inscriptions depuis cette connexion. Réessayez dans ${attendreSec}s.` },
      { status: 429 }
    );
  }

  if (!email || !motDePasse || !nom) {
    return NextResponse.json(
      { erreur: "Email, mot de passe et nom sont requis." },
      { status: 400 }
    );
  }

  if (motDePasse.length < 6) {
    return NextResponse.json(
      { erreur: "Le mot de passe doit contenir au moins 6 caractères." },
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
    data: { email, nom, motDePasse: motDePasseHash, pays: pays || null },
  });

  const token = creerToken({ id: user.id, role: user.role });

  return NextResponse.json({
    token,
    user: { id: user.id, nom: user.nom, email: user.email, role: user.role },
  });
}
