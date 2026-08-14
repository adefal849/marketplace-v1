import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

const SYSTEM_PROMPT = `Tu es l'assistant du tableau de bord vendeur de Divine Harvest Store, une
marketplace africaine. Tu aides les vendeurs à : trouver des idées de produits à vendre,
rédiger des descriptions vendeuses, démarrer leur boutique, et donner des astuces concrètes
pour mieux vendre (prix, photos, catégories, relation client).
Réponds en français, de façon concrète et actionnable, en 4-6 phrases maximum ou une courte
liste à puces. N'invente jamais de fonctionnalité de la plateforme qui n'existe pas.`;

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

  const { messages } = await request.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ erreur: "Message requis." }, { status: 400 });
  }

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
        model: "openai/gpt-oss-120b",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...conversation],
        max_completion_tokens: 400,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ erreur: "Assistant momentanément indisponible." }, { status: 502 });
    }

    const data = await res.json();
    const reponse = data.choices?.[0]?.message?.content?.trim();
    if (!reponse) {
      return NextResponse.json({ erreur: "Pas de réponse, réessayez." }, { status: 502 });
    }

    return NextResponse.json({ reponse });
  } catch {
    return NextResponse.json({ erreur: "Échec de la connexion à l'assistant." }, { status: 502 });
  }
}
