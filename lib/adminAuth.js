import { getUserFromRequest } from "@/lib/auth";

// Utilisé par toutes les routes /api/admin/* : renvoie l'utilisateur si
// c'est bien un admin, sinon null (traité comme non autorisé).
export function getAdminFromRequest(request) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== "ADMIN") return null;
  return user;
}
