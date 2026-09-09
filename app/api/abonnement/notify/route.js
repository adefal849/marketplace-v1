import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifierPaiementCinetPay } from "@/lib/cinetpay";

// CinetPay appelle cette URL après un paiement (notify_url), mais on ne lui
// fait jamais confiance directement : on revérifie le statut réel de la
// transaction auprès de CinetPay avant d'activer quoi que ce soit (voir la
// doc CinetPay "Lien de notification" — un notify peut être rejoué ou
// falsifié).
export async function POST(request) {
  let transactionId;
  try {
    const corps = await request.formData().catch(() => null);
    transactionId = corps?.get("cpm_trans_id") || (await request.json().catch(() => ({})))?.cpm_trans_id;
  } catch {
    // ignore, transactionId reste undefined et sera rejeté plus bas
  }

  if (!transactionId) {
    return NextResponse.json({ erreur: "transaction_id manquant." }, { status: 400 });
  }

  const abonnement = await prisma.abonnement.findUnique({
    where: { transactionId },
    include: { plan: true },
  });
  if (!abonnement) {
    return NextResponse.json({ erreur: "Abonnement introuvable." }, { status: 404 });
  }

  // Déjà traité (CinetPay peut renvoyer plusieurs fois le même notify) :
  // on répond OK sans repayer/réactiver pour éviter de prolonger la date
  // de fin à chaque appel.
  if (abonnement.statut === "ACTIF") {
    return NextResponse.json({ ok: true });
  }

  const verification = await verifierPaiementCinetPay(transactionId);
  const paiementReussi = verification?.data?.status === "ACCEPTED";

  if (!paiementReussi) {
    await prisma.abonnement.update({
      where: { transactionId },
      data: { statut: "ANNULE" },
    });
    return NextResponse.json({ ok: true, statut: "ANNULE" });
  }

  const dateFin = new Date();
  dateFin.setMonth(dateFin.getMonth() + 1);

  await prisma.abonnement.update({
    where: { transactionId },
    data: { statut: "ACTIF", dateFin },
  });

  return NextResponse.json({ ok: true, statut: "ACTIF" });
}
