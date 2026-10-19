<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Les intervenants.
 *
 * Transcription exacte du type `Formateur` de `src/lib/formateurs.ts`.
 * `transmet`, `github` et `linkedin` sont nullables parce qu'ils le sont
 * déjà dans le front : ils s'affichent « [À COMPLÉTER] » tant que Malik ne
 * les a pas fournis.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('formateurs', function (Blueprint $table) {
            $table->id();

            $table->string('prenom');
            $table->string('nom')->nullable();   // Victorien n'a donné qu'un prénom
            $table->string('role');

            // Chemins de fichiers dans le disque public, pas des URL : l'hôte
            // change entre le local et la production.
            $table->string('photo')->nullable();
            $table->string('badge')->nullable();

            $table->text('transmet')->nullable();
            $table->string('github')->nullable();
            $table->string('linkedin')->nullable();

            // La section alterne gauche / droite / gauche. Sans tri explicite,
            // l'ordre d'affichage dépendrait de l'ordre de création.
            $table->unsignedSmallInteger('ordre')->default(0);

            $table->timestamps();
        });

        // Un formateur peut revenir d'une édition à l'autre.
        Schema::create('edition_formateur', function (Blueprint $table) {
            $table->id();
            $table->foreignId('edition_id')->constrained()->cascadeOnDelete();
            $table->foreignId('formateur_id')->constrained()->cascadeOnDelete();
            $table->unique(['edition_id', 'formateur_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('edition_formateur');
        Schema::dropIfExists('formateurs');
    }
};
