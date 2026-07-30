import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function envoyerEmailReinitialisation(email, lien) {
  await resend.emails.send({
    from: "Marketplace <onboarding@resend.dev>",
    to: [email],
    subject: "Réinitialisez votre mot de passe",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe vendeur.</p>
        <p>
          <a href="${lien}" style="display:inline-block; background:#0a0a0a; color:#fff; padding:12px 20px; text-decoration:none;">
            Choisir un nouveau mot de passe
          </a>
        </p>
        <p style="color:#737373; font-size:13px;">
          Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.
        </p>
      </div>
    `,
  });
}
