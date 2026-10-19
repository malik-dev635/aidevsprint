<?php

namespace App\Filament\Resources\Formateurs;

use App\Filament\Resources\Formateurs\Pages\CreateFormateur;
use App\Filament\Resources\Formateurs\Pages\EditFormateur;
use App\Filament\Resources\Formateurs\Pages\ListFormateurs;
use App\Filament\Resources\Formateurs\Schemas\FormateurForm;
use App\Filament\Resources\Formateurs\Tables\FormateursTable;
use App\Models\Formateur;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class FormateurResource extends Resource
{
    protected static ?string $model = Formateur::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUserGroup;

    protected static ?string $modelLabel = 'intervenant';

    protected static ?string $pluralModelLabel = 'intervenants';

    protected static ?int $navigationSort = 2;

    protected static ?string $recordTitleAttribute = 'prenom';

    public static function form(Schema $schema): Schema
    {
        return FormateurForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return FormateursTable::configure($table);
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
            'index' => ListFormateurs::route('/'),
            'create' => CreateFormateur::route('/create'),
            'edit' => EditFormateur::route('/{record}/edit'),
        ];
    }
}
