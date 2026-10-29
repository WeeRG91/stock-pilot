<?php

declare(strict_types=1);

namespace App\Message;

use Doctrine\ORM\EntityManagerInterface;

final class GenerateInventoryExport
{
    public function __construct(
        public readonly int $exportId,
    ) {}
}