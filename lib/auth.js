import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET;

export async function hashMotDePasse(motDePasse) {
  return bcrypt.hash(motDePasse, 10);
}

export async function verifierMotDePasse(motDePasse, hash) {
  return bcrypt.compare(motDePasse, hash);
}

export function creerToken(payload) {
  // Le token contient l'id utilisateur + son rôle, valable 7 jours
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifierToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function getUserFromRequest(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return null;
  return verifierToken(token);
}
