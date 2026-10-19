<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Une édition de AIdevsprint : une journée, une ville, un prix.
 *
 * Le site public n'en affiche qu'une à la fois, la prochaine publiée.
 */
class Edition extends Model
{
    protected $fillable = [
        'numero',
        'date_debut',
        'ville',
        'lieu',
        'prix_fcfa',
        'quota',
        'inscrits',
        'format',
        'publiee_le',
    ];

    protected function casts(): array
    {
        return [
            'date_debut' => 'datetime',
            'publiee_le' => 'datetime',
        ];
    }

    public function inscriptions(): HasMany
    {
        return $this->hasMany(Inscription::class);
    }

    public function formateurs(): BelongsToMany
    {
        return $this->belongsToMany(Formateur::class)->orderBy('ordre');
    }

    /** Ce que le site a le droit de montrer. */
    public function scopePubliee(Builder $query): Builder
    {
        return $query->whereNotNull('publiee_le');
    }

    /**
     * Les places encore disponibles.
     *
     * `null` quand le quota n'est pas arrêté : le front affiche alors
     * « [À DÉTERMINER] » plutôt qu'un nombre inventé.
     */
    public function placesRestantes(): ?int
    {
        if ($this->quota === null) {
            return null;
        }

        return max(0, $this->quota - ($this->inscrits ?? 0));
    }
}
