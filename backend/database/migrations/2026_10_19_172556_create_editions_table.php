<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Les éditions de AIdevsprint.
 *
 * Transcription exacte du type `Edition` de `src/lib/edition.ts`. Les champs
 * nullables le sont parce que le front les affiche déjà comme
 * « [À DÉTERMINER] » : la date, le quota et le nombre d'inscrits ne sont pas
 * arrêtés. Une colonne `NOT NULL` ici obligerait à inventer une valeur.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('editions', function (Blueprint $table) {
            $table->id();

            // Le numéro est ce que le public voit : « session #1 ».
            $table->unsignedSmallInteger('numero')->unique();

            $table->dateTime('date_debut')->nullable();
            $table->string('ville')->default('Yamoussoukro');
            $table->string('lieu')->nullable();

            // Le FCFA n'a pas de centimes : un entier suffit, et évite les
            // arrondis d'un décimal.
            $table->unsignedInteger('prix_fcfa')->nullable();

            $table->unsignedSmallInteger('quota')->nullable();

            // Saisi à la main, pas calculé : des places peuvent se vendre par
            // WhatsApp hors du site. Point ouvert, voir docs/stack.md.
            $table->unsignedSmallInteger('inscrits')->nullable();

            $table->string('format')->default('1 journée · présentiel');

            // Tant qu'une édition n'est pas publiée, le site ne la montre pas.
            $table->timestamp('publiee_le')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('editions');
    }
};
