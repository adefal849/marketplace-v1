import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { CATEGORIES } from "@/app/categories";

// Copilote IA du VENDEUR : aide à rédiger une fiche produit ou suggère des
// idées, à partir de son propre catalogue. À ne pas confondre avec
// /api/assistant, qui répond aux CLIENTS sur une boutique publique.
export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { erreur: "Assistant non configuré (GROQ_API_KEY manquante)." },
      { status: 503 }
    );
  }

  const { action, description } = await request.json();

  const boutique = await prisma.boutique.findUnique({
    where: { vendeurId: user.id },
    include: { produits: { select: { nom: true }, take: 20 } },
  });

  if (!boutique) {
    return NextResponse.json({ erreur: "Créez d'abord votre boutique." }, { status: 400 });
  }

  const categoriesValides = CATEGORIES.map((c) => c.valeur).join(", ");
  const catalogueActuel =
    boutique.produits.map((p) => p.nom).join(", ") || "aucun produit encore";

  let systemPrompt;
  let userPrompt;

  if (action === "fiche_produit") {
    if (!description || !description.trim()) {
      return NextResponse.json({ erreur: "Décrivez le produit à créer." }, { status: 400 });
    }
    systemPrompt = `Tu es un copilote qui aide un e-commerçant de la boutique "${boutique.nom}" à rédiger une fiche produit.
Catégories valides (utilise EXACTEMENT une de ces valeurs) : ${categoriesValides}
Réponds UNIQUEMENT en JSON valide, sans texte autour, sans balises markdown, au format exact :
{"nom": "...", "description": "...", "prix": 0, "categorie": "..."}
- "nom" : court et vendeur, 6 mots maximum
- "description" : 2 à 3 phrases, ton chaleureux, met en avant uniquement ce que le vendeur a décrit, sans inventer de caractéristique
- "prix" : nombre entier en FCFA ; si le vendeur a donné un prix reprends-le, sinon estime un prix raisonnable pour ce type de produit en Afrique de l'Ouest
- "categorie" : une valeur EXACTE de la liste ci-dessus, la plus pertinente`;
    userPrompt = description.slice(0, 500);
  } else if (action === "idee_produit") {
    systemPrompt = `Tu es un copilote e-commerce pour la boutique "${boutique.nom}"${
      boutique.description ? ` (${boutique.description})` : ""
    }.
Produits déjà en vente : ${catalogueActuel}
Propose 3 idées de nouveaux produits complémentaires, adaptés à une clientèle ouest-africaine.
Réponds UNIQUEMENT en JSON valide, sans texte autour, format exact :
{"idees": ["idée courte 1", "idée courte 2", "idée courte 3"]}
Chaque idée : 4 à 8 mots, concrète, pas de généralités.`;
    userPrompt = "Propose 3 idées.";
  } else {
    return NextResponse.json({ erreur: "Action inconnue." }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 400,
        temperature: 0.6,
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { erreur: "Assistant momentanément indisponible." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const brut = data.choices?.[0]?.message?.content?.trim();
    if (!brut) {
      return NextResponse.json({ erreur: "Réponse vide de l'assistant." }, { status: 502 });
    }

    let resultat;
    try {
      resultat = JSON.parse(brut.replace(/^```json\s*|\s*```$/g, ""));
    } catch {
      return NextResponse.json({ erreur: "Réponse invalide de l'assistant." }, { status: 502 });
    }

    if (action === "fiche_produit") {
      const categorieValide = CATEGORIES.some((c) => c.valeur === resultat.categorie);
      return NextResponse.json({
        fiche: {
          nom: String(resultat.nom || "").slice(0, 80),
          description: String(resultat.description || "").slice(0, 500),
          prix: Number.isFinite(resultat.prix) ? Math.max(0, Math.round(resultat.prix)) : "",
          categorie: categorieValide ? resultat.categorie : "",
        },
      });
    }

    return NextResponse.json({
      idees: Array.isArray(resultat.idees) ? resultat.idees.slice(0, 3) : [],
    });
  } catch {
    return NextResponse.json({ erreur: "Impossible de contacter l'assistant." }, { status: 502 });
  }
}
