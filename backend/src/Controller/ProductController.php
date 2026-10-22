<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Product;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Response;
use App\Dto\ProductDetailsInput;
use App\Repository\ProductRepository;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

final class ProductController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly ProductRepository $productRepository,
    ) {}

    #[Route('/api/products', name: 'api_products_index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $query = $request->query->all();
        $search = $query['search'] ?? '';

        if (!is_string($search)) {
            return new JsonResponse(
                ['error' => ['message' => 'Search must be a string.']],
                Response::HTTP_BAD_REQUEST,
            );
        }

        $active = null;

        if (array_key_exists('active', $query)) {
            $activeValue = $query['active'];

            if (!in_array($activeValue, ['true', 'false'], true)) {
                return new JsonResponse(
                    ['error' => ['message' => 'Active must be true or false.']],
                    Response::HTTP_BAD_REQUEST,
                );
            }

            $active = $activeValue === 'true';
        }

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
                ['error' => ['message' => 'Page must be positive and limit must be between 1 and 100.']],
                Response::HTTP_BAD_REQUEST,
            );
        }

        if ($page - 1 > intdiv(PHP_INT_MAX, $limit)) {
            return new JsonResponse(
                ['error' => ['message' => 'Requested page is too large.']],
                Response::HTTP_BAD_REQUEST,
            );
        }

        $result = $this->productRepository->findForListing(
            $search,
            $active,
            $page,
            $limit,
        );

        $data = [];

        foreach ($result['items'] as $product) {
            $data[] = [
                'id' => $product->getId(),
                'name' => $product->getName(),
                'sku' => $product->getSku(),
                'active' => $product->isActive(),
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
