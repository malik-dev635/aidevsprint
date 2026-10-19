/**
 * ⚠️  DONNÉES PROVISOIRES — À REMPLACER PAR L'API (Laravel, pas encore écrite)
 *
 * Ce fichier n'existe que pour pouvoir afficher et animer le hero avant que
 * le back ne soit en place. Aucune valeur marquée provisoire n'est réelle.
 *
 * `ville` et `prixFCFA` viennent de l'affiche ; `lieu` a été donné par
 * Malik le 2026-10-19. Ces trois-là sont confirmés.
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
  "quota",
  "inscrits",
] as const satisfies readonly (keyof Edition)[];

export const EDITION_PROVISOIRE: Edition = {
  numero: 1,

  // ── confirmés (affiche + lieu donné par Malik) ────────────
  ville: "Yamoussoukro",
  lieu: "Mairie de Yamoussoukro — salle multimédia Orange",
  prixFCFA: 20_000,
  format: "1 journée · présentiel",

  // ── À DÉTERMINER : valeurs de démonstration uniquement ────
  dateDebut: "2026-12-05T09:00:00.000Z",
  quota: 50,
  inscrits: 37,
};

/** Libellé affiché pour un champ non encore arrêté. */
export const A_DETERMINER = "[À DÉTERMINER]";
