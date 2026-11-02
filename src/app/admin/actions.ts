"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { api } from "@/lib/api";
import { fermeSession, ouvreSession } from "@/lib/admin/session";
import { changeStatut, reverifie, traduitAdmin } from "@/lib/admin/api";
import type { Connexion, StatutInscription } from "@/lib/admin/types";

/**
 * Les actions du panneau d'administration.
 *
 * Toutes tournent sur le serveur. Le JWT n'apparaît à aucun moment dans
 * une réponse envoyée au navigateur : il part directement du serveur Next
 * vers un cookie `httpOnly`.
 *
 * Chacune renvoie `{ erreur }` plutôt que de lever : un formulaire doit
 * pouvoir afficher ce qui s'est mal passé sans faire tomber la page.
 */

export type Etat = { erreur?: string };

export async function connexion(
  _precedent: Etat,
  donnees: FormData,
): Promise<Etat> {
  const email = String(donnees.get("email") ?? "")
    .trim()
    .toLowerCase();
  const motDePasse = String(donnees.get("motDePasse") ?? "");

  if (!email || !motDePasse) {
    return { erreur: "E-mail et mot de passe sont tous les deux requis." };
  }

  try {
    // Route publique : pas de jeton à présenter, et surtout pas de cache.
    const session = await api<Connexion>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: motDePasse }),
      cache: "no-store",
    });

    if (session.admin?.role !== "ADMIN") {
      return { erreur: "Ce compte n'a pas le rôle ADMIN." };
    }

    await ouvreSession(session.accessToken, session.expiresIn);
  } catch (cause) {
    return { erreur: traduitAdmin(cause) };
  }

  // `redirect` lève pour interrompre le rendu : il ne doit jamais se
  // trouver dans un `try`, sinon le `catch` l'avalerait comme une erreur.
  redirect("/admin");
}

export async function deconnexion() {
  await fermeSession();
  redirect("/admin/connexion");
}

export async function changeStatutInscription(
  _precedent: Etat,
  donnees: FormData,
): Promise<Etat> {
  const id = Number(donnees.get("id"));
  const statut = String(donnees.get("statut") ?? "") as StatutInscription;

  if (!Number.isInteger(id) || id <= 0) {
    return { erreur: "Inscription introuvable." };
  }

  try {
    await changeStatut(id, statut);
  } catch (cause) {
    return { erreur: traduitAdmin(cause) };
  }

  revalidatePath(`/admin/inscriptions/${id}`);
  revalidatePath("/admin/inscriptions");
  revalidatePath("/admin");
  return {};
}

export async function reverifiePaiement(
  _precedent: Etat,
  donnees: FormData,
): Promise<Etat> {
  const id = Number(donnees.get("id"));

  if (!Number.isInteger(id) || id <= 0) {
    return { erreur: "Paiement introuvable." };
  }

  try {
    await reverifie(id);
  } catch (cause) {
    return { erreur: traduitAdmin(cause) };
  }

  revalidatePath("/admin/paiements");
  revalidatePath("/admin");
  return {};
}
