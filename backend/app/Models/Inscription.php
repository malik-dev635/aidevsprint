<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Une demande d'inscription.
 *
 * Seule table du projet contenant des données personnelles. L'API publique
 * l'écrit mais ne la lit jamais : il n'existe pas de route de lecture.
 */
class Inscription extends Model
{
    public const STATUT_EN_ATTENTE = 'en_attente';
    public const STATUT_PAYEE = 'payee';
    public const STATUT_ANNULEE = 'annulee';

    /** Trois valeurs posées par défaut, pas encore validées par Malik. */
    public const STATUTS = [
        self::STATUT_EN_ATTENTE => 'En attente',
        self::STATUT_PAYEE => 'Payée',
        self::STATUT_ANNULEE => 'Annulée',
    ];

    protected $fillable = [
        'edition_id',
        'nom',
        'telephone',
        'email',
        'statut',
        'montant_fcfa',
        'reference_paiement',
    ];

    /**
     * Jamais sérialisée, même si un contrôleur renvoyait le modèle entier
     * par inadvertance. La référence de paiement identifie une transaction.
     */
    protected $hidden = [
        'reference_paiement',
    ];

    public function edition(): BelongsTo
    {
        return $this->belongsTo(Edition::class);
    }
}
