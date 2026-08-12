"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, Flag, ShieldAlert } from "lucide-react";
import DashboardHeader from "../dashboard/DashboardHeader";

export default function AdminAccueil() {
  const router = useRouter();
  const [chargement, setChargement] = useState(true);
  const [interdit, setInterdit] = useState(false);
  const [boutiques, setBoutiques] = useState([]);
  const [signalements, setSignalements] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/connexion");
      return;
    }
    (async () => {
      const headers = { Authorization: `Bearer ${token}` };
      const [resB, resS] = await Promise.all([
        fetch("/api/admin/boutiques", { headers }),
        fetch("/api/admin/signalements", { headers }),
      ]);
      if (resB.status === 403) {
        setInterdit(true);
        setChargement(false);
        return;
      }
      const dataB = await resB.json();
      const dataS = await resS.json();
      setBoutiques(dataB.boutiques || []);
      setSignalements(dataS.signalements || []);
      setChargement(false);
    })();
  }, [router]);

  if (chargement) return <main className="min-h-screen px-6 py-12">Chargement...</main>;

  if (interdit) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <ShieldAlert size={32} />
        <p className="mt-3 text-sm text-muted">Cette section est réservée aux administrateurs.</p>
        <Link href="/dashboard" className="mt-4 text-sm underline">
          Retour au tableau de bord
        </Link>
      </main>
    );
  }

  const enAttente = signalements.filter((s) => s.statut === "NOUVEAU").length;

  return (
    <main className="min-h-screen">
      <DashboardHeader actif="admin" />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="font-display text-2xl">Administration</h1>
        <p className="mt-1 text-sm text-muted">Vue d'ensemble de la marketplace, tous vendeurs confondus.</p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Link href="/admin/boutiques" className="flex flex-col gap-2 border border-line p-4 hover:border-ink">
            <Store size={18} />
            <span className="font-display text-2xl">{boutiques.length}</span>
            <span className="text-sm text-muted">Boutiques</span>
          </Link>
          <Link href="/admin/signalements" className="flex flex-col gap-2 border border-line p-4 hover:border-ink">
            <Flag size={18} />
            <span className="font-display text-2xl">{enAttente}</span>
            <span className="text-sm text-muted">Signalements en attente</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
