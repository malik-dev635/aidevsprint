<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * La forme du formateur telle que le front la consomme.
 *
 * Correspond au type `Formateur` de `src/lib/formateurs.ts`, `liens` imbriqué
 * compris. Les chemins de fichiers sont transformés en URL ici : la base
 * stocke un chemin, pas une adresse, parce que l'hôte change entre le local
 * et la production.
 *
 * @mixin \App\Models\Formateur
 */
class FormateurResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'prenom' => $this->prenom,
            'nom' => $this->nom,
            'role' => $this->role,
            'photo' => $this->url($this->photo),
            'badge' => $this->url($this->badge),
            'transmet' => $this->transmet,
            'liens' => [
                'github' => $this->github,
                'linkedin' => $this->linkedin,
            ],
        ];
    }

    private function url(?string $chemin): ?string
    {
        return $chemin === null ? null : Storage::disk('public')->url($chemin);
    }
}
