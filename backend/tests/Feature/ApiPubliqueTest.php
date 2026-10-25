<?php

namespace Tests\Feature;

use App\Models\Edition;
use App\Models\Formateur;
use App\Models\Inscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * L'API publique.
 *
 * Ces tests gardent deux choses. La première : la forme des réponses, qui
 * doit correspondre aux types du front — une clé renommée ici casse le site
 * sans que rien ne le signale. La seconde, plus importante : on ne peut pas
 * lire la liste des inscrits.
 */
class ApiPubliqueTest extends TestCase
{
    use RefreshDatabase;

    private function editionPubliee(array $attributs = []): Edition
    {
        return Edition::create([
            'numero' => 1,
            'ville' => 'Yamoussoukro',
            'lieu' => 'Mairie de Yamoussoukro — salle multimédia Orange',
            'prix_fcfa' => 20_000,
            'format' => '1 journée · présentiel',
            'publiee_le' => now(),
            ...$attributs,
        ]);
    }

    public function test_une_edition_non_publiee_n_apparait_pas(): void
    {
        $this->editionPubliee(['publiee_le' => null]);

        $this->getJson('/api/editions')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_les_cles_de_l_edition_correspondent_au_type_du_front(): void
    {
        $this->editionPubliee(['quota' => 50, 'inscrits' => 12]);

        $this->getJson('/api/editions')
            ->assertOk()
            ->assertJsonPath('data.0.numero', 1)
            ->assertJsonPath('data.0.prixFCFA', 20_000)
            ->assertJsonPath('data.0.placesRestantes', 38)
            // Pas de date arrêtée : `null`, jamais une date inventée.
            ->assertJsonPath('data.0.dateDebut', null);
    }

    /**
     * Le formulaire du site renvoie cette clé en `edition_id`. Si elle
     * disparaît de la ressource, plus personne ne peut s'inscrire — et
     * rien d'autre dans la suite ne s'en apercevrait.
     */
    public function test_l_edition_expose_son_id_au_formulaire(): void
    {
        $edition = $this->editionPubliee();

        $this->getJson('/api/editions')
            ->assertOk()
            ->assertJsonPath('data.0.id', $edition->id);
    }

    public function test_les_formateurs_sortent_dans_l_ordre_demande(): void
    {
        Formateur::create(['prenom' => 'Youssouf', 'role' => 'DevOps', 'ordre' => 2]);
        Formateur::create(['prenom' => 'Victorien', 'role' => 'ML', 'ordre' => 1]);

        $this->getJson('/api/formateurs')
            ->assertOk()
            ->assertJsonPath('data.0.prenom', 'Victorien')
            ->assertJsonPath('data.1.prenom', 'Youssouf');
    }

    public function test_on_ne_peut_pas_lister_les_inscrits(): void
    {
        $edition = $this->editionPubliee();
        Inscription::create([
            'edition_id' => $edition->id,
            'nom' => 'Quelqu\'un',
            'telephone' => '0704921080',
        ]);

        // 405 : la méthode n'existe pas sur cette URI. Seul POST y répond.
        $this->getJson('/api/inscriptions')->assertStatus(405);
    }

    public function test_une_inscription_valide_est_enregistree(): void
    {
        $edition = $this->editionPubliee();

        $this->postJson('/api/inscriptions', [
            'edition_id' => $edition->id,
            'nom' => 'Awa Koné',
            'telephone' => '07 04 92 10 80',
        ])
            ->assertCreated()
            ->assertJsonPath('statut', Inscription::STATUT_EN_ATTENTE);

        $this->assertDatabaseHas('inscriptions', [
            'nom' => 'Awa Koné',
            'statut' => Inscription::STATUT_EN_ATTENTE,
        ]);
    }

    public function test_on_ne_peut_pas_se_declarer_paye(): void
    {
        $edition = $this->editionPubliee();

        $this->postJson('/api/inscriptions', [
            'edition_id' => $edition->id,
            'nom' => 'Awa Koné',
            'telephone' => '0704921080',
            'statut' => Inscription::STATUT_PAYEE,
            'montant_fcfa' => 20_000,
            'reference_paiement' => 'inventee',
        ])->assertCreated();

        // Les champs envoyés en plus sont ignorés : le statut reste décidé
        // par le serveur.
        $this->assertDatabaseHas('inscriptions', [
            'nom' => 'Awa Koné',
            'statut' => Inscription::STATUT_EN_ATTENTE,
            'montant_fcfa' => null,
            'reference_paiement' => null,
        ]);
    }

    public function test_on_ne_s_inscrit_pas_a_une_edition_non_publiee(): void
    {
        $edition = $this->editionPubliee(['publiee_le' => null]);

        $this->postJson('/api/inscriptions', [
            'edition_id' => $edition->id,
            'nom' => 'Awa Koné',
            'telephone' => '0704921080',
        ])->assertStatus(422)->assertJsonValidationErrors('edition_id');
    }

    public function test_le_nom_et_le_telephone_sont_obligatoires(): void
    {
        $edition = $this->editionPubliee();

        $this->postJson('/api/inscriptions', ['edition_id' => $edition->id])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['nom', 'telephone']);
    }
}
