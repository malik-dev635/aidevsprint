"use client";

import { useId, useState } from "react";

import { api, ErreurApi } from "@/lib/api";
import { CtaButton } from "@/components/ui/CtaButton";
import {
  lancePaiement,
  rangeJetonSuivi,
  rangeTrace,
  traduitPaiement,
} from "@/lib/paiement";
import type { Edition } from "@/lib/edition";

/**
 * Le formulaire de réservation. Il vit dans la modale, et nulle part
 * ailleurs — voir `ModaleInscription`.
 *
 * ── Ce que fait l'envoi ──────────────────────────────────────────────
 * `POST /enrollments` sur l'API Aidev Classroom (voir `docs/api.md`).
 * L'inscription naît `PENDING` et la réponse porte un `trackingToken` —
 * c'est la seule fois où il est renvoyé en clair. Sans lui, le participant
 * ne peut plus ni suivre son dossier ni payer : on le range tout de suite.
 *
 * Quatre champs, exactement ceux de `StudentInputDto`. Le back refuse tout
 * champ qu'il ne connaît pas (`forbidNonWhitelisted`) : on n'envoie rien
 * d'autre, et surtout rien qui touche au statut ou au montant.
 *
 * ── Le téléphone ─────────────────────────────────────────────────────
 * L'API exige du E.164 strict (`^\+[1-9]\d{6,17}$`). Personne n'écrit son
 * numéro comme ça en Côte d'Ivoire. On accepte donc la forme locale et on
 * normalise — voir `normaliseTelephone`. Refuser « 07 04 92 10 80 » ferait
 * perdre des inscriptions, et le site a un seul job.
 *
 * ── Le paiement ──────────────────────────────────────────────────────
 * Branché le 2026-10-28. L'écran de confirmation propose de régler tout de
 * suite : `lancePaiement()` rend une adresse Paystack, on y redirige, et
 * Paystack ramène sur `/paiement/retour`. Le détail est dans
 * `src/lib/paiement.ts`.
 *
 * On paie le prix entier en une fois, parce que c'est ce que le site
 * annonce. L'API accepte pourtant des versements partiels à partir de
 * `minimumPaymentXof` : si Malik veut ouvrir le paiement fractionné, c'est
 * ici que ça se décide, pas dans le back.
 *
 * ⚠️  Il reste une dépendance côté serveur : `PAYSTACK_CALLBACK_URL` doit
 * pointer sur https://ai-dev-sprint.com/paiement/retour. Tant qu'elle ne
 * l'est pas, le participant paie mais atterrit ailleurs.
 */

const WHATSAPP_AFFICHE = "07 04 92 10 80";

/** Indicatif de la Côte d'Ivoire, pour les numéros écrits en local. */
const INDICATIF_CI = "225";

/** Longueur d'un numéro ivoirien depuis le passage à 10 chiffres. */
const CHIFFRES_LOCAUX = 10;

type NomChamp = "prenom" | "nom" | "email" | "telephone";
type Erreurs = Partial<Record<NomChamp | "global", string>>;
type Etat = "repos" | "envoi" | "ok";

const VIDE: Record<NomChamp, string> = {
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
};

/**
 * Du numéro tel qu'on l'écrit ici vers celui qu'attend l'API.
 *
 * « 07 04 92 10 80 », « 0704921080 » et « +225 07 04 92 10 80 » donnent
 * tous `+2250704921080`. Un numéro déjà international garde son indicatif.
 * `null` quand on ne peut pas trancher : mieux vaut demander que deviner
 * un indicatif et envoyer quelqu'un dans le vide.
 */
export function normaliseTelephone(saisi: string): string | null {
  const brut = saisi.trim();
  const chiffres = brut.replace(/\D/g, "");

  const international = brut.startsWith("+") || brut.startsWith("00");
  const corps = brut.startsWith("00") ? chiffres.slice(2) : chiffres;

  if (international) {
    return /^[1-9]\d{6,17}$/.test(corps) ? `+${corps}` : null;
  }

  if (chiffres.length === CHIFFRES_LOCAUX) {
    return `+${INDICATIF_CI}${chiffres}`;
  }

  return null;
}

