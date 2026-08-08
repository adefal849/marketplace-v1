// Limiteur en mémoire : freine les tentatives répétées (brute force sur la
// connexion, spam d'inscription ou de demande de réinitialisation) sans
// dépendance externe. Limite réelle : sur Vercel, chaque instance
// serverless a sa propre mémoire, donc ce n'est pas une protection
// parfaite si le trafic est réparti sur plusieurs instances. Ça suffit à
// dissuader un script basique ; pour une protection solide à plus grande
// échelle, prévoir Upstash Redis + @upstash/ratelimit (quelques dollars/mois).
const tentatives = new Map();

export function limiterTaux(cle, { max = 5, fenetreMs = 60_000 } = {}) {
  const maintenant = Date.now();
  const entree = tentatives.get(cle);

  if (!entree || maintenant - entree.debut > fenetreMs) {
    tentatives.set(cle, { debut: maintenant, count: 1 });
    return { autorise: true };
  }

  if (entree.count >= max) {
    return { autorise: false, attendreSec: Math.ceil((fenetreMs - (maintenant - entree.debut)) / 1000) };
  }

  entree.count += 1;
  return { autorise: true };
}

export function ipDepuisRequete(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "inconnu";
}

export function echapperHtml(texte) {
  return String(texte).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}
