<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Product;
use App\Enum\StockMovementType;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Product>
 */
final class ProductRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Product::class);
    }

    public function getDashboardCounts(): array
    {
        $result = $this->createQueryBuilder('product')
            ->select('COUNT(product.id) AS totalCount')
            ->addSelect(
                'COALESCE(SUM(
                CASE
                    WHEN product.active = :active
                    THEN 1
                    ELSE 0
                END
            ), 0) AS activeCount',
            )
            ->setParameter('active', true)
            ->getQuery()
            ->getSingleResult();

        $total = (int) $result['totalCount'];
        $active = (int) $result['activeCount'];

        return [
            'total' => $total,
            'active' => $active,
            'inactive' => $total - $active,
        ];
    }

    public function countLowStockProducts(): int
    {
        $sql = <<<'SQL'
        SELECT COUNT(*)
        FROM products product
        WHERE product.active = TRUE
          AND COALESCE(
              (
                  SELECT SUM(
                      CASE
                          WHEN movement.type = :stockIn
                          THEN movement.quantity
                          ELSE -movement.quantity
                      END
                  )
                  FROM stock_movements movement
                  WHERE movement.product_id = product.id
              ),
              0
          ) <= product.low_stock_threshold
        SQL;

        return (int) $this->getEntityManager()
            ->getConnection()
            ->fetchOne(
                $sql,
                ['stockIn' => StockMovementType::In->value],
            );
    }

    public function findLowStockProducts(): array
    {
        $sql = <<<'SQL'
        SELECT
            product.id,
            product.name,
            product.sku,
            product.low_stock_threshold AS threshold,
            COALESCE(SUM(
                CASE
                    WHEN movement.type = :stockIn
                    THEN movement.quantity
                    ELSE -movement.quantity
                END
            ), 0) AS quantity
        FROM products product
        LEFT JOIN stock_movements movement
            ON movement.product_id = product.id
        WHERE product.active = TRUE
        GROUP BY
            product.id,
            product.name,
            product.sku,
            product.low_stock_threshold
        HAVING COALESCE(SUM(
            CASE
                WHEN movement.type = :stockIn
                THEN movement.quantity
                ELSE -movement.quantity
            END
        ), 0) <= product.low_stock_threshold
        ORDER BY quantity ASC, product.name ASC, product.id ASC
        SQL;

        $rows = $this->getEntityManager()
            ->getConnection()
            ->fetchAllAssociative(
                $sql,
                ['stockIn' => StockMovementType::In->value],
            );

        return array_map(static fn(array $row): array => [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'sku' => $row['sku'],
            'quantity' => (int) $row['quantity'],
            'threshold' => (int) $row['threshold'],
        ], $rows);
    }

    /**
     * @return array{items: list<Product>, total: int}
     */
    public function findForListing(
        string $search = '',
        ?bool $active = null,
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

        $queryBuilder = $this->createQueryBuilder('product')
            ->orderBy('product.id', 'ASC');

        $search = trim($search);

        if ($search !== '') {
            $queryBuilder
                ->andWhere(
                    '(LOCATE(LOWER(:search), LOWER(product.name)) > 0
                    OR LOCATE(LOWER(:search), LOWER(product.sku)) > 0)'
                )
                ->setParameter('search', $search);
        }

        if ($active !== null) {
            $queryBuilder
                ->andWhere('product.active = :active')
                ->setParameter('active', $active);
        }

        $countQueryBuilder = clone $queryBuilder;

        $total = (int) $countQueryBuilder
            ->select('COUNT(product.id)')
            ->resetDQLPart('orderBy')
            ->getQuery()
            ->getSingleScalarResult();

        $items = $queryBuilder
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();

        return [
            'items' => $items,
            'total' => $total,
        ];
    }
}
