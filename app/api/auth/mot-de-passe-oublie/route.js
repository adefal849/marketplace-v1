import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { envoyerEmailReinitialisation } from "@/lib/email";

export async function POST(request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ erreur: "Email requis." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // On répond pareil que l'utilisateur existe ou non, pour ne pas
  // révéler quels emails sont inscrits (bonne pratique de sécurité).
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const base = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get("origin");
    const lien = `${base}/reinitialiser?token=${token}`;

    try {
      await envoyerEmailReinitialisation(email, lien);
    } catch (e) {
      console.error("Erreur envoi email:", e);
    }
  }

  return NextResponse.json({
    message: "Si un compte existe avec cet email, un lien a été envoyé.",
  });
}
