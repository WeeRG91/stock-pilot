<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\StockMovementType;
use DateTimeImmutable;
use InvalidArgumentException;
use DomainException;
use DateTimeZone;

class StockMovement
{
    private ?int $id = null;

    private Product $product;

    private StockMovementType $type;

    private int $quantity;

    private DateTimeImmutable $createdAt;

    private function __construct(
        Product $product,
        StockMovementType $type,
        int $quantity,
    )
    {
        if ($quantity <= 0) {
            throw new InvalidArgumentException(
                'Movement quantity must be positive.',
            );
        }

        if (!$product->isActive()) {
            throw new DomainException(
                'Cannot record stock movements for an inactive product.',
            );
        }

        $this->product = $product;
        $this->type = $type;
        $this->quantity = $quantity;
        $this->createdAt = new DateTimeImmutable(
            'now',
            new DateTimeZone('UTC'),
        );
    }

    public static function stockIn(
        Product $product,
        int $quantity,
    ): self {
        return new self($product, StockMovementType::In, $quantity);
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getProduct(): Product
    {
        return $this->product;
    }

    public function getType(): StockMovementType
    {
        return $this->type;
    }

    public function getQuantity(): int
    {
        return $this->quantity;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }
}