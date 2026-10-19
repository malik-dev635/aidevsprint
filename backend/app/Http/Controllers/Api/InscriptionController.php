<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EnregistrerInscription;
use App\Models\Inscription;
use Illuminate\Http\JsonResponse;

/**
 * Enregistrement d'une demande d'inscription.
 *
 * Une seule action, volontairement. Pas d'`index`, pas de `show` : ce serait
 * la liste publique de tous les inscrits avec leurs numéros de téléphone.
 * L'admin lit ces données par Filament, qui ne passe pas par cette route.
 *
 * Le paiement n'est pas branché. Une inscription naît `en_attente` et n'en
 * bouge que par l'admin — ou, plus tard, par un webhook vérifié. Jamais sur
 * la foi d'une redirection navigateur.
 */
class InscriptionController extends Controller
{
    public function store(EnregistrerInscription $requete): JsonResponse
    {
        $inscription = Inscription::create([
            ...$requete->validated(),
            'statut' => Inscription::STATUT_EN_ATTENTE,
        ]);

        // La réponse ne renvoie pas l'inscription : le visiteur vient de
        // l'écrire, il n'a rien à relire. Juste de quoi afficher une
        // confirmation et, plus tard, lancer le paiement.
        return response()->json([
            'id' => $inscription->id,
            'statut' => $inscription->statut,
        ], 201);
    }
}
