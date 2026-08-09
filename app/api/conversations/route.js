import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// Le client crée (ou reprend) une conversation avec une boutique.
// Une seule conversation par (boutique, email client) : les visites
// suivantes reprennent le même fil au lieu d'en ouvrir un nouveau.
export async function POST(request) {
  const { slug, clientNom, clientEmail, message } = await request.json();

  if (!slug || !clientNom || !clientEmail || !message?.trim()) {
    return NextResponse.json({ erreur: "Champs requis manquants." }, { status: 400 });
  }

  const boutique = await prisma.boutique.findUnique({ where: { slug, actif: true } });
  if (!boutique) {
    return NextResponse.json({ erreur: "Boutique introuvable." }, { status: 404 });
  }

  let conversation = await prisma.conversation.findFirst({
    where: { boutiqueId: boutique.id, clientEmail },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { boutiqueId: boutique.id, clientNom, clientEmail },
    });
  }

  await prisma.message.create({
    data: { conversationId: conversation.id, auteur: "CLIENT", contenu: message.trim() },
  });
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ conversationId: conversation.id });
}

// Le vendeur liste les conversations de toutes ses boutiques, plus
// récentes d'abord — une seule boîte de réception pour tout le compte.
export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  const boutiques = await prisma.boutique.findMany({
    where: { vendeurId: user.id },
    select: { id: true, nom: true },
  });
  if (boutiques.length === 0) {
    return NextResponse.json({ conversations: [] });
  }
  const nomParBoutique = new Map(boutiques.map((b) => [b.id, b.nom]));

  const conversations = await prisma.conversation.findMany({
    where: { boutiqueId: { in: boutiques.map((b) => b.id) } },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: { where: { auteur: "CLIENT", lu: false } } } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    conversations: conversations.map((c) => ({
      id: c.id,
      clientNom: c.clientNom,
      clientEmail: c.clientEmail,
      boutiqueNom: nomParBoutique.get(c.boutiqueId) || "",
      dernierMessage: c.messages[0]?.contenu || "",
      nonLus: c._count.messages,
      updatedAt: c.updatedAt,
    })),
  });
}
