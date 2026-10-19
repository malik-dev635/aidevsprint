<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Les demandes d'inscription.
 *
 * Champs issus de « nom, contact, paiement » dans CLAUDE.md. C'est la seule
 * table qui contient des données personnelles : elle n'est jamais lue par
 * l'API publique, uniquement écrite.
 *
 * Le statut vaut `en_attente` / `payee` / `annulee`. Ces trois valeurs sont
 * posées par défaut et pas encore validées par Malik — voir docs/stack.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inscriptions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('edition_id')->constrained()->cascadeOnDelete();

            $table->string('nom');
            $table->string('telephone');
            $table->string('email')->nullable();   // tout le monde n'a pas d'email

            $table->string('statut')->default('en_attente')->index();
            $table->unsignedInteger('montant_fcfa')->nullable();

            // Référence rendue par la passerelle. Jamais exposée par l'API :
            // `$hidden` sur le modèle.
            $table->string('reference_paiement')->nullable()->unique();

            $table->timestamps();

            // Le cas « il s'inscrit deux fois » : même numéro, même édition.
            // Index et non contrainte unique — un parent peut inscrire deux
            // personnes sur un seul numéro. À trancher avec Malik.
            $table->index(['edition_id', 'telephone']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inscriptions');
    }
};
