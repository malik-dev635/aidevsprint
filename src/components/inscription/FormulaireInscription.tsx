"use client";

import { useId, useState } from "react";

import { CtaButton } from "@/components/ui/CtaButton";
import type { Edition } from "@/lib/edition";

/**
 * Le formulaire de réservation. Il vit dans la modale, et nulle part
 * ailleurs — voir `ModaleInscription`.
 *
 * ── Ce que fait l'envoi ──────────────────────────────────────────────
 * `POST /api/inscriptions` sur le Laravel. L'inscription naît `en_attente` :
 * le paiement n'est pas branché, et il ne le sera pas par une redirection
 * navigateur mais par un webhook signé. Le formulaire ne fait donc qu'une
 * chose — enregistrer la demande.
 *
 * Trois champs, pas un de plus : ce sont exactement ceux qu'accepte
 * `EnregistrerInscription` côté serveur. `statut`, `montant_fcfa` et
 * `reference_paiement` ne sont jamais envoyés — le serveur les décide.
 *
 * ⚠️  À FAIRE AVANT MISE EN LIGNE
 * L'écran de confirmation annonce un email (choix de Malik, 2026-10-25),
 * mais Laravel n'envoie encore aucun mail : ni Mailable, ni SMTP configuré.
 * Tant que ce n'est pas écrit, la promesse n'est pas tenue.
 */

/**
 * L'adresse du back. Pas de valeur par défaut : un repli silencieux sur
 * `localhost` partirait en production et les inscriptions se perdraient
 * sans bruit. Absente, le formulaire le dit.
 */
const API = process.env.NEXT_PUBLIC_API_URL;

const WHATSAPP_AFFICHE = "07 04 92 10 80";

type NomChamp = "nom" | "telephone" | "email";
type Erreurs = Partial<Record<NomChamp | "global", string>>;
type Etat = "repos" | "envoi" | "ok";

const VIDE: Record<NomChamp, string> = { nom: "", telephone: "", email: "" };

/**
 * Les mêmes règles que `EnregistrerInscription`, à un détail près :
 * l'email est obligatoire ici alors que l'API l'accepte vide, parce que
 * la confirmation promet un email — on ne peut pas le promettre à
 * quelqu'un qui ne l'a pas donné.
 */
function verifie(valeurs: Record<NomChamp, string>): Erreurs {
  const erreurs: Erreurs = {};
  const nom = valeurs.nom.trim();
  const telephone = valeurs.telephone.trim();
  const email = valeurs.email.trim();

  if (nom.length < 2) erreurs.nom = "Écris ton nom complet.";

  // Pas de contrainte de format sur le numéro : en Côte d'Ivoire il
  // s'écrit « 07 04 92 10 80 », « +22507… » ou « 0704921080 ». Imposer
  // une forme ferait perdre des inscriptions. On compte les chiffres.
  if (telephone.replace(/\D/g, "").length < 8) {
    erreurs.telephone = "Ce numéro est trop court.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    erreurs.email = "Cette adresse email n'est pas valide.";
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
    <div className="flex flex-col gap-2">
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

export function FormulaireInscription({ edition }: { edition: Edition }) {
  const [valeurs, setValeurs] = useState(VIDE);
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [etat, setEtat] = useState<Etat>("repos");
  const [prenom, setPrenom] = useState("");

  const ecrit = (champ: NomChamp) => (valeur: string) => {
    setValeurs((v) => ({ ...v, [champ]: valeur }));
    // L'erreur d'un champ disparaît dès qu'on le corrige, pas au prochain
    // envoi : garder un champ en rouge pendant qu'on le retape est faux.
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

    if (!API) {
      setErreurs({
        global: `Le formulaire n'est pas encore relié au serveur. Écris-nous sur WhatsApp au ${WHATSAPP_AFFICHE}.`,
      });
      return;
    }

    setErreurs({});
    setEtat("envoi");

    try {
      const reponse = await fetch(`${API}/api/inscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          edition_id: edition.id,
          nom: valeurs.nom.trim(),
          telephone: valeurs.telephone.trim(),
          email: valeurs.email.trim(),
        }),
      });

      if (reponse.ok) {
        setPrenom(valeurs.nom.trim().split(/\s+/)[0]);
        setValeurs(VIDE);
        setEtat("ok");
        return;
      }

      setEtat("repos");

      if (reponse.status === 422) {
        // Laravel renvoie `{ errors: { champ: [message] } }`. On reprend
        // ses messages : ils sont déjà en français et ils font autorité.
        const corps = (await reponse.json()) as {
          errors?: Record<string, string[]>;
        };
        const recues = corps.errors ?? {};
        const rendues: Erreurs = {};
        for (const champ of ["nom", "telephone", "email"] as const) {
          if (recues[champ]?.[0]) rendues[champ] = recues[champ][0];
        }
        // Une erreur sur `edition_id` n'est pas la faute du visiteur :
        // c'est l'édition qui n'est pas ouverte. On ne lui montre pas un
        // champ fautif qu'il ne voit même pas.
        if (recues.edition_id?.[0]) rendues.global = recues.edition_id[0];
        setErreurs(
          Object.keys(rendues).length > 0
            ? rendues
            : { global: "Le formulaire a été refusé. Vérifie tes réponses." },
        );
        return;
      }

      if (reponse.status === 429) {
        setErreurs({
          global: "Trop de tentatives d'un coup. Réessaie dans une minute.",
        });
        return;
      }

      setErreurs({
        global: `L'envoi a échoué. Réessaie, ou écris-nous sur WhatsApp au ${WHATSAPP_AFFICHE}.`,
      });
    } catch {
      setEtat("repos");
      setErreurs({
        global:
          "Impossible de joindre le serveur. Vérifie ta connexion et réessaie.",
      });
    }
  }

  if (etat === "ok") {
    return (
      <div
        role="status"
        className="flex flex-col gap-3 rounded-card border border-accent/60
                   px-[clamp(1.25rem,3vw,2rem)]
                   py-[clamp(1.5rem,4svh,2.5rem)] text-center"
      >
        <p className="text-h3 font-bold leading-tight">
          C&apos;est noté, {prenom}.
        </p>
        <p className="text-body text-fg/70">
          Ta place est réservée. Tu reçois un email de confirmation avec les
          détails du paiement.
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
      <Champ
        nom="nom"
        etiquette="Nom complet"
        valeur={valeurs.nom}
        onChange={ecrit("nom")}
        erreur={erreurs.nom}
        type="text"
        autoComplete="name"
        enterKeyHint="next"
        placeholder="Konan Yao"
      />

      <Champ
        nom="telephone"
        etiquette="Téléphone (WhatsApp)"
        aide="Celui sur lequel on peut te joindre le jour J."
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
        aide="La confirmation part là-dessus."
        valeur={valeurs.email}
        onChange={ecrit("email")}
        erreur={erreurs.email}
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect="off"
        enterKeyHint="send"
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
