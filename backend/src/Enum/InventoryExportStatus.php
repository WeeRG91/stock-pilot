<?php

declare(strict_types=1);

namespace App\Enum;

enum InventoryExportStatus: string
{
    case Pending = 'pending';
    case Ready = 'ready';
    case Failed = 'failed';
}