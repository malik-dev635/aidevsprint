import type { Core } from "@strapi/strapi";

/**
 * Permissions accordées au rôle « public ».
 *
 * Elles sont posées ici, en code, plutôt que cochées dans l'admin : une
 * case cochée ne vit que dans la base locale, ne se relit pas dans une
 * revue et ne suit pas en production. Ce tableau est la seule source.
 *
 * Le front a besoin de lire les éditions et les formateurs, et de créer
 * une inscription. Rien d'autre. En particulier, jamais de `find` sur
 * les inscriptions : ce serait la liste publique de tous les inscrits.
 */
const PERMISSIONS_PUBLIQUES = [
  "api::edition.edition.find",
  "api::edition.edition.findOne",
  "api::formateur.formateur.find",
  "api::formateur.formateur.findOne",
  "api::inscription.inscription.create",
] as const;

async function accorderPermissionsPubliques(strapi: Core.Strapi) {
  const role = await strapi
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: "public" } });

  if (!role) {
    strapi.log.warn(
      "[aidevsprint] Rôle public introuvable : permissions non appliquées.",
    );
    return;
  }

  const accordees: string[] = [];

  for (const action of PERMISSIONS_PUBLIQUES) {
    const existante = await strapi
      .query("plugin::users-permissions.permission")
      .findOne({ where: { action, role: role.id } });

    if (existante) continue;

    await strapi
      .query("plugin::users-permissions.permission")
      .create({ data: { action, role: role.id } });

    accordees.push(action);
  }

  if (accordees.length > 0) {
    strapi.log.info(
      `[aidevsprint] Permissions publiques accordées : ${accordees.join(", ")}`,
    );
  }
}

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await accorderPermissionsPubliques(strapi);
  },
};
