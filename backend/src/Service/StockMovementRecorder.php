<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Product;
use App\Entity\StockMovement;
use App\Repository\StockMovementRepository;
use Doctrine\DBAL\LockMode;
use Doctrine\ORM\EntityManagerInterface;
use LogicException;

final class StockMovementRecorder
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly StockMovementRepository $movementRepository,
        private readonly InventoryUpdatePublisher $updatePublisher,
    ) {}

    public function recordStockIn(
        int $productId,
        int $quantity,
    ): ?StockMovement {
        if ($this->entityManager->getConnection()->isTransactionActive()) {
            throw new LogicException(
                'Stock recording must start outside an existing transaction.',
            );
        }

        $movement = $this->entityManager->wrapInTransaction(
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

        $movementId = $movement?->getId();

        if ($movementId !== null) {
            $this->updatePublisher->publishMovement($productId, $movementId);
        }

        return $movement;
    }

    public function recordStockOut(
        int $productId,
        int $quantity,
    ): ?StockMovement {
        if ($this->entityManager->getConnection()->isTransactionActive()) {
            throw new LogicException(
                'Stock recording must start outside an existing transaction.',
            );
        }

        $movement = $this->entityManager->wrapInTransaction(
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
        
        $movementId = $movement?->getId();

        if ($movementId !== null) {
            $this->updatePublisher->publishMovement($productId, $movementId);
        }

        return $movement;
    }
}
