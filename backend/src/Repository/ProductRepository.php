<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Product;
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