function verifie(valeurs: Record<NomChamp, string>): Erreurs {
  const erreurs: Erreurs = {};

  if (valeurs.prenom.trim().length < 2) erreurs.prenom = "Écris ton prénom.";
  if (valeurs.nom.trim().length < 2) erreurs.nom = "Écris ton nom.";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valeurs.email.trim())) {
    erreurs.email = "Cette adresse email n'est pas valide.";
  }

  if (normaliseTelephone(valeurs.telephone) === null) {
    erreurs.telephone = valeurs.telephone.trim()
      ? "Numéro incomplet. Dix chiffres, ou l'indicatif du pays."
      : "Le numéro est obligatoire.";
  }

  return erreurs;
}

function Champ({
  nom,
  etiquette,
  aide,
  erreur,
  valeur,
  onChange,
  ...input
}: {
  nom: NomChamp;
  etiquette: string;
  aide?: string;
  erreur?: string;
  valeur: string;
  onChange: (valeur: string) => void;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "name" | "value" | "onChange"
>) {
  const id = useId();
  const idAide = `${id}-aide`;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label
        htmlFor={id}
        className="font-mono text-small uppercase tracking-[0.15em] text-fg/60"
      >
        {etiquette}
      </label>

      <input
        {...input}
        id={id}
        name={nom}
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={erreur || aide ? idAide : undefined}
        // `border-color` et rien d'autre change au focus : pas d'ombre,
        // pas de lueur. Le `:focus-visible` global pose déjà le contour.
        //
        // Un champ fautif se marque en blanc franc, pas en vert : le vert
        // est la couleur de l'accent et du succès sur tout le site, il
        // dirait l'inverse de ce qui se passe. Le système de design n'a
        // pas de couleur d'alerte — à décider avec Malik, en attendant
        // c'est le contraste qui porte le message.
        className={`w-full rounded-field border bg-bg
                    px-[clamp(0.875rem,2vw,1.125rem)]
                    py-[clamp(0.6875rem,1.6svh,0.9375rem)]
                    text-body text-fg transition-colors duration-[160ms]
                    placeholder:text-fg/30
                    ${erreur ? "border-fg/55" : "border-fg/15"}`}
      />

      {(erreur || aide) && (
        <p
          id={idAide}
          // Le message d'erreur se substitue à l'aide : deux lignes sous
          // un champ, l'œil ne sait plus laquelle compte.
          className={`text-small ${
            erreur ? "font-medium text-fg" : "text-fg/45"
          }`}
        >
          {erreur ?? aide}
        </p>
      )}
    </div>
  );
}

/** Ce que l'API renvoie à la création d'une inscription. */
type ReponseInscription = {
  enrollment: { id: number; status: string; totalAmountXof: number };
  trackingToken: string;
};

/**
 * Ce qu'on garde d'une inscription réussie, le temps de proposer le
 * paiement. Le jeton ne transite que par la mémoire de l'onglet et par
 * `localStorage` — jamais par l'adresse.
 */
type Confirmee = { id: number; jeton: string; prenom: string };

/**
 * L'adresse de paiement vient de notre API, mais on la contrôle quand
 * même avant d'y envoyer quelqu'un : une redirection est la dernière
 * chose qu'on veut voir détournée, et la vérification coûte trois lignes.
 */
function adressePaystackValide(adresse: string): boolean {
  try {
    const url = new URL(adresse);
    return (
      url.protocol === "https:" &&
      (url.hostname === "paystack.com" || url.hostname.endsWith(".paystack.com"))
    );
  } catch {
    return false;
  }
}

