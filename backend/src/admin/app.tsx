/**
 * Configuration du panneau d'administration.
 *
 * Strapi n'embarque que l'anglais par défaut : les autres langues ne sont
 * pas téléchargées à la demande, elles sont incluses au build. Déclarer
 * `fr` ici est donc ce qui rend le français disponible — rien dans
 * l'interface ne peut l'activer tant que le bundle ne le contient pas.
 *
 * Une seule langue est déclarée, pour ne pas alourdir le bundle avec
 * vingt traductions que personne n'ouvrira. L'anglais reste présent,
 * Strapi l'inclut toujours.
 *
 * Chaque compte choisit sa langue dans Profil → Interface language ;
 * à défaut, Strapi suit celle du navigateur.
 */
export default {
  config: {
    locales: ["fr"],
  },
};
