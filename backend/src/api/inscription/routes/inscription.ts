/**
 * Une inscription porte des données personnelles : nom, téléphone, e-mail.
 *
 * Le routeur par défaut exposerait aussi `find`, `findOne`, `update` et
 * `delete` — c'est-à-dire la liste de tous les inscrits, en lecture
 * publique, dès qu'on coche la permission. On n'expose donc que la
 * création. Le reste se consulte dans l'admin, qui passe par sa propre
 * API et n'a pas besoin de ces routes.
 */
export default {
  routes: [
    {
      method: "POST",
      path: "/inscriptions",
      handler: "inscription.create",
      config: { policies: [], middlewares: [] },
    },
  ],
};
