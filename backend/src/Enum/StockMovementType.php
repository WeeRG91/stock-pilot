<?php

declare(strict_types=1);

namespace App\Enum;

enum StockMovementType: string
{
    case In = 'in';
    case Out = 'out';
}
