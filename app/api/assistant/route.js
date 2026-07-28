import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Assistant IA de la boutique : répond aux questions des clients sur les
// produits et rassure sur la qualité, à partir des vraies infos produit
// (nom, prix, stock, description) — jamais d'invention de garanties ou
// de détails qui ne sont pas dans la fiche produit.
export async function POST(request) {
  const { slug, messages } = await request.json();

  if (!slug || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { erreur: "Assistant non configuré (GROQ_API_KEY manquante)." },
      { status: 503 }
    );
  }

  const boutique = await prisma.boutique.findUnique({
    where: { slug, actif: true },
    include: { produits: { where: { actif: true } } },
  });

  if (!boutique) {
    return NextResponse.json({ erreur: "Boutique introuvable." }, { status: 404 });
  }

  const catalogue = boutique.produits
    .slice(0, 30)
    .map((p) => {
      const desc = p.description ? p.description.slice(0, 150) : "";
      return `- ${p.nom} | ${p.prix} FCFA | stock: ${p.stock > 0 ? p.stock : "épuisé"}${desc ? ` | ${desc}` : ""}`;
    })
    .join("\n");

  const systemPrompt = `Tu es l'assistant de vente de la boutique en ligne "${boutique.nom}".
${boutique.description ? `Description de la boutique : ${boutique.description}` : ""}

Catalogue actuel (seule source valable pour prix/stock/caractéristiques) :
${catalogue || "Aucun produit en ligne pour le moment."}

Règles :
- Réponds en français, ton chaleureux et direct, réponses courtes (3-4 phrases max).
- Aide le client à choisir, réponds à ses questions sur les produits listés ci-dessus uniquement.
- Rassure sur la qualité en restant honnête : ne promets jamais une garantie, un délai de livraison
  ou une caractéristique qui n'est pas indiquée dans le catalogue. Si tu ne sais pas, dis-le et
  invite le client à contacter le vendeur.
- N'invente jamais de produit, prix ou stock. Si un produit demandé n'est pas dans le catalogue,
  dis-le clairement.
- Tu ne donnes aucune information sur d'autres boutiques que celle-ci.`;

  const conversation = messages.slice(-10).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content || "").slice(0, 1000),
  }));

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [{ role: "system", content: systemPrompt }, ...conversation],
        max_completion_tokens: 400,
        temperature: 0.5,
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { erreur: "L'assistant est momentanément indisponible." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const reponse = data.choices?.[0]?.message?.content?.trim();

    if (!reponse) {
      return NextResponse.json(
        { erreur: "L'assistant n'a pas pu répondre." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reponse });
  } catch {
    return NextResponse.json(
      { erreur: "Impossible de contacter l'assistant." },
      { status: 502 }
    );
  }
}
