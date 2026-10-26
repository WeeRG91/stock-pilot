<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\StockMovementType;
use DateTimeImmutable;
use InvalidArgumentException;
use DomainException;
use DateTimeZone;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use App\Repository\StockMovementRepository;

#[ORM\Entity(repositoryClass: StockMovementRepository::class)]
#[ORM\Table(name: 'stock_movements')]
class StockMovement
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Product::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'RESTRICT')]
    private Product $product;

    #[ORM\Column(
        type: Types::STRING,
        length: 3,
        enumType: StockMovementType::class,
    )]
    private StockMovementType $type;

    #[ORM\Column(type: Types::INTEGER)]
    private int $quantity;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
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