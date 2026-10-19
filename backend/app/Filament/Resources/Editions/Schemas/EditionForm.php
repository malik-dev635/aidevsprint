<?php

namespace App\Filament\Resources\Editions\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

/**
 * Le formulaire d'une édition.
 *
 * Trois blocs qui suivent l'ordre des décisions : ce qui est fixé depuis
 * l'affiche, ce qui dépend de la salle et des places, puis la mise en ligne.
 *
 * Les champs non arrêtés restent vides sans bloquer l'enregistrement : le
 * site les affiche « [À DÉTERMINER] ». Obliger à les remplir forcerait à
 * inventer une date.
 */
class EditionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Identité')
                    ->columns(2)
                    ->schema([
                        TextInput::make('numero')
                            ->label('Numéro de session')
                            ->helperText('Le « #1 » affiché sur le site.')
                            ->required()
                            ->numeric()
                            ->minValue(1)
                            ->unique(ignoreRecord: true),

                        TextInput::make('format')
                            ->label('Format')
                            ->required()
                            ->default('1 journée · présentiel'),
                    ]),

                Section::make('Quand et où')
                    ->columns(2)
                    ->schema([
                        DateTimePicker::make('date_debut')
                            ->label('Date et heure de début')
                            ->helperText('Vide tant qu\'elle n\'est pas arrêtée : le site affiche « [À DÉTERMINER] ».')
                            ->seconds(false)
                            ->native(false),

                        TextInput::make('ville')
                            ->label('Ville')
                            ->required()
                            ->default('Yamoussoukro'),

                        TextInput::make('lieu')
                            ->label('Lieu précis')
                            ->placeholder('Mairie de Yamoussoukro — salle multimédia Orange')
                            ->columnSpanFull(),
                    ]),

                Section::make('Places et prix')
                    ->columns(3)
                    ->schema([
                        TextInput::make('prix_fcfa')
                            ->label('Prix')
                            ->suffix('FCFA')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('quota')
                            ->label('Places totales')
                            ->numeric()
                            ->minValue(1),

                        TextInput::make('inscrits')
                            ->label('Inscrits')
                            ->helperText('Saisi à la main — inclut les places vendues par WhatsApp.')
                            ->numeric()
                            ->minValue(0),
                    ]),

                Section::make('Intervenants et mise en ligne')
                    ->schema([
                        Select::make('formateurs')
                            ->label('Intervenants')
                            ->relationship('formateurs', 'prenom')
                            ->multiple()
                            ->preload(),

                        DateTimePicker::make('publiee_le')
                            ->label('Publiée le')
                            ->helperText('Tant que ce champ est vide, l\'API ne renvoie pas cette édition : elle est invisible sur le site.')
                            ->seconds(false)
                            ->native(false),
                    ]),
            ]);
    }
}
