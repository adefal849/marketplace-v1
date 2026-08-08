import TopNav from "../TopNav";
import Footer from "../Footer";

export const metadata = { title: "Politique de confidentialité — Divine Harvest Store" };

export default function Confidentialite() {
  return (
    <main className="min-h-screen">
      <TopNav />
      <section className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-display text-3xl">Politique de confidentialité</h1>
        <p className="mt-3 text-sm text-muted">Dernière mise à jour : à compléter à la publication.</p>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-muted">
          <div>
            <h2 className="font-display text-lg text-ink dark:text-paper">Données collectées</h2>
            <p className="mt-2">
              Vendeurs : nom, email, mot de passe (stocké de façon chiffrée,
              jamais en clair), pays. Acheteurs : nom, email, téléphone,
              contenu des messages échangés avec un vendeur — uniquement au
              moment d'une commande ou d'un message, sans création de compte.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg text-ink dark:text-paper">Utilisation</h2>
            <p className="mt-2">
              Ces données servent uniquement au traitement des commandes, à
              la mise en relation avec les vendeurs et à la sécurité du
              compte vendeur. Elles ne sont jamais vendues à des tiers.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg text-ink dark:text-paper">Sous-traitants techniques</h2>
            <p className="mt-2">
              Hébergement du site : Vercel. Base de données : Neon. Stockage
              des images : Cloudinary. Envoi des emails de compte : Resend.
              Chacun traite les données strictement nécessaires à son rôle.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg text-ink dark:text-paper">Vos droits</h2>
            <p className="mt-2">
              Vous pouvez demander l'accès, la correction ou la suppression
              de vos données en écrivant à{" "}
              <a href="mailto:DivineHarvestStore@gmail.com" className="underline">
                DivineHarvestStore@gmail.com
              </a>.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
