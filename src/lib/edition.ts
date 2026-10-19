/**
 * ⚠️  DONNÉES PROVISOIRES — À REMPLACER PAR L'API STRAPI
 *
 * Ce fichier n'existe que pour pouvoir afficher et animer le hero avant que
 * le back ne soit en place. Aucune valeur marquée provisoire n'est réelle.
 *
 * Seuls `ville` et `prixFCFA` viennent de l'affiche et sont confirmés.
 * Tout le reste est à déterminer — voir CLAUDE.md § « Reste à préciser ».
 */

export type Edition = {
  numero: number;
  /** ISO 8601. `null` tant que la date n'est pas arrêtée. */
  dateDebut: string | null;
  ville: string;
  /** Adresse précise dans la ville. */
  lieu: string | null;
  prixFCFA: number | null;
  quota: number | null;
  inscrits: number | null;
  format: string;
};

/** Champs dont la valeur ci-dessous est inventée pour la démo, pas réelle. */
export const CHAMPS_PROVISOIRES = [
  "dateDebut",
  "lieu",
  "quota",
  "inscrits",
] as const satisfies readonly (keyof Edition)[];

export const EDITION_PROVISOIRE: Edition = {
  numero: 1,

  // ── confirmés par l'affiche ───────────────────────────────
  ville: "Yamoussoukro",
  prixFCFA: 20_000,
  format: "1 journée · présentiel",

  // ── À DÉTERMINER : valeurs de démonstration uniquement ────
  dateDebut: "2026-12-05T09:00:00.000Z",
  lieu: null,
  quota: 50,
  inscrits: 37,
};

/** Libellé affiché pour un champ non encore arrêté. */
export const A_DETERMINER = "[À DÉTERMINER]";
