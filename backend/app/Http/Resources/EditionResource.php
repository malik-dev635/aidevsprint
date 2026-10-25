<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * La forme de l'édition telle que le front la consomme.
 *
 * Les clés sont en `camelCase` : elles correspondent une pour une au type
 * `Edition` de `src/lib/edition.ts`. La base est en `snake_case`, le front en
 * `camelCase` — la traduction se fait ici, à la frontière, et nulle part
 * ailleurs.
 *
 * @mixin \App\Models\Edition
 */
class EditionResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            // La clé que `POST /api/inscriptions` attend en `edition_id`.
            // Sans elle, le formulaire du site n'a rien à envoyer.
            'id' => $this->id,
            'numero' => $this->numero,
            'dateDebut' => $this->date_debut?->toIso8601String(),
            'ville' => $this->ville,
            'lieu' => $this->lieu,
            'prixFCFA' => $this->prix_fcfa,
            'quota' => $this->quota,
            'inscrits' => $this->inscrits,
            'format' => $this->format,
            'placesRestantes' => $this->placesRestantes(),
            'formateurs' => FormateurResource::collection(
                $this->whenLoaded('formateurs')
            ),
        ];
    }
}
