import { prisma } from "@/lib/prisma";

export default async function sitemap() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://marketplace-v1-ruddy.vercel.app";

  const boutiques = await prisma.boutique.findMany({
    where: { actif: true },
    select: { slug: true, createdAt: true },
  });

  return [
    { url: site, changeFrequency: "daily", priority: 1 },
    { url: `${site}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${site}/mentions-legales`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${site}/confidentialite`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${site}/cgv`, changeFrequency: "yearly", priority: 0.2 },
    ...boutiques.map((b) => ({
      url: `${site}/boutique/${b.slug}`,
      lastModified: b.createdAt,
      changeFrequency: "weekly",
      priority: 0.7,
    })),
  ];
}
