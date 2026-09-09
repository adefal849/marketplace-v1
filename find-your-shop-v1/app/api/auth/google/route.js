import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { hashMotDePasse, creerToken } from "@/lib/auth";

export async function POST(request) {
  const { credential } = await request.json();
  if (!credential) {
    return NextResponse.json({ erreur: "Jeton manquant." }, { status: 400 });
  }

  // Vérification du jeton directement auprès de Google : pas besoin de
  // librairie, l'endpoint tokeninfo fait le travail de validation de
  // signature et d'expiration à notre place.
  const verif = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
  if (!verif.ok) {
    return NextResponse.json({ erreur: "Jeton Google invalide." }, { status: 401 });
  }
  const infos = await verif.json();

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (clientId && infos.aud !== clientId) {
    return NextResponse.json({ erreur: "Jeton Google invalide." }, { status: 401 });
  }
  if (infos.email_verified !== "true" && infos.email_verified !== true) {
    return NextResponse.json({ erreur: "Email Google non vérifié." }, { status: 401 });
  }

  let user = await prisma.user.findUnique({ where: { email: infos.email } });

  if (!user) {
    // Mot de passe aléatoire jamais communiqué : ce compte ne se connecte
    // que via Google (l'utilisateur peut toujours faire "mot de passe
    // oublié" plus tard pour en définir un s'il le souhaite).
    const motDePasseAleatoire = crypto.randomBytes(32).toString("hex");
    user = await prisma.user.create({
      data: {
        email: infos.email,
        nom: infos.name || infos.email.split("@")[0],
        motDePasse: await hashMotDePasse(motDePasseAleatoire),
      },
    });
  }

  const token = creerToken({ id: user.id, role: user.role });

  return NextResponse.json({
    token,
    user: { id: user.id, nom: user.nom, email: user.email, role: user.role },
  });
}
