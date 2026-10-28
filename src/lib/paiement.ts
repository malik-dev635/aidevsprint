import { api, ErreurApi } from "@/lib/api";

/**
 * Le paiement Paystack, côté site.
 *
 * ── Le parcours, en quatre temps ──────────────────────────────────────
 * 1. `POST /enrollments` crée l'inscription et renvoie un `trackingToken`
 *    (voir `FormulaireInscription`).
 * 2. `POST /payments/enrollments/:id/initialize` rend une `authorizationUrl`
 *    Paystack. On y redirige.
 * 3. Paystack rappelle `/paiement/retour?reference=…` sur notre site.
 * 4. `GET /payments/:reference/verify` donne le statut qui fait foi.
 *
 * ── Pourquoi une vérification serveur ────────────────────────────────
 * Le retour navigateur ne prouve rien : l'adresse se bricole à la main.
 * Seuls `verify` et le webhook signé font autorité, et c'est aussi ce que
 * dit la doc de l'API mot pour mot. Le site n'écrit donc jamais « payé »
 * sur la foi d'une redirection.
 *
 * ── Le jeton de suivi, et son point faible ───────────────────────────
 * L'API ne renvoie le `trackingToken` qu'une seule fois, à l'inscription.
 * Il n'y a ni compte ni mot de passe : ce jeton EST la preuve que le
 * dossier est le nôtre. On le range dans `localStorage`, ce qui veut dire
 * qu'il ne survit ni à un autre appareil, ni à une navigation privée, ni à
 * un stockage vidé. Dans ce cas le paiement reste possible — le webhook
 * Paystack met le statut à jour sans nous — mais le site ne peut plus le
 * lire, et la page de retour le dit au lieu de faire semblant.
 *
 * La vraie réponse est un lien de suivi envoyé par email. Elle appartient
 * à l'API : tant que Youssouf n'envoie pas d'email, on ne peut pas mieux.
 *
 * On range donc le jeton sous deux clés. Par identifiant d'inscription,
 * pour reprendre un dossier. Par référence de paiement, parce que Paystack
 * ne nous renvoie que celle-là et qu'il faut remonter au jeton depuis
 * elle.
 */

/** Le préfixe de toutes nos clés de stockage, pour ne pas s'éparpiller. */
const PREFIXE = "aidevsprint";

export type StatutPaiement = "PENDING" | "SUCCESS" | "FAILED" | "ABANDONED";

/** Ce que rend `initialize`. */
export type PaiementLance = {
  paymentId: number;
  reference: string;
  status: StatutPaiement;
  authorizationUrl: string;
};

/**
 * Ce que rend `verify`. Seul `status` est garanti par la doc ; les soldes
 * y sont annoncés en prose, sans schéma. Ils sont donc optionnels, et
 * l'affichage ne s'appuie jamais dessus pour dire l'essentiel.
 */
export type PaiementVerifie = {
  status: StatutPaiement;
  reference: string;
  amountXof?: number;
  paidAt?: string | null;
  totalPaidXof?: number;
  remainingAmountXof?: number;
};

/** Ce qu'on garde en local pour pouvoir vérifier au retour de Paystack. */
export type TracePaiement = {
  idInscription: number;
  jeton: string;
  prenom: string;
  montantXof: number;
};

/* ── Stockage local ──────────────────────────────────────────────────── */

/**
 * Toutes les écritures passent par là, et toutes échouent en silence :
 * navigation privée, stockage bloqué, quota plein. Aucune de ces
 * situations ne doit casser une inscription déjà enregistrée côté serveur.
 */
function ecrit(cle: string, valeur: string) {
  try {
    localStorage.setItem(cle, valeur);
  } catch {
    // Rien à faire ici, et rien à dire au visiteur.
  }
}

function lit(cle: string): string | null {
  try {
    return localStorage.getItem(cle);
  } catch {
    return null;
  }
}

export function rangeJetonSuivi(idInscription: number, jeton: string) {
  ecrit(`${PREFIXE}.suivi.${idInscription}`, jeton);
}

export function litJetonSuivi(idInscription: number): string | null {
  return lit(`${PREFIXE}.suivi.${idInscription}`);
}

export function rangeTrace(reference: string, trace: TracePaiement) {
  ecrit(`${PREFIXE}.paiement.${reference}`, JSON.stringify(trace));
}

/**
 * La trace d'un paiement lancé depuis ce navigateur. `null` quand on
 * revient d'ailleurs — et c'est un cas normal, pas une anomalie.
 */
