<?php

namespace App\Filament\Resources\Formateurs\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

/**
 * Le formulaire d'un intervenant.
 *
 * `transmet`, GitHub et LinkedIn restent facultatifs : ils manquent encore
 * pour deux des trois formateurs, et le site les affiche « [À COMPLÉTER] »
 * plutôt que d'inventer une phrase.
 */
class FormateurForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Identité')
                    ->columns(2)
                    ->schema([
                        TextInput::make('prenom')
                            ->label('Prénom')
                            ->required(),

                        TextInput::make('nom')
                            ->label('Nom')
                            ->helperText('Facultatif — Victorien n\'a donné qu\'un prénom.'),

                        TextInput::make('role')
                            ->label('Rôle')
                            ->placeholder('Machine learning')
                            ->required(),

                        TextInput::make('ordre')
                            ->label('Ordre d\'affichage')
                            ->helperText('La section alterne gauche / droite : ce nombre décide de la place.')
                            ->required()
                            ->numeric()
                            ->default(0),
                    ]),

                Section::make('Images')
                    ->columns(2)
                    ->schema([
                        FileUpload::make('photo')
                            ->label('Photo')
                            ->image()
                            ->disk('public')
                            ->directory('formateurs'),

                        FileUpload::make('badge')
                            ->label('Badge')
                            ->helperText('Photo + nom + rôle, l\'image composée utilisée sur le site.')
                            ->image()
                            ->disk('public')
                            ->directory('badges'),
                    ]),

                Section::make('Ce qu\'il transmet')
                    ->schema([
                        Textarea::make('transmet')
                            ->label('Transmet')
                            ->helperText('Une phrase, à la première personne du métier. Vide = « [À COMPLÉTER] » sur le site.')
                            ->rows(3)
                            ->columnSpanFull(),

                        TextInput::make('github')
                            ->label('GitHub')
                            ->url()
                            ->prefix('https://'),

                        TextInput::make('linkedin')
                            ->label('LinkedIn')
                            ->url()
                            ->prefix('https://'),
                    ])
                    ->columns(2),
            ]);
    }
}
