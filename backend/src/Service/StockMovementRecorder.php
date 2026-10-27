<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Product;
use App\Entity\StockMovement;
use App\Repository\StockMovementRepository;
use Doctrine\DBAL\LockMode;
use Doctrine\ORM\EntityManagerInterface;

final class StockMovementRecorder
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly StockMovementRepository $movementRepository,
    ) {}

    public function recordStockIn(
        int $productId,
        int $quantity,
    ): ?StockMovement {
        return $this->entityManager->wrapInTransaction(
            function () use ($productId, $quantity): ?StockMovement {
                $product = $this->entityManager->find(
                    Product::class,
                    $productId,
                    LockMode::PESSIMISTIC_WRITE,
                );

                if ($product === null) {
                    return null;
                }

                $this->entityManager->refresh(
                    $product,
                    LockMode::PESSIMISTIC_WRITE,
                );

                $movement = StockMovement::stockIn(
                    $product,
                    $quantity,
                );

                $this->entityManager->persist($movement);

                return $movement;
            }
        );
    }

    public function recordStockOut(
        int $productId,
        int $quantity,
    ): ?StockMovement {
        return $this->entityManager->wrapInTransaction(
            function () use ($productId, $quantity): ?StockMovement {
                $product = $this->entityManager->find(
                    Product::class,
                    $productId,
                    LockMode::PESSIMISTIC_WRITE,
                );

                if ($product === null) {
                    return null;
                }

                $this->entityManager->refresh(
                    $product,
                    LockMode::PESSIMISTIC_WRITE,
                );

                $availableStock = $this->movementRepository
                    ->getCurrentStock($product);

                $movement = StockMovement::stockOut(
                    product: $product,
                    quantity: $quantity,
                    availableStock: $availableStock,
                );

                $this->entityManager->persist($movement);

                return $movement;
            },
        );
    }
}