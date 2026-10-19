<?php

namespace Database\Seeders;

use App\Models\Edition;
use App\Models\Formateur;
use Illuminate\Database\Seeder;

/**
 * La première édition et ses trois intervenants.
 *
 * Ne contient QUE des valeurs confirmées — l'affiche, plus le lieu donné par
 * Malik le 2026-10-19. Tout ce qui n'est pas arrêté reste `null` : la date,
 * le quota, le nombre d'inscrits, les liens des formateurs, et ce que
 * Victorien transmet. Le front affiche « [À DÉTERMINER] » pour ces champs.
 *
 * Aucune valeur plausible n'est inventée ici. Une fausse date en base
 * finirait sur le site.
 *
 * L'édition n'est PAS publiée : `publiee_le` est `null`, donc l'API ne la
 * renvoie pas. Elle se publie depuis l'admin, une fois la date connue.
 */
class EditionUnSeeder extends Seeder
{
    public function run(): void
    {
        $edition = Edition::updateOrCreate(
            ['numero' => 1],
            [
                // Confirmés
                'ville' => 'Yamoussoukro',
                'lieu' => 'Mairie de Yamoussoukro — salle multimédia Orange',
                'prix_fcfa' => 20_000,
                'format' => '1 journée · présentiel',

                // À déterminer — surtout pas de valeur de démonstration
                'date_debut' => null,
                'quota' => null,
                'inscrits' => null,
                'publiee_le' => null,
            ],
        );

        $formateurs = [
            [
                'prenom' => 'Victorien',
                'nom' => null,
                'role' => 'Machine learning',
                'transmet' => null,          // à fournir
                'ordre' => 1,
            ],
            [
                'prenom' => 'Youssouf',
                'nom' => 'Doumje',
                'role' => 'DevOps & MLOps',
                'transmet' => 'Déploiement, mise en production, infrastructure.',
                'ordre' => 2,
            ],
            [
                'prenom' => 'Abdel Malik',
                'nom' => null,
                'role' => 'Frontend & design',
                'transmet' => "Comment fonctionnent les skills, et comment obtenir un design qui n'est pas cliché avec l'IA.",
                'ordre' => 3,
            ],
        ];

        foreach ($formateurs as $donnees) {
            $formateur = Formateur::updateOrCreate(
                ['prenom' => $donnees['prenom']],
                [
                    ...$donnees,
                    // Les photos sont dans `public/formateurs/` côté front.
                    // Elles seront téléversées ici depuis l'admin ; les
                    // recopier à l'aveugle créerait deux sources d'images.
                    'photo' => null,
                    'badge' => null,
                    'github' => null,
                    'linkedin' => null,
                ],
            );

            $edition->formateurs()->syncWithoutDetaching($formateur);
        }
    }
}
