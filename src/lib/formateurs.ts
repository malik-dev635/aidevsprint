/**
 * Les trois intervenants.
 *
 * Noms, rôles et photos viennent de l'affiche — confirmés.
 * Ce que chacun transmet et ses liens restent à fournir : ils sont marqués
 * `null` et s'affichent comme [À COMPLÉTER], jamais remplacés par un texte
 * crédible inventé.
 */

export type Formateur = {
  prenom: string;
  nom: string | null;
  role: string;
  photo: string;
  /** Ce qu'il transmet pendant la journée. */
  transmet: string | null;
  liens: { github: string | null; linkedin: string | null };
};

export const FORMATEURS: Formateur[] = [
  {
    prenom: "Victorien",
    nom: null,
    role: "Machine learning",
    photo: "/formateurs/victorien.png",
    transmet: null,
    liens: { github: null, linkedin: null },
  },
  {
    prenom: "Youssouf",
    nom: "Doumje",
    role: "Dev full stack & DevOps",
    photo: "/formateurs/youssouf.png",
    transmet: null,
    liens: { github: null, linkedin: null },
  },
  {
    prenom: "Abdel Malik",
    nom: null,
    role: "Dev full stack",
    photo: "/formateurs/malik.png",
    transmet: null,
    liens: { github: null, linkedin: null },
  },
];
