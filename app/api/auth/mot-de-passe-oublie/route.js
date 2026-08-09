import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// On répond toujours la même chose, que l'email existe ou non, pour ne
// pas laisser deviner quels emails ont un compte (énumération de comptes).
const MESSAGE_GENERIQUE = {
  message: "Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.",
};

export async function POST(request) {
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ erreur: "Email requis." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpire: new Date(Date.now() + 60 * 60 * 1000) },
    });

    const origine = request.headers.get("origin") || "";
    const lien = `${origine}/reinitialiser-mot-de-passe?token=${token}`;

    if (process.env.RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || "Divine Harvest Store <onboarding@resend.dev>",
            to: user.email,
            subject: "Réinitialisation de votre mot de passe",
            html: `<p>Bonjour ${user.nom},</p><p>Cliquez sur ce lien pour choisir un nouveau mot de passe (valable 1h) :</p><p><a href="${lien}">${lien}</a></p><p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`,
          }),
        });
      } catch {
        // On ne fait pas échouer la requête si l'envoi d'email plante :
        // le message générique reste renvoyé dans tous les cas.
      }
    }
  }

  return NextResponse.json(MESSAGE_GENERIQUE);
}
