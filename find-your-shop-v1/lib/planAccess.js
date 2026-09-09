import { prisma } from "@/lib/prisma";
import { trouverPlan } from "@/lib/plans";

// Renvoie le plan effectif d'un vendeur : celui de son abonnement payé et
// actif (ni expiré, ni annulé), ou le plan Gratuit par défaut. Toujours
// interroger cette fonction plutôt que de stocker le plan sur User — un
// abonnement expire tout seul (dateFin dépassée) sans qu'on ait à toucher
// au compte.
export async function planEffectif(userId) {
  const abonnement = await prisma.abonnement.findFirst({
    where: {
      userId,
      statut: "ACTIF",
      OR: [{ dateFin: null }, { dateFin: { gt: new Date() } }],
    },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  return abonnement?.plan || trouverPlan("GRATUIT");
}

// Vérifie l'accès à une fonctionnalité booléenne du plan (ex: "assistantIA",
// "statsAvancees", "badgePremium").
export async function aAcces(userId, fonctionnalite) {
  const plan = await planEffectif(userId);
  return Boolean(plan[fonctionnalite]);
}
