import { Fraunces, Inter } from "next/font/google";
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

export const metadata = {
  title: "Marketplace — Vendez en ligne, simplement",
  description: "Créez votre boutique en ligne en quelques minutes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
