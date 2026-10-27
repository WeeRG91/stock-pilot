<?php

declare(strict_types=1);

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

final class LowStockThresholdInput
{
    #[Assert\PositiveOrZero(
        message: 'Threshold must be zero or positive.',
    )]
    #[Assert\LessThanOrEqual(
        value: 2147483647,
        message: 'Threshold must not exceed {{ compared_value }}.',
    )]
    public readonly int $threshold;

    public function __construct(int $threshold)
    {
        $this->threshold = $threshold;
    }
}