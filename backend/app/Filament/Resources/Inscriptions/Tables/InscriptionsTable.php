<?php

namespace App\Filament\Resources\Inscriptions\Tables;

use App\Models\Inscription;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

/**
 * La liste des demandes d'inscription.
 *
 * C'est l'écran le plus consulté de l'admin : qui s'est inscrit, qui a payé,
 * combien de places restent. Tri du plus récent au plus ancien, parce qu'on
 * vient y voir ce qui vient d'arriver.
 */
class InscriptionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('created_at')
                    ->label('Reçue')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),

                TextColumn::make('nom')
                    ->label('Nom')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('telephone')
                    ->label('Téléphone')
                    ->searchable()
                    ->copyable()
                    ->copyMessage('Numéro copié'),

                TextColumn::make('email')
                    ->label('Email')
                    ->placeholder('—')
                    ->searchable()
                    ->toggleable(),

                TextColumn::make('edition.numero')
                    ->label('Session')
                    ->formatStateUsing(fn ($state): string => "#{$state}")
                    ->sortable(),

                TextColumn::make('statut')
                    ->label('Statut')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => Inscription::STATUTS[$state] ?? $state)
                    ->color(fn (string $state): string => match ($state) {
                        Inscription::STATUT_PAYEE => 'success',
                        Inscription::STATUT_ANNULEE => 'danger',
                        default => 'warning',
                    }),

                TextColumn::make('montant_fcfa')
                    ->label('Montant')
                    ->numeric(thousandsSeparator: ' ')
                    ->suffix(' FCFA')
                    ->placeholder('—')
                    ->summarize(
                        \Filament\Tables\Columns\Summarizers\Sum::make()->label('Total encaissé')
                    ),
            ])
            ->filters([
                SelectFilter::make('statut')
                    ->label('Statut')
                    ->options(Inscription::STATUTS),

                SelectFilter::make('edition')
                    ->label('Édition')
                    ->relationship('edition', 'numero'),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
