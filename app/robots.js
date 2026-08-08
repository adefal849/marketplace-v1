export default function robots() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://marketplace-v1-ruddy.vercel.app";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard", "/api/"] },
    ],
    sitemap: `${site}/sitemap.xml`,
  };
}
