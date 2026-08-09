import { Fraunces, Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./CartContext";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

// Réservée au hero et aux éléments ludiques : plus ronde, plus vivante
// que le Fraunces éditorial utilisé pour les fiches produit.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-hero",
  weight: ["500", "700", "800"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://marketplace-v1-ruddy.vercel.app"),
  title: {
    default: "Divine Harvest Store — Vendez en ligne, simplement",
    template: "%s",
  },
  description: "Créez votre boutique en ligne en quelques minutes.",
  openGraph: {
    title: "Divine Harvest Store",
    description: "Des vendeurs indépendants, un seul marché.",
    siteName: "Divine Harvest Store",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${inter.variable} ${bricolage.variable}`}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
