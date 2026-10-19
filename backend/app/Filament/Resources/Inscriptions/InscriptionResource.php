<?php

namespace App\Filament\Resources\Inscriptions;

use App\Filament\Resources\Inscriptions\Pages\CreateInscription;
use App\Filament\Resources\Inscriptions\Pages\EditInscription;
use App\Filament\Resources\Inscriptions\Pages\ListInscriptions;
use App\Filament\Resources\Inscriptions\Schemas\InscriptionForm;
use App\Filament\Resources\Inscriptions\Tables\InscriptionsTable;
use App\Models\Inscription;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class InscriptionResource extends Resource
{
    protected static ?string $model = Inscription::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedTicket;

    protected static ?string $modelLabel = 'inscription';

    protected static ?string $pluralModelLabel = 'inscriptions';

    protected static ?int $navigationSort = 3;

    protected static ?string $recordTitleAttribute = 'nom';

    /** Le nombre de demandes en attente, visible depuis le menu. */
    public static function getNavigationBadge(): ?string
    {
        $enAttente = Inscription::query()
            ->where('statut', Inscription::STATUT_EN_ATTENTE)
            ->count();

        return $enAttente > 0 ? (string) $enAttente : null;
    }

    public static function form(Schema $schema): Schema
    {
        return InscriptionForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return InscriptionsTable::configure($table);
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
            'index' => ListInscriptions::route('/'),
            'create' => CreateInscription::route('/create'),
            'edit' => EditInscription::route('/{record}/edit'),
        ];
    }
}
