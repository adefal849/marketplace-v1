import TopNav from "../TopNav";
import Footer from "../Footer";

export const metadata = { title: "Conditions générales de vente — Divine Harvest Store" };

export default function CGV() {
  return (
    <main className="min-h-screen">
      <TopNav />
      <section className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-display text-3xl">Conditions générales de vente</h1>
        <p className="mt-3 text-sm text-muted">
          Ce gabarit couvre le fonctionnement général de la marketplace. Les
          délais de livraison, moyens de paiement acceptés et modalités de
          retour restent propres à chaque boutique et doivent être précisés
          une fois le paiement en ligne mis en place.
        </p>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-muted">
          <div>
            <h2 className="font-display text-lg text-ink dark:text-paper">1. Rôle de la marketplace</h2>
            <p className="mt-2">
              Divine Harvest Store héberge des boutiques tenues par des
              vendeurs indépendants. La vente se fait directement entre
              l'acheteur et le vendeur ; Divine Harvest Store n'est pas
              partie au contrat de vente.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg text-ink dark:text-paper">2. Commande</h2>
            <p className="mt-2">
              Une commande est confirmée par le vendeur après vérification du
              stock disponible. En cas d'indisponibilité, l'acheteur est
              informé et remboursé si un paiement a déjà été effectué.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg text-ink dark:text-paper">3. Prix</h2>
            <p className="mt-2">
              Les prix affichés sont fixés par chaque vendeur, en FCFA, toutes
              taxes comprises lorsque applicable.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg text-ink dark:text-paper">4. Litiges</h2>
            <p className="mt-2">
              Toute réclamation sur une commande se traite d'abord directement
              avec le vendeur via la messagerie de la boutique. En l'absence
              de solution, contactez{" "}
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
