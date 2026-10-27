<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use App\Repository\ProductRepository;
use InvalidArgumentException;

#[ORM\Entity(repositoryClass: ProductRepository::class)]
#[ORM\Table(name: 'products')]
class Product
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 150)]
    private string $name;

    #[ORM\Column(length: 50, unique: true)]
    private string $sku;

    #[ORM\Column]
    private bool $active = true;

    #[ORM\Column]
    private int $lowStockThreshold = 0;

    public function __construct(string $name, string $sku)
    {
        $this->name = $name;
        $this->sku = $sku;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getSku(): string
    {
        return $this->sku;
    }

    public function updateDetails(string $name, string $sku): void
    {
        $this->name = $name;
        $this->sku = $sku;
    }

    public function isActive(): bool
    {
        return $this->active;
    }

    public function activate(): void
    {
        $this->active = true;
    }

    public function deactivate(): void
    {
        $this->active = false;
    }

    public function getLowStockThreshold(): int
    {
        return $this->lowStockThreshold;
    }

    public function updateLowStockThreshold(int $threshold): void
    {
        if ($threshold < 0 || $threshold > 2147483647) {
            throw new InvalidArgumentException(
                'Low-stock threshold must be between 0 and 2147483647.',
            );
        }

        $this->lowStockThreshold = $threshold;
    }
}
