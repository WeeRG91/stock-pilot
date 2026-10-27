<?php

declare(strict_types=1);

namespace App\Controller;

use App\Dto\LowStockThresholdInput;
use App\Repository\ProductRepository;
use Doctrine\ORM\EntityManagerInterface;
use JsonException;
use stdClass;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

final class LowStockThresholdController
{
    public function __construct(
        private readonly ProductRepository $productRepository,
        private readonly EntityManagerInterface $entityManager,
    ) {}

    #[Route(
        '/api/products/{id}/low-stock-threshold',
        name: 'api_products_low_stock_threshold_update',
        requirements: ['id' => '\d+'],
        methods: ['PUT'],
    )]
    public function update(
        int $id,
        Request $request,
        ValidatorInterface $validator,
    ): JsonResponse {
        $product = $this->productRepository->find($id);

        if ($product === null) {
            return new JsonResponse(
                ['error' => ['message' => 'Product not found.']],
                Response::HTTP_NOT_FOUND,
            );
        }

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

        if (!isset($payload->threshold) || !is_int($payload->threshold)) {
            return new JsonResponse(
                ['error' => ['message' => 'Threshold must be provided as an integer.']],
                Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        }

        $input = new LowStockThresholdInput($payload->threshold);
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

        $product->updateLowStockThreshold($input->threshold);
        $this->entityManager->flush();

        return new JsonResponse([
            'data' => [
                'productId' => $product->getId(),
                'threshold' => $product->getLowStockThreshold(),
            ],
        ]);
    }
}
