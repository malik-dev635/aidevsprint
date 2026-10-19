<?php

namespace App\Filament\Resources\Inscriptions\Schemas;

use App\Models\Inscription;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

/**
 * Le formulaire d'une inscription, côté admin.
 *
 * Il sert surtout à corriger une faute de frappe, à passer un statut à
 * « payée » après un versement reçu de la main à la main, ou à saisir une
 * place vendue par WhatsApp. Le visiteur, lui, ne passe jamais par ici :
 * il envoie `POST /api/inscriptions`, qui n'accepte que quatre champs.
 */
class InscriptionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Participant')
                    ->columns(2)
                    ->schema([
                        Select::make('edition_id')
                            ->label('Édition')
                            ->relationship('edition', 'numero')
                            ->getOptionLabelFromRecordUsing(fn ($record): string => "#{$record->numero} — {$record->ville}")
                            ->required()
                            ->preload(),

                        TextInput::make('nom')
                            ->label('Nom')
                            ->required(),

                        TextInput::make('telephone')
                            ->label('Téléphone')
                            ->tel()
                            ->required(),

                        TextInput::make('email')
                            ->label('Email')
                            ->helperText('Facultatif : tout le monde n\'en a pas.')
                            ->email(),
                    ]),

                Section::make('Paiement')
                    ->columns(3)
                    ->schema([
                        Select::make('statut')
                            ->label('Statut')
                            ->options(Inscription::STATUTS)
                            ->default(Inscription::STATUT_EN_ATTENTE)
                            ->required()
                            ->native(false),

                        TextInput::make('montant_fcfa')
                            ->label('Montant reçu')
                            ->suffix('FCFA')
                            ->numeric()
                            ->minValue(0),

                        TextInput::make('reference_paiement')
                            ->label('Référence')
                            ->helperText('Rendue par la passerelle. Jamais exposée par l\'API.')
                            ->unique(ignoreRecord: true),
                    ]),
            ]);
    }
}
