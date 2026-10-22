<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Product;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class ProductController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
    ) {
    }

    #[Route('/api/products', name: 'api_products_index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $products = $this->entityManager
            ->getRepository(Product::class)
            ->findBy([], ['id' => 'ASC']);

        $data = [];

        foreach ($products as $product) {
            $data[] = [
                'id' => $product->getId(),
                'name' => $product->getName(),
                'sku' => $product->getSku(),
            ];
        }

        return new JsonResponse(['data' => $data]);
    }
}