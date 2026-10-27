<?php

declare(strict_types=1);

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

final class StockQuantityInput
{
    #[Assert\Positive(message: 'Quantity must be positive.')]
    #[Assert\LessThanOrEqual(
        value: 2147483647,
        message: 'Quantity must not exceed {{ compared_value }}.',
    )]
    public readonly int $quantity;

    public function __construct(int $quantity)
    {
        $this->quantity = $quantity;
    }
}