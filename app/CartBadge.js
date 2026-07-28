"use client";

import Link from "next/link";
import { useCart } from "./CartContext";

export default function CartBadge() {
  const { nombreArticles } = useCart();

  return (
    <Link href="/panier" className="hover:underline">
      Panier{nombreArticles > 0 ? ` (${nombreArticles})` : ""}
    </Link>
  );
}
