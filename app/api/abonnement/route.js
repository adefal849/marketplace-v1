import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { initierPaiementCinetPay } from "@/lib/cinetpay";
import { trouverPlan } from "@/lib/plans";

// Renvoie l'abonnement actif du vendeur connecté (ou null = plan Gratuit)
export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  const abonnement = await prisma.abonnement.findFirst({
    where: {
      userId: user.id,
      statut: "ACTIF",
      OR: [{ dateFin: null }, { dateFin: { gt: new Date() } }],
    },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ abonnement });
}

// Démarre le paiement d'un plan payant (PRO ou BUSINESS) et renvoie
// l'URL de paiement CinetPay vers laquelle rediriger le vendeur.
export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  const { planCode } = await request.json();
  const planCatalogue = trouverPlan(planCode);
  if (!planCatalogue || planCatalogue.prix === 0) {
    return NextResponse.json({ erreur: "Plan invalide." }, { status: 400 });
  }

  if (!process.env.CINETPAY_APIKEY || !process.env.CINETPAY_SITE_ID) {
    return NextResponse.json(
      { erreur: "Paiement non configuré (CINETPAY_APIKEY / CINETPAY_SITE_ID manquants)." },
      { status: 503 }
    );
  }

  // S'assure que le plan existe en base (créé au besoin depuis le catalogue)
  const plan = await prisma.plan.upsert({
    where: { code: planCatalogue.code },
    update: {
      nom: planCatalogue.nom,
      prix: planCatalogue.prix,
      assistantIA: planCatalogue.assistantIA,
      statsAvancees: planCatalogue.statsAvancees,
      badgePremium: planCatalogue.badgePremium,
    },
    create: planCatalogue,
  });

  const utilisateur = await prisma.user.findUnique({ where: { id: user.id } });
  const transactionId = `ABO-${user.id}-${Date.now()}`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  await prisma.abonnement.create({
    data: { userId: user.id, planId: plan.id, statut: "EN_ATTENTE", transactionId },
  });

  const reponse = await initierPaiementCinetPay({
    transactionId,
    montant: plan.prix,
    description: `Abonnement ${plan.nom} - Find Your Shop`,
    notifyUrl: `${baseUrl}/api/abonnement/notify`,
    returnUrl: `${baseUrl}/dashboard/abonnement`,
    client: { nom: utilisateur?.nom, email: utilisateur?.email, pays: utilisateur?.pays },
  });

  if (reponse.code !== "201" || !reponse.data?.payment_url) {
    await prisma.abonnement.update({
      where: { transactionId },
      data: { statut: "ANNULE" },
    });
    return NextResponse.json(
      { erreur: "Impossible d'initier le paiement.", detail: reponse.message },
      { status: 502 }
    );
  }

  return NextResponse.json({ urlPaiement: reponse.data.payment_url });
}
