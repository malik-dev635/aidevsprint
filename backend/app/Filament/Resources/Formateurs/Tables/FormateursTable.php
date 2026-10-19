<?php

namespace App\Filament\Resources\Formateurs\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class FormateursTable
{
    public static function configure(Table $table): Table
    {
        return $table
            // Même tri que le site : l'ordre de la liste est l'ordre affiché.
            ->defaultSort('ordre')
            ->reorderable('ordre')
            ->columns([
                ImageColumn::make('photo')
                    ->label('')
                    ->disk('public')
                    ->circular(),

                TextColumn::make('prenom')
                    ->label('Prénom')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('nom')
                    ->label('Nom')
                    ->placeholder('—')
                    ->searchable(),

                TextColumn::make('role')
                    ->label('Rôle')
                    ->searchable(),

                TextColumn::make('transmet')
                    ->label('Transmet')
                    ->placeholder('[À COMPLÉTER]')
                    ->limit(50)
                    ->wrap(),

                TextColumn::make('editions_count')
                    ->label('Éditions')
                    ->counts('editions'),
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
