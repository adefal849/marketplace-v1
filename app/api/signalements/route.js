import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { limiterTaux, ipDepuisRequete, echapperHtml } from "@/lib/rateLimit";

export async function POST(request) {
  const { slug, raison, details, clientEmail } = await request.json();

  if (!slug || !raison?.trim()) {
    return NextResponse.json({ erreur: "Motif du signalement requis." }, { status: 400 });
  }

  const { autorise } = limiterTaux(`signalement:${ipDepuisRequete(request)}`, { max: 5, fenetreMs: 10 * 60_000 });
  if (!autorise) {
    return NextResponse.json({ erreur: "Trop de signalements, réessayez plus tard." }, { status: 429 });
  }

  const boutique = await prisma.boutique.findUnique({ where: { slug } });
  if (!boutique) {
    return NextResponse.json({ erreur: "Boutique introuvable." }, { status: 404 });
  }

  const signalement = await prisma.signalement.create({
    data: {
      boutiqueId: boutique.id,
      raison: raison.trim().slice(0, 200),
      details: details ? String(details).trim().slice(0, 1000) : null,
      clientEmail: clientEmail || null,
    },
  });

  // Notifie l'admin par email — best effort, ne bloque jamais la réponse au
  // client si l'envoi échoue (le signalement reste visible dans /admin).
  if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
    try {
      const reponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "Divine Harvest Store <onboarding@resend.dev>",
          to: process.env.ADMIN_EMAIL,
          subject: `Signalement — ${boutique.nom}`,
          html: `<p>Boutique : ${echapperHtml(boutique.nom)} (${escapeUrl(boutique.slug)})</p><p>Motif : ${echapperHtml(raison)}</p>${details ? `<p>Détails : ${echapperHtml(details)}</p>` : ""}${clientEmail ? `<p>Contact : ${echapperHtml(clientEmail)}</p>` : ""}`,
        }),
      });
      if (!reponse.ok) console.error("Échec email signalement (Resend)", reponse.status, await reponse.text());
    } catch (e) {
      console.error("Échec email signalement, exception :", e);
    }
  }

  return NextResponse.json({ ok: true, id: signalement.id });
}

function escapeUrl(s) {
  return String(s).replace(/[<>"']/g, "");
}
