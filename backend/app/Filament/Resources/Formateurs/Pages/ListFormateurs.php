<?php

namespace App\Filament\Resources\Formateurs\Pages;

use App\Filament\Resources\Formateurs\FormateurResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListFormateurs extends ListRecords
{
    protected static string $resource = FormateurResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
