import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// Passer une commande — endpoint public : le client n'a pas de compte.
// Un panier peut contenir des produits de plusieurs boutiques : on crée
// une Commande distincte par boutique (le modèle Commande n'a qu'une
// seule boutiqueId), avec vérification + décrément atomique du stock.
export async function POST(request) {
  const { clientNom, clientEmail, clientTel, articles } = await request.json();

  if (
    !clientNom ||
    !clientEmail ||
    !Array.isArray(articles) ||
    articles.length === 0
  ) {
    return NextResponse.json(
      { erreur: "Nom, email et au moins un article sont requis." },
      { status: 400 }
    );
  }

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_REGEX.test(clientEmail)) {
    return NextResponse.json(
      { erreur: "Adresse email invalide." },
      { status: 400 }
    );
  }

  const produitIds = [...new Set(articles.map((a) => a.produitId))];
  const produits = await prisma.produit.findMany({
    where: { id: { in: produitIds }, actif: true },
  });

  if (produits.length !== produitIds.length) {
    return NextResponse.json(
      { erreur: "Un ou plusieurs produits ne sont plus disponibles." },
      { status: 400 }
    );
  }

  // Regrouper les lignes par boutique + vérification de stock (pré-contrôle,
  // le contrôle définitif se fait de façon atomique dans la transaction)
  const parBoutique = new Map();
  for (const article of articles) {
    const produit = produits.find((p) => p.id === article.produitId);
    const quantite = Math.floor(Number(article.quantite));
    if (!produit || !quantite || quantite < 1) continue;

    if (quantite > produit.stock) {
      return NextResponse.json(
        {
          erreur: `Stock insuffisant pour "${produit.nom}" (disponible : ${produit.stock}).`,
        },
        { status: 409 }
      );
    }

    if (!parBoutique.has(produit.boutiqueId)) parBoutique.set(produit.boutiqueId, []);
    parBoutique.get(produit.boutiqueId).push({ produit, quantite });
  }

  if (parBoutique.size === 0) {
    return NextResponse.json({ erreur: "Panier vide ou invalide." }, { status: 400 });
  }

  try {
    const commandes = await prisma.$transaction(async (tx) => {
      const resultats = [];

      for (const [boutiqueId, lignesBoutique] of parBoutique) {
        // Décrémente le stock de façon atomique : échoue si le stock a
        // changé entre-temps (commande concurrente), plutôt qu'un simple
        // update qui pourrait passer en négatif.
        for (const l of lignesBoutique) {
          const maj = await tx.produit.updateMany({
            where: { id: l.produit.id, stock: { gte: l.quantite } },
            data: { stock: { decrement: l.quantite } },
          });
          if (maj.count === 0) {
            throw new Error(`STOCK:${l.produit.nom}`);
          }
        }

        const total = lignesBoutique.reduce(
          (somme, l) => somme + l.produit.prix * l.quantite,
          0
        );

        const commande = await tx.commande.create({
          data: {
            clientNom,
            clientEmail,
            clientTel,
            total,
            boutiqueId,
            lignes: {
              create: lignesBoutique.map((l) => ({
                quantite: l.quantite,
                prixUnitaire: l.produit.prix,
                produitId: l.produit.id,
              })),
            },
          },
          include: { boutique: { select: { nom: true } } },
        });

        resultats.push({
          id: commande.id,
          boutiqueNom: commande.boutique.nom,
          total: commande.total,
        });
      }

      return resultats;
    });

    return NextResponse.json({ commandes });
  } catch (e) {
    if (typeof e.message === "string" && e.message.startsWith("STOCK:")) {
      return NextResponse.json(
        { erreur: `Stock insuffisant pour "${e.message.slice(6)}". Réessayez.` },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { erreur: "Impossible de créer la commande. Réessayez." },
      { status: 500 }
    );
  }
}

// Lister les commandes de SA boutique (vendeur connecté) — utilisé par
// le dashboard.
export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  const boutique = await prisma.boutique.findUnique({
    where: { vendeurId: user.id },
  });

  if (!boutique) {
    return NextResponse.json({ commandes: [] });
  }

  const commandes = await prisma.commande.findMany({
    where: { boutiqueId: boutique.id },
    include: { lignes: { include: { produit: { select: { nom: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ commandes });
}
