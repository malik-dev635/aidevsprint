<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FormateurResource;
use App\Models\Formateur;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Lecture des intervenants. Publique : ce sont les visages de l'affiche.
 *
 * Le tri suit `ordre` et non la date de création : la section alterne
 * gauche / droite / gauche, l'ordre est une décision de mise en page.
 */
class FormateurController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return FormateurResource::collection(
            Formateur::query()->orderBy('ordre')->get()
        );
    }

    public function show(Formateur $formateur): FormateurResource
    {
        return new FormateurResource($formateur);
    }
}
