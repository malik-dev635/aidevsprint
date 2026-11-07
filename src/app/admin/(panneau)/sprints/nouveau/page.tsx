import { Suspense } from "react";
import Link from "next/link";

import { exigeSession } from "@/lib/admin/api";
import { Cadre, Surtitre, TitrePage } from "@/components/admin/Briques";
import { FormulaireSprint } from "@/components/admin/FormulaireSprint";

/**
 * `/admin/sprints/nouveau` — créer un sprint, en brouillon ou déjà lancé.
 *
 * La page ne fait que vérifier la session et afficher le formulaire :
 * toute la validation métier vit dans l'action `creerNouveauSprint`.
 *
 * ⚠️  La vérification de session lit le cookie, donc elle est dynamique.
 *     Sous `cacheComponents` elle doit vivre sous un `<Suspense>`, sinon
 *     elle empêche le prérendu et **le build échoue** :
 *
 *         Route "/admin/sprints/nouveau": Next.js encountered uncached
 *         or runtime data during prerendering.
 *
 *     D'où `Garde`, isolée dans sa frontière. Le formulaire, lui, n'a
 *     besoin de rien du serveur : il reste statique et s'affiche tout de
 *     suite, sans attendre la vérification.
 *
 *     Voir docs/admin.md, « Trois pièges de cacheComponents ».
 */

export default function PageNouveauSprint() {
  return (
    <>
      {/* Ne rend rien : elle redirige, ou laisse passer. */}
      <Suspense fallback={null}>
        <Garde />
      </Suspense>

      <Surtitre>Sessions</Surtitre>
      <TitrePage>Nouveau sprint</TitrePage>

      <p className="mt-4 max-w-[60ch] text-body text-fg/60">
        <Link
          href="/admin/sprints"
          className="text-accent underline decoration-accent/40 underline-offset-4"
        >
          ← Retour à la liste
        </Link>
      </p>

      <div className="mt-6 max-w-[52rem]">
        <Cadre titre="Créer un sprint">
          <div className="px-[clamp(1rem,3vw,1.5rem)] py-[clamp(1rem,3svh,1.5rem)]">
            <FormulaireSprint />
          </div>
        </Cadre>
      </div>
    </>
  );
}

async function Garde() {
  await exigeSession();
  return null;
}
