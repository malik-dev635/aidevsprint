import "server-only";

import { redirect } from "next/navigation";

import { api, ErreurApi, ErreurReseau, type Page } from "@/lib/api";
import { litSession } from "./session";
import type { Inscription, Paiement, Resume, StatutInscription } from "./types";

/**
 * Les appels aux routes `/admin` de l'API.
 *
 * Ce module ne tourne **que** sur le serveur Next — `server-only` fait
 * échouer la compilation si un composant client l'importe. C'est
 * volontaire : il manipule le JWT d'administration, qui ne doit jamais
 * atteindre le navigateur.
 *
 * Aucune de ces fonctions n'est mise en cache. Un tableau de bord qui
 * montre des inscriptions d'il y a dix minutes est pire qu'inutile, et
 * `cacheComponents` mettrait volontiers ces réponses de côté sans ça.
 */

/** Personne n'est connecté. Ce n'est pas un refus de l'API, c'est un état. */
export class SansSession extends Error {
  constructor() {
    super("Aucune session d'administration.");
    this.name = "SansSession";
  }
}

async function apiAdmin<T>(chemin: string, init: RequestInit = {}): Promise<T> {
  const jeton = await litSession();
  if (!jeton) throw new SansSession();

  return api<T>(chemin, {
    ...init,
    headers: { Authorization: `Bearer ${jeton}`, ...init.headers },
    cache: "no-store",
  });
}

/**
 * À appeler en tête de chaque page d'administration.
 *
 * Renvoie vers la connexion dans deux cas : pas de cookie du tout, et
 * cookie présent mais refusé par l'API — jeton expiré, ou compte
 * désactivé entre-temps, que `JwtStrategy` rejette à chaque requête.
 */
export async function exigeSession() {
  if (!(await litSession())) redirect("/admin/connexion");
}

/** `true` quand l'erreur veut dire « reconnecte-toi ». */
export function sessionPerdue(cause: unknown): boolean {
  return (
    cause instanceof SansSession ||
    (cause instanceof ErreurApi && cause.statusCode === 401)
  );
}

/* ── Lectures ────────────────────────────────────────────────────────── */

export function resume() {
  return apiAdmin<Resume>("/admin/dashboard/summary");
}

export type FiltresInscriptions = {
  page?: number;
  limit?: number;
  statut?: string;
  recherche?: string;
};

export function inscriptions({
  page = 1,
  limit = 20,
  statut,
  recherche,
}: FiltresInscriptions = {}) {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (statut) q.set("status", statut);
  if (recherche) q.set("search", recherche);
  return apiAdmin<Page<Inscription>>(`/admin/enrollments?${q}`);
}

export function inscription(id: number) {
  return apiAdmin<Inscription>(`/admin/enrollments/${id}`);
}

export function paiementsDeLInscription(id: number) {
  return apiAdmin<Paiement[]>(`/admin/enrollments/${id}/payments`);
}

export type FiltresPaiements = {
  page?: number;
  limit?: number;
  statut?: string;
  reference?: string;
};

export function paiements({
  page = 1,
  limit = 20,
  statut,
  reference,
}: FiltresPaiements = {}) {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (statut) q.set("status", statut);
  if (reference) q.set("reference", reference);
  return apiAdmin<Page<Paiement>>(`/admin/payments?${q}`);
}

/* ── Écritures ───────────────────────────────────────────────────────── */

export function changeStatut(id: number, statut: StatutInscription) {
  return apiAdmin<Inscription>(`/admin/enrollments/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: statut }),
  });
}

/**
 * Redemande son avis à Paystack sur un paiement. Même effet que `verify`,
 * mais déclenché par nous — utile quand un webhook s'est perdu.
 */
export function reverifie(id: number) {
  return apiAdmin<Paiement>(`/admin/payments/${id}/recheck`, {
    method: "POST",
  });
}

/* ── Messages ────────────────────────────────────────────────────────── */

/**
 * Ce qu'on montre à l'administrateur quand un appel échoue.
 *
 * Il est développeur, donc on ne lui cache pas le code du back : c'est
 * l'information la plus utile pour comprendre. Mais on l'accompagne d'une
 * phrase en français, parce qu'un code seul ne dit pas quoi faire.
 */
export function traduitAdmin(cause: unknown): string {
  if (cause instanceof SansSession) {
    return "Session expirée. Reconnecte-toi.";
  }

  if (cause instanceof ErreurReseau) {
    return "L'API est injoignable. Vérifie que aidev.you-soft.com répond.";
  }

  if (!(cause instanceof ErreurApi)) {
    return "Erreur inattendue.";
  }

  switch (cause.code) {
    case "INVALID_CREDENTIALS":
      return "E-mail ou mot de passe incorrect.";
    case "UNAUTHORIZED":
      return "Session expirée. Reconnecte-toi.";
    case "FORBIDDEN":
      return "Ce compte n'a pas le rôle ADMIN.";
    case "INVALID_ENROLLMENT_TRANSITION":
      return "Ce changement de statut n'est pas autorisé depuis l'état actuel.";
    case "ENROLLMENT_NOT_SETTLED":
      return "Impossible de terminer une inscription qui n'est pas soldée.";
    case "ENROLLMENT_NOT_FOUND":
      return "Cette inscription n'existe pas.";
    case "PAYMENT_NOT_FOUND":
      return "Ce paiement n'existe pas.";
    case "PAYSTACK_VERIFY_FAILED":
    case "PAYSTACK_UNAVAILABLE":
      return "Paystack ne répond pas. Réessaie dans un instant.";
    default:
      return cause.statusCode >= 500
        ? `Erreur serveur (${cause.code}).`
        : `${cause.message} (${cause.code})`;
  }
}
