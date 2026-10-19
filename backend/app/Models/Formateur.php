<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Un intervenant.
 *
 * `transmet`, `github` et `linkedin` peuvent rester vides : le front les
 * affiche « [À COMPLÉTER] » tant qu'ils ne sont pas fournis.
 */
class Formateur extends Model
{
    protected $fillable = [
        'prenom',
        'nom',
        'role',
        'photo',
        'badge',
        'transmet',
        'github',
        'linkedin',
        'ordre',
    ];

    public function editions(): BelongsToMany
    {
        return $this->belongsToMany(Edition::class);
    }

    /** « Abdel Malik », ou « Youssouf Doumje » quand le nom est connu. */
    public function nomComplet(): string
    {
        return trim($this->prenom.' '.($this->nom ?? ''));
    }
}
