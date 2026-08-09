import Link from "next/link";
import { ShieldCheck, MessageCircle, Store } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      {/* Signaux de confiance : la recherche montre que ça rassure et
          augmente la conversion, même sans système d'avis pour l'instant */}
      <div className="grid grid-cols-1 gap-6 border-b border-line px-6 py-10 sm:grid-cols-3 md:px-12">
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium">Vendeurs identifiés</p>
            <p className="text-xs text-muted">Chaque boutique a une adresse unique.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MessageCircle size={20} strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium">Contact direct</p>
            <p className="text-xs text-muted">Discutez avec le vendeur avant d'acheter.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Store size={20} strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium">Sans intermédiaire</p>
            <p className="text-xs text-muted">Chaque vente vous appartient.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between md:px-12">
        <p>© {new Date().getFullYear()} Divine Harvest Store</p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/#boutiques" className="hover:text-ink hover:underline">
            Boutiques
          </Link>
          <Link href="/#categories" className="hover:text-ink hover:underline">
            Catégories
          </Link>
          <Link href="/inscription" className="hover:text-ink hover:underline">
            Vendre
          </Link>
          <Link href="/contact" className="hover:text-ink hover:underline">
            Contact
          </Link>
          <Link href="/mentions-legales" className="hover:text-ink hover:underline">
            Mentions légales
          </Link>
          <Link href="/confidentialite" className="hover:text-ink hover:underline">
            Confidentialité
          </Link>
          <Link href="/cgv" className="hover:text-ink hover:underline">
            CGV
          </Link>
        </nav>
      </div>
    </footer>
  );
}
