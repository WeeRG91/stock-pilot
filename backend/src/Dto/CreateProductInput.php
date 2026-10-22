<?php

declare(strict_types=1);

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

final class CreateProductInput
{
    #[Assert\NotBlank(message: 'Name is required.')]
    #[Assert\Length(
        max: 150,
        maxMessage: 'Name must contain at most {{ limit }} characters.',
    )]
    public readonly string $name;

    #[Assert\NotBlank(message: 'SKU is required.')]
    #[Assert\Length(
        max: 50,
        maxMessage: 'SKU must contain at most {{ limit }} characters.',
    )]
    public readonly string $sku;

    public function __construct(string $name, string $sku)
    {
        $this->name = trim($name);
        $this->sku = trim($sku);
    }
}