<?php

declare(strict_types=1);

namespace App\Controller;

use App\Repository\ProductRepository;
use App\Repository\StockMovementRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class DashboardController
{
    public function __construct(
        private readonly ProductRepository $productRepository,
        private readonly StockMovementRepository $movementRepository,
    ) {}

    #[Route('/api/dashboard', name: 'api_dashboard', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $recentMovements = [];

        foreach ($this->movementRepository->findRecentForDashboard() as $movement) {
            $product = $movement->getProduct();

            $recentMovements[] = [
                'id' => $movement->getId(),
                'productId' => $product->getId(),
                'productName' => $product->getName(),
                'productSku' => $product->getSku(),
                'type' => $movement->getType()->value,
                'quantity' => $movement->getQuantity(),
                'createdAt' => $movement->getCreatedAt()->format(DATE_ATOM),
            ];
        }

        $productCounts = $this->productRepository->getDashboardCounts();
        $lowStockProducts = $this->productRepository->findLowStockProducts();
        $productCounts['lowStock'] = count($lowStockProducts);

        return new JsonResponse([
            'data' => [
                'products' => $productCounts,
                'stock' => [
                    'totalUnits' => $this->movementRepository->getTotalStock(),
                ],
                'recentMovements' => $recentMovements,
                'lowStockProducts' => $lowStockProducts,
            ],
            'meta' => [
                'recentMovementsLimit' => 5,
            ],
        ]);
    }
}
