<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Product;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Response;

final class ProductController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
    ) {}

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

    #[Route(
        '/api/products/{id}',
        name: 'api_products_show',
        requirements: ['id' => '\d+'],
        methods: ['GET'],
    )]
    public function show(int $id): JsonResponse
    {
        $product = $this->entityManager->find(Product::class, $id);

        if ($product === null) {
            return new JsonResponse(
                ['error' => ['message' => 'Product not found.']],
                Response::HTTP_NOT_FOUND,
            );
        }

        return new JsonResponse([
            'data' => [
                'id' => $product->getId(),
                'name' => $product->getName(),
                'sku' => $product->getSku(),
            ],
        ]);
    }
}
