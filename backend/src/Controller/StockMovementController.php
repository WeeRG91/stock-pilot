<?php

declare(strict_types=1);

namespace App\Controller;

use App\Dto\StockQuantityInput;
use App\Repository\ProductRepository;
use App\Repository\StockMovementRepository;
use App\Service\StockMovementRecorder;
use DomainException;
use JsonException;
use stdClass;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

final class StockMovementController
{
    public function __construct(
        private readonly ProductRepository $productRepository,
        private readonly StockMovementRepository $stockMovementRepository,
    ) {}

    #[Route(
        '/api/products/{id}/stock',
        name: 'api_products_stock',
        requirements: ['id' => '\d+'],
        methods: ['GET'],
    )]
    public function stock(int $id): JsonResponse
    {
        $product = $this->productRepository->find($id);

        if ($product === null) {
            return new JsonResponse(
                ['error' => ['message' => 'Product not found.']],
                Response::HTTP_NOT_FOUND,
            );
        }

        return new JsonResponse(
            ['data' => [
                'productId' => $product->getId(),
                'quantity' => $this->stockMovementRepository
                    ->getCurrentStock($product),
            ]],
        );
    }

    #[Route(
        '/api/products/{id}/stock-in',
        name: 'api_products_stock_in',
        requirements: ['id' => '\d+'],
        methods: ['POST'],
    )]
    public function stockIn(
        int $id,
        Request $request,
        ValidatorInterface $validator,
        StockMovementRecorder $recorder,
    ): JsonResponse {
        $input = $this->readQuantity($request, $validator);

        if ($input instanceof JsonResponse) {
            return $input;
        }

        try {
            $movement = $recorder->recordStockIn(
                productId: $id,
                quantity: $input->quantity,
            );
        } catch (DomainException $exception) {
            return new JsonResponse(
                ['error' => ['message' => $exception->getMessage()]],
                Response::HTTP_CONFLICT,
            );
        }

        if ($movement === null) {
            return new JsonResponse(
                ['error' => ['message' => 'Product not found.']],
                Response::HTTP_NOT_FOUND,
            );
        }

        return new JsonResponse(
            ['data' => [
                'id' => $movement->getId(),
                'productId' => $movement->getProduct()->getId(),
                'type' => $movement->getType()->value,
                'quantity' => $movement->getQuantity(),
                'createdAt' => $movement->getCreatedAt()->format(DATE_ATOM),
            ]],
            Response::HTTP_CREATED,
        );
    }

    #[Route(
        '/api/products/{id}/stock-out',
        name: 'api_products_stock_out',
        requirements: ['id' => '\d+'],
        methods: ['POST'],
    )]
    public function stockOut(
        int $id,
        Request $request,
        ValidatorInterface $validator,
        StockMovementRecorder $recorder,
    ): JsonResponse {
        $input = $this->readQuantity($request, $validator);

        if ($input instanceof JsonResponse) {
            return $input;
        }

        try {
            $movement = $recorder->recordStockOut(
                productId: $id,
                quantity: $input->quantity,
            );
        } catch (DomainException $exception) {
            return new JsonResponse(
                ['error' => ['message' => $exception->getMessage()]],
                Response::HTTP_CONFLICT,
            );
        }

        if ($movement === null) {
            return new JsonResponse(
                ['error' => ['message' => 'Product not found.']],
                Response::HTTP_NOT_FOUND,
            );
        }

        return new JsonResponse(
            ['data' => [
                'id' => $movement->getId(),
                'productId' => $movement->getProduct()->getId(),
                'type' => $movement->getType()->value,
                'quantity' => $movement->getQuantity(),
                'createdAt' => $movement->getCreatedAt()->format(DATE_ATOM),
            ]],
            Response::HTTP_CREATED,
        );
    }

    #[Route(
        '/api/products/{id}/movements',
        name: 'api_products_movements',
        requirements: ['id' => '\d+'],
        methods: ['GET'],
    )]
    public function movements(Request $request, int $id): JsonResponse
    {
        $product = $this->productRepository->find($id);

        if ($product === null) {
            return new JsonResponse(
                ['error' => ['message' => 'Product not found.']],
                Response::HTTP_NOT_FOUND,
            );
        }

        $query = $request->query->all();
        $pageValue = $query['page'] ?? '1';
        $limitValue = $query['limit'] ?? '20';

        if (!is_string($pageValue) || !is_string($limitValue)) {
            return new JsonResponse(
                ['error' => ['message' => 'Page and limit must be integer strings.']],
                Response::HTTP_BAD_REQUEST,
            );
        }

        $page = filter_var(
            $pageValue,
            FILTER_VALIDATE_INT,
            ['options' => ['min_range' => 1]],
        );

        $limit = filter_var(
            $limitValue,
            FILTER_VALIDATE_INT,
            ['options' => ['min_range' => 1, 'max_range' => 100]],
        );

        if ($page === false || $limit === false) {
            return new JsonResponse(
                ['error' => [
                    'message' => 'Page must be positive and limit must be between 1 and 100.',
                ]],
                Response::HTTP_BAD_REQUEST,
            );
        }

        if ($page - 1 > intdiv(PHP_INT_MAX, $limit)) {
            return new JsonResponse(
                ['error' => ['message' => 'Requested page is too large.']],
                Response::HTTP_BAD_REQUEST,
            );
        }

        $result = $this->stockMovementRepository->findForProduct(
            $product,
            $page,
            $limit,
        );

        $data = [];

        foreach ($result['items'] as $movement) {
            $data[] = [
                'id' => $movement->getId(),
                'productId' => $product->getId(),
                'type' => $movement->getType()->value,
                'quantity' => $movement->getQuantity(),
                'createdAt' => $movement->getCreatedAt()->format(DATE_ATOM),
            ];
        }

        return new JsonResponse([
            'data' => $data,
            'meta' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $result['total'],
                'totalPages' => (int) ceil($result['total'] / $limit),
            ],
        ]);
    }

    private function readQuantity(
        Request $request,
        ValidatorInterface $validator,
    ): StockQuantityInput|JsonResponse {
        try {
            $payload = json_decode(
                $request->getContent(),
                flags: JSON_THROW_ON_ERROR,
            );
        } catch (JsonException) {
            return new JsonResponse(
                ['error' => ['message' => 'Request body must contain valid JSON.']],
                Response::HTTP_BAD_REQUEST,
            );
        }

        if (!$payload instanceof stdClass) {
            return new JsonResponse(
                ['error' => ['message' => 'Request body must be a JSON object.']],
                Response::HTTP_BAD_REQUEST,
            );
        }

        if (!isset($payload->quantity) || !is_int($payload->quantity)) {
            return new JsonResponse(
                ['error' => ['message' => 'Quantity must be provided as an integer.']],
                Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        }

        $input = new StockQuantityInput($payload->quantity);
        $violations = $validator->validate($input);

        if (count($violations) > 0) {
            $details = [];

            foreach ($violations as $violation) {
                $details[] = [
                    'field' => $violation->getPropertyPath(),
                    'message' => $violation->getMessage(),
                ];
            }

            return new JsonResponse(
                ['error' => [
                    'message' => 'Validation failed.',
                    'details' => $details,
                ]],
                Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        }

        return $input;
    }
}