export function litTrace(reference: string): TracePaiement | null {
  const brut = lit(`${PREFIXE}.paiement.${reference}`);
  if (!brut) return null;

  try {
    const trace: unknown = JSON.parse(brut);
    // Une clé écrite par une version plus ancienne du site ne doit pas
    // faire planter la page de retour.
    return typeof trace === "object" &&
      trace !== null &&
      typeof (trace as TracePaiement).jeton === "string"
      ? (trace as TracePaiement)
      : null;
  } catch {
    return null;
  }
}

/* ── Appels ──────────────────────────────────────────────────────────── */

/**
 * Lance un versement et rend l'adresse Paystack où envoyer le visiteur.
 *
 * `montantXof` est un entier : l'API transmet le XOF tel quel, sans
 * centimes. Elle vérifie elle-même `minimumPaymentXof ≤ montant ≤ reste`.
 */
export async function lancePaiement(
  idInscription: number,
  montantXof: number,
  jeton: string,
): Promise<PaiementLance> {
  return api<PaiementLance>(`/payments/enrollments/${idInscription}/initialize`, {
    method: "POST",
    jetonSuivi: jeton,
    body: JSON.stringify({ amountXof: montantXof }),
  });
}

/**
 * Le statut qui fait foi.
 *
 * Le jeton part en en-tête, jamais en paramètre d'adresse : l'API accepte
 * `?trackingToken=`, mais une adresse se retrouve dans l'historique, dans
 * les journaux du serveur et dans le `Referer` de la page suivante. Un
 * jeton qui tient lieu de mot de passe n'a rien à y faire.
 */
export async function verifiePaiement(
  reference: string,
  jeton: string,
): Promise<PaiementVerifie> {
  return api<PaiementVerifie>(`/payments/${encodeURIComponent(reference)}/verify`, {
    jetonSuivi: jeton,
    cache: "no-store",
  });
}

/* ── Messages ────────────────────────────────────────────────────────── */

const WHATSAPP_AFFICHE = "07 04 92 10 80";

/** Le repli, quand il n'y a plus qu'un humain pour débloquer la situation. */
export const SECOURS_WHATSAPP = `Écris-nous sur WhatsApp au ${WHATSAPP_AFFICHE}.`;

/**
 * Ce qu'on montre pour une erreur de paiement.
 *
 * Le visiteur vient de sortir sa carte ou son mobile money : il lui faut
 * savoir si son argent est parti, et quoi faire maintenant. Les codes du
 * back sont écrits pour un développeur, pas pour lui.
 */
export function traduitPaiement(erreur: unknown): string {
  if (!(erreur instanceof ErreurApi)) {
    return `Impossible de joindre le serveur. Vérifie ta connexion et réessaie. ${SECOURS_WHATSAPP}`;
  }

  switch (erreur.code) {
    case "ENROLLMENT_ALREADY_SETTLED":
      return "Cette inscription est déjà réglée. Il n'y a plus rien à payer.";

    case "PAYMENT_AMOUNT_EXCEEDS_BALANCE":
      return `Le montant dépasse ce qu'il reste à régler. ${SECOURS_WHATSAPP}`;

    case "BELOW_MINIMUM":
    case "PAYMENT_AMOUNT_INVALID":
      return `Ce montant n'est pas accepté. ${SECOURS_WHATSAPP}`;

    case "ENROLLMENT_CANCELLED":
      return `Cette inscription a été annulée. ${SECOURS_WHATSAPP}`;

    case "ENROLLMENT_NOT_FOUND":
      return `Cette inscription est introuvable. ${SECOURS_WHATSAPP}`;

    case "TRACKING_TOKEN_REQUIRED":
    case "TRACKING_TOKEN_INVALID":
      return `Ce navigateur n'a plus la clé de ton dossier. ${SECOURS_WHATSAPP}`;

    // Deux noms pour le même conflit selon la page de la doc consultée.
    case "REFERENCE_CONFLICT":
    case "PAYMENT_REFERENCE_CONFLICT":
      return "Un paiement est déjà en cours pour cette inscription. Attends une minute et réessaie.";

    case "PAYSTACK_UNAVAILABLE":
      return "Le service de paiement ne répond pas. Ton inscription est gardée : réessaie dans quelques minutes.";

    case "PAYSTACK_VERIFY_FAILED":
      return "On n'arrive pas à joindre le service de paiement pour confirmer. Si tu as payé, c'est enregistré de leur côté : réessaie dans un instant.";

    case "PAYMENT_VERIFICATION_MISMATCH":
      return `Le paiement ne correspond pas à ce qui était attendu. Ne repaie surtout pas. ${SECOURS_WHATSAPP}`;

    default:
      return erreur.statusCode >= 500
        ? `Le serveur a eu un problème. ${SECOURS_WHATSAPP}`
        : erreur.message;
  }
}
