<?php

namespace App\Filament\Resources\Editions;

use App\Filament\Resources\Editions\Pages\CreateEdition;
use App\Filament\Resources\Editions\Pages\EditEdition;
use App\Filament\Resources\Editions\Pages\ListEditions;
use App\Filament\Resources\Editions\Schemas\EditionForm;
use App\Filament\Resources\Editions\Tables\EditionsTable;
use App\Models\Edition;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class EditionResource extends Resource
{
    protected static ?string $model = Edition::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCalendarDays;

    protected static ?string $modelLabel = 'édition';

    protected static ?string $pluralModelLabel = 'éditions';

    protected static ?int $navigationSort = 1;

    /** Ce qui s'affiche dans la recherche globale et les fils d'Ariane. */
    protected static ?string $recordTitleAttribute = 'numero';

    public static function form(Schema $schema): Schema
    {
        return EditionForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return EditionsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListEditions::route('/'),
            'create' => CreateEdition::route('/create'),
            'edit' => EditEdition::route('/{record}/edit'),
        ];
    }
}
