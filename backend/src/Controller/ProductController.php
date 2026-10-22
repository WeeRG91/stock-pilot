<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Product;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Response;
use App\Dto\CreateProductInput;
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

    #[Route('/api/products', name: 'api_products_create', methods: ['POST'])]
    public function create(
        Request $request,
        ValidatorInterface $validator,
        UrlGeneratorInterface $urlGenerator,
    ): JsonResponse {
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

        $input = new CreateProductInput($payload->name, $payload->sku);
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
}
