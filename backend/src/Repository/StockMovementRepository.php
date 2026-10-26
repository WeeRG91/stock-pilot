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
     * @return list<StockMovement>
     */
    public function findRecentForProduct(Product $product): array
    {
        return $this->createQueryBuilder('movement')
            ->andWhere('movement.product = :product')
            ->setParameter('product', $product)
            ->orderBy('movement.createdAt', 'DESC')
            ->addOrderBy('movement.id', 'DESC')
            ->setMaxResults(20)
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
}
