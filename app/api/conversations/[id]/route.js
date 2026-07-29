import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// Renvoie le vendeur si le token appartient bien au propriétaire de la
// boutique de cette conversation, sinon null (donc traité comme client).
async function trouverVendeurProprietaire(request, conversation) {
  const user = getUserFromRequest(request);
  if (!user) return null;
  const boutique = await prisma.boutique.findUnique({ where: { vendeurId: user.id } });
  return boutique && boutique.id === conversation.boutiqueId ? user : null;
}

export async function GET(request, { params }) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conversation) {
    return NextResponse.json({ erreur: "Conversation introuvable." }, { status: 404 });
  }

  // Si c'est le vendeur qui consulte, on marque les messages client comme lus.
  const vendeur = await trouverVendeurProprietaire(request, conversation);
  if (vendeur) {
    await prisma.message.updateMany({
      where: { conversationId: conversation.id, auteur: "CLIENT", lu: false },
      data: { lu: true },
    });
  }

  return NextResponse.json({
    clientNom: conversation.clientNom,
    messages: conversation.messages.map((m) => ({
      id: m.id,
      auteur: m.auteur,
      contenu: m.contenu,
      createdAt: m.createdAt,
    })),
  });
}

export async function POST(request, { params }) {
  const { contenu } = await request.json();
  if (!contenu?.trim()) {
    return NextResponse.json({ erreur: "Message vide." }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({ where: { id: params.id } });
  if (!conversation) {
    return NextResponse.json({ erreur: "Conversation introuvable." }, { status: 404 });
  }

  // L'auteur est déduit du token, jamais du corps de la requête : un
  // client ne peut pas se faire passer pour le vendeur.
  const vendeur = await trouverVendeurProprietaire(request, conversation);
  const auteur = vendeur ? "VENDEUR" : "CLIENT";

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      auteur,
      contenu: contenu.trim(),
      lu: auteur === "VENDEUR",
    },
  });
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ message });
}
