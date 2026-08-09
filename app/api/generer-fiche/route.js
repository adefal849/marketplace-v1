import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { CATEGORIES } from "@/app/categories";

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { erreur: "Générateur non configuré (GROQ_API_KEY manquante)." },
      { status: 503 }
    );
  }

  const { description } = await request.json();
  if (!description?.trim()) {
    return NextResponse.json({ erreur: "Décrivez le produit d'abord." }, { status: 400 });
  }

  const listeCategories = CATEGORIES.map((c) => c.valeur).join(", ");

  const systemPrompt = `Tu rédiges des fiches produit pour une marketplace africaine. À partir de la
description libre du vendeur, réponds UNIQUEMENT avec un objet JSON valide, sans texte autour,
au format exact :
{"nom": "...", "description": "...", "categorie": "..."}
Règles :
- "nom" : court, vendeur, 6 mots maximum.
- "description" : 2-3 phrases, en français, qui donne envie d'acheter sans exagérer ni inventer
  de caractéristiques que le vendeur n'a pas mentionnées.
- "categorie" : une valeur EXACTE parmi celles-ci : ${listeCategories}. Choisis la plus proche,
  jamais une valeur en dehors de cette liste.`;

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
          { role: "user", content: description.trim().slice(0, 500) },
        ],
        max_completion_tokens: 300,
        temperature: 0.6,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ erreur: "Le générateur est momentanément indisponible." }, { status: 502 });
    }

    const data = await res.json();
    const brut = data.choices?.[0]?.message?.content;
    const fiche = JSON.parse(brut);

    if (!fiche.nom || !fiche.description) {
      return NextResponse.json({ erreur: "Réponse invalide, réessayez." }, { status: 502 });
    }

    const categorieValide = CATEGORIES.some((c) => c.valeur === fiche.categorie);

    return NextResponse.json({
      nom: fiche.nom,
      description: fiche.description,
      categorie: categorieValide ? fiche.categorie : null,
    });
  } catch {
    return NextResponse.json({ erreur: "Échec de la génération, réessayez." }, { status: 502 });
  }
}
