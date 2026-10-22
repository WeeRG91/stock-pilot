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
     * @return list<Product>
     */
    public function findForListing(
        string $search = '',
        ?bool $active = null,
    ): array {
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

        return $queryBuilder->getQuery()->getResult();
    }
}
