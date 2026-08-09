import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const QUATORZE_JOURS_MS = 14 * 24 * 60 * 60 * 1000;

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  const boutiques = await prisma.boutique.findMany({ where: { vendeurId: user.id } });
  if (boutiques.length === 0) {
    return NextResponse.json({ erreur: "Aucune boutique." }, { status: 404 });
  }

  const commandes = await prisma.commande.findMany({
    where: { boutiqueId: { in: boutiques.map((b) => b.id) }, statut: { not: "ANNULEE" } },
    include: { lignes: { include: { produit: { select: { nom: true } } } } },
    orderBy: { createdAt: "asc" },
  });

  const chiffreAffaires = commandes.reduce((s, c) => s + c.total, 0);
  const nombreCommandes = commandes.length;
  const panierMoyen = nombreCommandes > 0 ? Math.round(chiffreAffaires / nombreCommandes) : 0;

  // Qui achète : total dépensé par client
  const parClient = new Map();
  for (const c of commandes) {
    const cle = c.clientEmail;
    const existant = parClient.get(cle) || { nom: c.clientNom, total: 0, commandes: 0 };
    existant.total += c.total;
    existant.commandes += 1;
    parClient.set(cle, existant);
  }
  const topClients = [...parClient.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)
    .map(([email, v]) => ({ email, ...v }));

  // Quoi : quantités vendues par produit
  const parProduit = new Map();
  for (const c of commandes) {
    for (const l of c.lignes) {
      const nom = l.produit?.nom || "Produit supprimé";
      const existant = parProduit.get(nom) || { quantite: 0, revenu: 0 };
      existant.quantite += l.quantite;
      existant.revenu += l.quantite * l.prixUnitaire;
      parProduit.set(nom, existant);
    }
  }
  const topProduits = [...parProduit.entries()]
    .sort((a, b) => b[1].revenu - a[1].revenu)
    .slice(0, 5)
    .map(([nom, v]) => ({ nom, ...v }));

  // Combien tu gagnes : tendance sur 14 jours
  const seuil = new Date(Date.now() - QUATORZE_JOURS_MS);
  const parJour = new Map();
  for (let i = 13; i >= 0; i--) {
    const jour = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    parJour.set(jour, 0);
  }
  for (const c of commandes) {
    if (c.createdAt < seuil) continue;
    const jour = c.createdAt.toISOString().slice(0, 10);
    if (parJour.has(jour)) parJour.set(jour, parJour.get(jour) + c.total);
  }
  const tendance14Jours = [...parJour.entries()].map(([jour, total]) => ({ jour, total }));

  return NextResponse.json({
    chiffreAffaires,
    nombreCommandes,
    panierMoyen,
    topClients,
    topProduits,
    tendance14Jours,
  });
}
