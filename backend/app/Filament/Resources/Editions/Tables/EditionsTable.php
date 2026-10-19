<?php

namespace App\Filament\Resources\Editions\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class EditionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('numero', 'desc')
            ->columns([
                TextColumn::make('numero')
                    ->label('Session')
                    ->formatStateUsing(fn (int $state): string => "#{$state}")
                    ->sortable(),

                TextColumn::make('date_debut')
                    ->label('Date')
                    ->dateTime('d/m/Y H:i')
                    // Pas de date inventée : la colonne le dit franchement.
                    ->placeholder('[À DÉTERMINER]')
                    ->sortable(),

                TextColumn::make('lieu')
                    ->label('Lieu')
                    ->placeholder('[À DÉTERMINER]')
                    ->searchable()
                    ->limit(40),

                TextColumn::make('prix_fcfa')
                    ->label('Prix')
                    ->numeric(thousandsSeparator: ' ')
                    ->suffix(' FCFA')
                    ->placeholder('—'),

                TextColumn::make('inscriptions_count')
                    ->label('Demandes')
                    ->counts('inscriptions')
                    ->badge(),

                TextColumn::make('inscrits')
                    ->label('Inscrits / places')
                    ->formatStateUsing(fn ($state, $record): string => ($state ?? '—').' / '.($record->quota ?? '—')),

                IconColumn::make('publiee_le')
                    ->label('En ligne')
                    ->boolean()
                    ->sortable(),
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
