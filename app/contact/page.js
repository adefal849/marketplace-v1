import TopNav from "../TopNav";
import Footer from "../Footer";

export const metadata = { title: "Contact — Divine Harvest Store" };

export default function Contact() {
  return (
    <main className="min-h-screen">
      <TopNav />

      <section className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-display text-3xl">Contactez-nous</h1>
        <p className="mt-3 text-sm text-muted">
          Une question, un souci, une suggestion ? On vous répond directement.
        </p>

        <ul className="mt-8 flex flex-col gap-5 text-sm">
          <li>
            <p className="text-muted">Téléphone</p>
            <a href="tel:0153896909" className="font-display text-lg underline">
              01 53 89 69 09
            </a>
          </li>
          <li>
            <p className="text-muted">Email</p>
            <a href="mailto:DivineHarvestStore@gmail.com" className="font-display text-lg underline">
              DivineHarvestStore@gmail.com
            </a>
          </li>
          <li>
            <p className="text-muted">Facebook</p>
            <p className="font-display text-lg">Femi Fal</p>
          </li>
        </ul>
      </section>

      <Footer />
    </main>
  );
}
