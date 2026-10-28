import { api, ErreurApi, type Page } from "@/lib/api";

/**
 * L'édition courante, telle que le site l'affiche.
 *
 * Elle vient maintenant de l'API (`GET /sprints`, voir `docs/api.md`) et
 * non plus d'un fichier de démonstration — branchée le 2026-10-28.
 *
 * ── Ce que l'API ne porte pas ────────────────────────────────────────
 * Un `Sprint` n'a ni ville, ni lieu, ni format : le modèle a été écrit
 * pour des sprints de plusieurs semaines, pas pour une journée dans une
 * salle précise. Ces trois faits sont donc tenus ici, dans `FAITS_LOCAUX`.
 * Ils viennent du brief et de Malik, ils sont confirmés — ce n'est pas du
 * remplissage. Le jour où l'API gagne les champs, `FAITS_LOCAUX` meurt.
 *
 * Le nombre d'inscrits non plus : il n'existe que sur les routes admin.
 * `inscrits` reste donc `null` et la jauge affiche [À DÉTERMINER], jusqu'à
 * ce que la route publique expose un compteur.
 */

/** Le sprint tel que l'API le renvoie. `docs/api.md` § Sprints. */
export type Sprint = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  priceXof: number;
  minimumPaymentXof: number;
  startAt: string;
  endAt: string;
  capacity: number | null;
  status: "DRAFT" | "ACTIVE" | "INACTIVE" | "COMPLETED";
};

export type Edition = {
  /** La clé du sprint. C'est elle que le formulaire envoie en `sprintId`. */
  id: number;
  /** Le nom donné au sprint côté admin — il s'affiche tel quel. */
  nom: string;
  /** ISO 8601. */
  dateDebut: string;
  ville: string;
  lieu: string;
  prixFCFA: number;
  /** `null` = places illimitées, c'est la convention de l'API. */
  quota: number | null;
  /** Toujours `null` : la route publique ne compte pas les inscrits. */
  inscrits: number | null;
  format: string;
  /** Le versement minimum accepté. Égal au prix s'il faut tout payer. */
  minimumFCFA: number;
};

/**
 * Les faits que l'API ne sait pas porter. Tous confirmés :
 * la ville et le format viennent de l'affiche, le lieu a été donné par
 * Malik le 2026-10-19.
 */
export const FAITS_LOCAUX = {
  ville: "Yamoussoukro",
  lieu: "Mairie de Yamoussoukro — salle multimédia Orange",
  format: "1 journée · présentiel",
} as const;

/** Libellé affiché pour un champ non encore arrêté. */
export const A_DETERMINER = "[À DÉTERMINER]";

export function versEdition(sprint: Sprint): Edition {
  return {
    id: sprint.id,
    nom: sprint.name,
    dateDebut: sprint.startAt,
    prixFCFA: sprint.priceXof,
    minimumFCFA: sprint.minimumPaymentXof,
    quota: sprint.capacity,
    inscrits: null,
    ...FAITS_LOCAUX,
  };
}

/**
 * L'édition à afficher, ou `null` s'il n'y en a pas.
 *
 * `null` n'est pas une erreur : tant qu'aucun sprint n'est `ACTIVE` côté
 * admin, le catalogue public est vide et c'est le cas aujourd'hui. Le site
 * doit savoir se montrer sans édition — date, prix et places en
 * [À DÉTERMINER], inscriptions fermées. Il ne doit surtout pas afficher
 * les valeurs de la dernière fois.
 *
 * Une API injoignable donne le même `null` : la page se construit quand
 * même. Un site qui ne compile plus parce qu'un serveur tousse, c'est pire
 * qu'un site incomplet.
 */
export async function recupereEdition(): Promise<Edition | null> {
  try {
    // `GET /sprints` ne renvoie que les `ACTIVE`, triés du plus récent au
    // plus ancien. Le premier est l'édition en cours.
    const page = await api<Page<Sprint>>("/sprints?page=1&limit=1", {
      revalider: 900,
    });
    const sprint = page.items[0];
    return sprint ? versEdition(sprint) : null;
  } catch (cause) {
    console.error(
      "[edition] catalogue illisible :",
      cause instanceof ErreurApi
        ? `${cause.statusCode} ${cause.code} — ${cause.message}`
        : cause,
    );
    return null;
  }
}
