<?php

use App\Http\Controllers\Api\EditionController;
use App\Http\Controllers\Api\FormateurController;
use App\Http\Controllers\Api\InscriptionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API publique
|--------------------------------------------------------------------------
|
| Consommée par le front Next.js. Aucune authentification : tout ce qui est
| lisible ici est déjà public sur le site. Ce qui ne l'est pas n'a pas de
| route du tout — c'est la règle qui tient la sécurité de cette API, pas un
| réglage de permissions.
|
| Il n'existe donc PAS de `GET /api/inscriptions`. Ajouter `apiResource` ici
| ouvrirait la liste de tous les inscrits avec leurs numéros de téléphone.
|
*/

Route::get('/editions', [EditionController::class, 'index']);
Route::get('/editions/{numero}', [EditionController::class, 'show'])
    ->whereNumber('numero');

Route::get('/formateurs', [FormateurController::class, 'index']);
Route::get('/formateurs/{formateur}', [FormateurController::class, 'show'])
    ->whereNumber('formateur');

// Écriture publique : plafonnée à 10 envois par minute et par IP. Sans cela
// un script remplit la table d'inscriptions en quelques secondes.
Route::post('/inscriptions', [InscriptionController::class, 'store'])
    ->middleware('throttle:10,1');
