<?php

namespace App\Filament\Resources\Formateurs\Pages;

use App\Filament\Resources\Formateurs\FormateurResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditFormateur extends EditRecord
{
    protected static string $resource = FormateurResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
