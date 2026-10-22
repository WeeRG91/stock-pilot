<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Product;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Response;
use App\Dto\ProductDetailsInput;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

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
                'active' => $product->isActive(),
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
                'active' => $product->isActive(),
            ],
        ]);
    }

    #[Route('/api/products', name: 'api_products_create', methods: ['POST'])]
    public function create(
        Request $request,
        ValidatorInterface $validator,
        UrlGeneratorInterface $urlGenerator,
    ): JsonResponse {
        $input = $this->readProductDetails($request, $validator);

        if ($input instanceof JsonResponse) {
            return $input;
        }

        $product = new Product($input->name, $input->sku);

        try {
            $this->entityManager->persist($product);
            $this->entityManager->flush();
        } catch (UniqueConstraintViolationException) {
            return new JsonResponse(
                ['error' => ['message' => 'A product with this SKU already exists.']],
                Response::HTTP_CONFLICT,
            );
        }

        return new JsonResponse(
            [
                'data' => [
                    'id' => $product->getId(),
                    'name' => $product->getName(),
                    'sku' => $product->getSku(),
                    'active' => $product->isActive(),
                ],
            ],
            Response::HTTP_CREATED,
            [
                'Location' => $urlGenerator->generate(
                    'api_products_show',
                    ['id' => $product->getId()],
                ),
            ],
        );
    }

    #[Route(
        '/api/products/{id}',
        name: 'api_products_update',
        requirements: ['id' => '\d+'],
        methods: ['PUT'],
    )]
    public function update(
        int $id,
        Request $request,
        ValidatorInterface $validator,
    ): JsonResponse {
        $product = $this->entityManager->find(Product::class, $id);

        if ($product === null) {
            return new JsonResponse(
                ['error' => ['message' => 'Product not found.']],
                Response::HTTP_NOT_FOUND,
            );
        }

        $input = $this->readProductDetails($request, $validator);

        if ($input instanceof JsonResponse) {
            return $input;
        }

        $product->updateDetails($input->name, $input->sku);

        try {
            $this->entityManager->flush();
        } catch (UniqueConstraintViolationException) {
            return new JsonResponse(
                ['error' => ['message' => 'A product with this SKU already exists.']],
                Response::HTTP_CONFLICT,
            );
        }

        return new JsonResponse([
            'data' => [
                'id' => $product->getId(),
                'name' => $product->getName(),
                'sku' => $product->getSku(),
                'active' => $product->isActive(),
            ],
        ]);
    }

    #[Route(
        '/api/products/{id}/activate',
        name: 'api_products_activate',
        requirements: ['id' => '\d+'],
        methods: ['POST'],
    )]
    public function activate(int $id): JsonResponse
    {
        return $this->changeActivation($id, true);
    }

    #[Route(
        '/api/products/{id}/deactivate',
        name: 'api_products_deactivate',
        requirements: ['id' => '\d+'],
        methods: ['POST'],
    )]
    public function deactivate(int $id): JsonResponse
    {
        return $this->changeActivation($id, false);
    }

    private function readProductDetails(
        Request $request,
        ValidatorInterface $validator,
    ): ProductDetailsInput|JsonResponse {
        try {
            $payload = json_decode(
                $request->getContent(),
                associative: false,
                flags: JSON_THROW_ON_ERROR,
            );
        } catch (\JsonException) {
            return new JsonResponse(
                ['error' => ['message' => 'Request body must contain valid JSON.']],
                Response::HTTP_BAD_REQUEST,
            );
        }

        if (!$payload instanceof \stdClass) {
            return new JsonResponse(
                ['error' => ['message' => 'Request body must be a JSON object.']],
                Response::HTTP_BAD_REQUEST,
            );
        }

        if (
            !isset($payload->name, $payload->sku)
            || !is_string($payload->name)
            || !is_string($payload->sku)
        ) {
            return new JsonResponse(
                ['error' => ['message' => 'Name and SKU must be provided as strings.']],
                Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        }

        $input = new ProductDetailsInput($payload->name, $payload->sku);
        $violations = $validator->validate($input);

        if (count($violations) > 0) {
            $errors = [];

            foreach ($violations as $violation) {
                $errors[] = [
                    'field' => $violation->getPropertyPath(),
                    'message' => $violation->getMessage(),
                ];
            }

            return new JsonResponse(
                [
                    'error' => [
                        'message' => 'Validation failed.',
                        'details' => $errors,
                    ],
                ],
                Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        }

        return $input;
    }

    private function changeActivation(int $id, bool $active): JsonResponse
    {
        $product = $this->entityManager->find(Product::class, $id);

        if ($product === null) {
            return new JsonResponse(
                ['error' => ['message' => 'Product not found.']],
                Response::HTTP_NOT_FOUND,
            );
        }

        if ($active) {
            $product->activate();
        } else {
            $product->deactivate();
        }

        $this->entityManager->flush();

        return new JsonResponse([
            'data' => [
                'id' => $product->getId(),
                'name' => $product->getName(),
                'sku' => $product->getSku(),
                'active' => $product->isActive(),
            ],
        ]);
    }
}
