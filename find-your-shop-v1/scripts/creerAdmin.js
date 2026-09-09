// Crée (ou met à jour) le compte administrateur. À exécuter une seule fois,
// depuis ta machine/Termux, jamais déployé comme route API — ça évite que
// n'importe qui puisse créer un admin depuis internet.
//
// Usage :
//   node scripts/creerAdmin.js "admin@tondomaine.com" "UnMotDePasseSolide"
//
// Si le compte existe déjà (même email), son mot de passe et son rôle sont
// simplement mis à jour — pratique pour changer le mot de passe plus tard.

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const [, , email, motDePasse] = process.argv;

  if (!email || !motDePasse) {
    console.error('Usage : node scripts/creerAdmin.js "email@exemple.com" "motDePasse"');
    process.exit(1);
  }
  if (!email.includes("@")) {
    console.error("L'email doit être une vraie adresse (ex: admin@tondomaine.com), pas juste un nom.");
    process.exit(1);
  }
  if (motDePasse.length < 8) {
    console.error("Le mot de passe doit faire au moins 8 caractères — un compte admin mérite mieux que le minimum.");
    process.exit(1);
  }

  const motDePasseHash = await bcrypt.hash(motDePasse, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { motDePasse: motDePasseHash, role: "ADMIN" },
    create: { email, motDePasse: motDePasseHash, nom: "Administrateur", role: "ADMIN" },
  });

  console.log(`Compte admin prêt : ${admin.email} (id ${admin.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
