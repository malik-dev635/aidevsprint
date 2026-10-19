<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EditionResource;
use App\Models\Edition;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Lecture des éditions. Publique, sans jeton : rien ici n'est confidentiel.
 *
 * Seules les éditions publiées sortent. Une édition en préparation, avec sa
 * date encore fausse, ne doit jamais apparaître sur le site.
 */
class EditionController extends Controller
{
    /** Les éditions publiées, la plus récente d'abord. */
    public function index(): AnonymousResourceCollection
    {
        $editions = Edition::query()
            ->publiee()
            ->with('formateurs')
            ->orderByDesc('numero')
            ->get();

        return EditionResource::collection($editions);
    }

    /**
     * Une édition par son numéro — « session #1 », pas son id interne.
     * C'est le numéro que le site affiche, donc le numéro qu'il demande.
     */
    public function show(int $numero): EditionResource
    {
        $edition = Edition::query()
            ->publiee()
            ->with('formateurs')
            ->where('numero', $numero)
            ->firstOrFail();

        return new EditionResource($edition);
    }
}
