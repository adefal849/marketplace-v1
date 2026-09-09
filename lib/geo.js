// Distance entre deux points GPS en kilomètres (formule de Haversine).
// Pas besoin d'API externe pour ça : juste des maths. Utilisé pour trier
// les boutiques "à proximité" et afficher la distance côté client.
export function distanceKm(lat1, lon1, lat2, lon2) {
  if (
    lat1 == null || lon1 == null || lat2 == null || lon2 == null ||
    Number.isNaN(lat1) || Number.isNaN(lon1) || Number.isNaN(lat2) || Number.isNaN(lon2)
  ) {
    return null;
  }

  const R = 6371; // rayon moyen de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Formatage cohérent avec les captures de référence ("10.5km").
export function formatDistanceKm(km) {
  if (km == null) return null;
  return `${km.toFixed(1)}km`;
}

// Centre par défaut si la géolocalisation navigateur est refusée ou
// indisponible : Cotonou, Bénin — cohérent avec le marché ciblé.
export const CENTRE_PAR_DEFAUT = { lat: 6.3703, lng: 2.3912 };
