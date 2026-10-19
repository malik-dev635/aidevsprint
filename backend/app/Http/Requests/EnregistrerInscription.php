<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validation d'une demande d'inscription.
 *
 * Tout ce qui arrive d'un formulaire public est hostile jusqu'à preuve du
 * contraire. Ce qui n'est pas listé ici n'atteint jamais le modèle.
 *
 * Ni `statut`, ni `montant_fcfa`, ni `reference_paiement` ne sont acceptés :
 * ce sont des champs que le serveur décide, jamais le visiteur. Les laisser
 * passer permettrait de s'inscrire en se déclarant déjà payé.
 */
class EnregistrerInscription extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'edition_id' => [
                'required',
                'integer',
                // L'édition doit exister ET être publiée : on ne s'inscrit
                // pas à une session que le site ne montre pas encore.
                Rule::exists('editions', 'id')->whereNotNull('publiee_le'),
            ],
            'nom' => ['required', 'string', 'min:2', 'max:120'],

            // Pas de contrainte de format : les numéros ivoiriens s'écrivent
            // « 07 04 92 10 80 », « +22507... », « 0704921080 ». Imposer une
            // forme ferait perdre des inscriptions. La normalisation, si elle
            // est nécessaire, se décidera avec Malik.
            'telephone' => ['required', 'string', 'min:8', 'max:30'],

            'email' => ['nullable', 'email:rfc', 'max:190'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'edition_id.required' => "L'édition n'est pas précisée.",
            'edition_id.exists' => "Cette édition n'existe pas ou n'est pas ouverte.",
            'nom.required' => 'Le nom est obligatoire.',
            'telephone.required' => 'Le numéro de téléphone est obligatoire.',
            'email.email' => "Cette adresse email n'est pas valide.",
        ];
    }
}