/** Le message à montrer pour une erreur venue du serveur. */
function traduit(erreur: ErreurApi): Erreurs {
  switch (erreur.code) {
    // Déjà inscrit avec ce couple étudiant + sprint. C'est l'email qui
    // identifie l'étudiant côté API : l'erreur se pose donc là.
    case "DUPLICATE_ENROLLMENT":
      return { email: "Tu es déjà inscrit avec cette adresse." };

    case "SPRINT_CAPACITY_REACHED":
      return {
        global: `C'est complet. Écris-nous sur WhatsApp au ${WHATSAPP_AFFICHE}, on te met sur la liste d'attente.`,
      };

    case "TOO_MANY_REQUESTS":
      return { global: "Trop de tentatives d'un coup. Réessaie dans une minute." };

    // `SPRINT_NOT_FOUND`, `SPRINT_NOT_ACTIVE`, validation : le serveur
    // écrit déjà en français et c'est lui qui fait autorité.
    default:
      return {
        global:
          erreur.statusCode >= 500
            ? `L'envoi a échoué. Réessaie, ou écris-nous sur WhatsApp au ${WHATSAPP_AFFICHE}.`
            : erreur.message,
      };
  }
}

export function FormulaireInscription({ edition }: { edition: Edition }) {
  const [valeurs, setValeurs] = useState(VIDE);
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [etat, setEtat] = useState<Etat>("repos");
  const [confirmee, setConfirmee] = useState<Confirmee | null>(null);
  const [paiementEnCours, setPaiementEnCours] = useState(false);
  const [erreurPaiement, setErreurPaiement] = useState<string | null>(null);

  const ecrit = (champ: NomChamp) => (valeur: string) => {
    setValeurs((v) => ({ ...v, [champ]: valeur }));
    // L'erreur d'un champ disparaît dès qu'on le corrige, pas au prochain
    // envoi : garder un champ marqué pendant qu'on le retape est faux.
    setErreurs((precedentes) => {
      const suivantes = { ...precedentes };
      delete suivantes[champ];
      return suivantes;
    });
  };

  async function envoie(evenement: React.FormEvent) {
    evenement.preventDefault();
    if (etat === "envoi") return;

    const trouvees = verifie(valeurs);
    if (Object.keys(trouvees).length > 0) {
      setErreurs(trouvees);
      return;
    }

    setErreurs({});
    setEtat("envoi");

    try {
      const { enrollment, trackingToken } = await api<ReponseInscription>(
        "/enrollments",
        {
          method: "POST",
          body: JSON.stringify({
            sprintId: edition.id,
            student: {
              firstName: valeurs.prenom.trim(),
              lastName: valeurs.nom.trim(),
              email: valeurs.email.trim(),
              phone: normaliseTelephone(valeurs.telephone),
            },
          }),
        },
      );

      rangeJetonSuivi(enrollment.id, trackingToken);
      setConfirmee({
        id: enrollment.id,
        jeton: trackingToken,
        prenom: valeurs.prenom.trim(),
      });
      setValeurs(VIDE);
      setEtat("ok");
    } catch (cause) {
      setEtat("repos");
      setErreurs(
        cause instanceof ErreurApi
          ? traduit(cause)
          : {
              global:
                "Impossible de joindre le serveur. Vérifie ta connexion et réessaie.",
            },
      );
    }
  }

  /**
   * Lance le versement et part chez Paystack.
   *
   * On range la trace AVANT de rediriger : une fois l'onglet parti, il
   * n'y a plus de code à nous pour l'écrire, et sans elle la page de
   * retour ne saura pas à quel dossier rattacher la référence.
   */
  async function paie() {
    if (!confirmee || paiementEnCours) return;

    setPaiementEnCours(true);
    setErreurPaiement(null);

    try {
      const lance = await lancePaiement(
        confirmee.id,
        edition.prixFCFA,
        confirmee.jeton,
      );

      if (!adressePaystackValide(lance.authorizationUrl)) {
        throw new Error(`adresse de paiement inattendue : ${lance.authorizationUrl}`);
      }

      rangeTrace(lance.reference, {
        idInscription: confirmee.id,
        jeton: confirmee.jeton,
        prenom: confirmee.prenom,
        montantXof: edition.prixFCFA,
      });

      window.location.href = lance.authorizationUrl;
    } catch (cause) {
      setPaiementEnCours(false);
      setErreurPaiement(traduitPaiement(cause));
    }
  }

  if (etat === "ok" && confirmee) {
    return (
      <div
        role="status"
        className="flex flex-col gap-3 rounded-card border border-accent/60
                   px-[clamp(1.25rem,3vw,2rem)]
                   py-[clamp(1.5rem,4svh,2.5rem)] text-center"
      >
        <p className="text-h3 font-bold leading-tight">
          C&apos;est noté, {confirmee.prenom}.
        </p>
        <p className="text-body text-fg/70">
          Ta place est retenue. Elle est confirmée une fois les{" "}
          {edition.prixFCFA.toLocaleString("fr-FR")} FCFA réglés.
        </p>

        {/* Payer tout de suite, tant que l'onglet est encore ouvert : le
            jeton de suivi ne vit que dans ce navigateur, et c'est lui qui
            autorise le paiement. Revenir demain depuis le téléphone de
            quelqu'un d'autre ne marchera pas. */}
        <CtaButton
          type="button"
          onClick={() => void paie()}
          disabled={paiementEnCours}
          pleineLargeur
          className="mt-[clamp(0.25rem,1svh,0.75rem)]"
        >
          {paiementEnCours
            ? "Ouverture du paiement…"
            : `Payer ${edition.prixFCFA.toLocaleString("fr-FR")} FCFA`}
        </CtaButton>

        {erreurPaiement && (
          <p role="alert" className="text-small font-medium text-fg">
            {erreurPaiement}
          </p>
        )}

        <p className="text-small text-fg/45">
          Paiement par Paystack. Tu peux aussi régler plus tard en nous
          écrivant sur WhatsApp au {WHATSAPP_AFFICHE} — mais depuis cet
          appareil, c&apos;est plus simple maintenant.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={envoie}
      noValidate
      className="flex flex-col gap-[clamp(1rem,2.5svh,1.5rem)]"
    >
      {/* Prénom et nom sur une rangée : l'API les veut séparés, mais deux
          champs courts l'un sous l'autre allongent le panneau pour rien. */}
      <div className="grid gap-[clamp(1rem,2.5svh,1.5rem)] sm:grid-cols-2">
        <Champ
          nom="prenom"
          etiquette="Prénom"
          valeur={valeurs.prenom}
          onChange={ecrit("prenom")}
          erreur={erreurs.prenom}
          type="text"
          autoComplete="given-name"
          enterKeyHint="next"
          maxLength={100}
          placeholder="Konan"
        />

        <Champ
          nom="nom"
          etiquette="Nom"
          valeur={valeurs.nom}
          onChange={ecrit("nom")}
          erreur={erreurs.nom}
          type="text"
          autoComplete="family-name"
          enterKeyHint="next"
          maxLength={100}
          placeholder="Yao"
        />
      </div>

      <Champ
        nom="telephone"
        etiquette="Téléphone (WhatsApp)"
        aide="Dix chiffres suffisent, on ajoute le +225."
        valeur={valeurs.telephone}
        onChange={ecrit("telephone")}
        erreur={erreurs.telephone}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        enterKeyHint="next"
        placeholder="07 04 92 10 80"
      />

      <Champ
        nom="email"
        etiquette="Email"
        valeur={valeurs.email}
        onChange={ecrit("email")}
        erreur={erreurs.email}
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect="off"
        enterKeyHint="send"
        maxLength={190}
        placeholder="konan@exemple.ci"
      />

      {erreurs.global && (
        <p role="alert" className="text-small font-medium text-fg">
          {erreurs.global}
        </p>
      )}

      <CtaButton
        type="submit"
        disabled={etat === "envoi"}
        pleineLargeur
        className="mt-[clamp(0.25rem,1svh,0.75rem)]"
      >
        {etat === "envoi" ? "Envoi…" : "Réserver ma place"}
      </CtaButton>

      {/* Pas de case à cocher de consentement tant que la politique de
          confidentialité n'existe pas : une case qui renvoie vers une page
          absente ne protège personne. */}
      <p className="text-small text-fg/45">
        On n&apos;utilise ces informations que pour ton inscription.
      </p>
    </form>
  );
}
