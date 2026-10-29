<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Product;
use App\Entity\StockMovement;
use App\Enum\StockMovementType;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

final class StockMovementRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, StockMovement::class);
    }

    /**
     * @return array{items: list<StockMovement>, total: int}
     */
    public function findForProduct(
        Product $product,
        int $page = 1,
        int $limit = 20,
    ): array {
        if ($page < 1 || $limit < 1 || $limit > 100) {
            throw new \InvalidArgumentException(
                'Page must be positive and limit must be between 1 and 100.',
            );
        }

        if ($page - 1 > intdiv(PHP_INT_MAX, $limit)) {
            throw new \InvalidArgumentException('Requested page is too large.');
        }

        $queryBuilder = $this->createQueryBuilder('movement')
            ->andWhere('movement.product = :product')
            ->setParameter('product', $product);

        $countQueryBuilder = clone $queryBuilder;

        $total = (int) $countQueryBuilder
            ->select('COUNT(movement.id)')
            ->getQuery()
            ->getSingleScalarResult();

        $items = $queryBuilder
            ->orderBy('movement.createdAt', 'DESC')
            ->addOrderBy('movement.id', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();

        return [
            'items' => $items,
            'total' => $total,
        ];
    }

    /**
     * @return list<StockMovement>
     */
    public function findRecentForDashboard(): array
    {
        return $this->createQueryBuilder('movement')
            ->innerJoin('movement.product', 'product')
            ->addSelect('product')
            ->orderBy('movement.createdAt', 'DESC')
            ->addOrderBy('movement.id', 'DESC')
            ->setMaxResults(5)
            ->getQuery()
            ->getResult();
    }

    public function getCurrentStock(Product $product): int
    {
        $result = $this->createQueryBuilder('movement')
            ->select(
                'COALESCE(SUM(
                    CASE
                        WHEN movement.type = :stockIn
                        THEN movement.quantity
                        ELSE -movement.quantity
                    END
                ), 0)',
            )
            ->andWhere('movement.product = :product')
            ->setParameter('stockIn', StockMovementType::In->value)
            ->setParameter('product', $product)
            ->getQuery()
            ->getSingleScalarResult();

        return (int) $result;
    }

    public function getTotalStock(): int
    {
        $result = $this->createQueryBuilder('movement')
            ->select(
                'COALESCE(SUM(
                CASE
                    WHEN movement.type = :stockIn
                    THEN movement.quantity
                    ELSE -movement.quantity
                END
            ), 0)',
            )
            ->setParameter('stockIn', StockMovementType::In->value)
            ->getQuery()
            ->getSingleScalarResult();

        return (int) $result;
    }
}
