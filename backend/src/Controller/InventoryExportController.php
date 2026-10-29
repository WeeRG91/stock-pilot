<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\InventoryExport;
use App\Enum\InventoryExportStatus;
use App\Service\InventoryExportRequester;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Attribute\Route;

final class InventoryExportController
{
    public function __construct(
        private readonly InventoryExportRequester $exportRequester,
        private readonly EntityManagerInterface $entityManager,
        #[Autowire('%kernel.project_dir%')]
        private readonly string $projectDir,
    ) {}

    #[Route(
        '/api/inventory-exports',
        name: 'api_inventory_exports_index',
        methods: ['GET'],
    )]
    public function index(): JsonResponse
    {
        $exports = $this->entityManager
            ->getRepository(InventoryExport::class)
            ->findBy([], ['id' => 'DESC'], 20);

        $data = array_map(
            static fn(InventoryExport $export): array => [
                'id' => $export->getId(),
                'status' => $export->getStatus()->value,
                'createdAt' => $export->getCreatedAt()->format(
                    \DateTimeInterface::ATOM,
                ),
            ],
            $exports,
        );

        return new JsonResponse(
            ['data' => $data],
            Response::HTTP_OK,
            ['Cache-Control' => 'no-store, private'],
        );
    }

    #[Route(
        '/api/inventory-exports/{id}',
        name: 'api_inventory_exports_show',
        requirements: ['id' => '\d+'],
        methods: ['GET'],
    )]
    public function show(int $id): JsonResponse
    {
        $export = $this->entityManager->find(InventoryExport::class, $id);

        if ($export === null) {
            return new JsonResponse(
                ['error' => ['message' => 'Inventory export not found.']],
                Response::HTTP_NOT_FOUND,
                ['Cache-Control' => 'no-store, private'],
            );
        }

        return new JsonResponse(
            ['data' => [
                'id' => $export->getId(),
                'status' => $export->getStatus()->value,
                'createdAt' => $export->getCreatedAt()->format(\DateTimeInterface::ATOM),
            ]],
            Response::HTTP_OK,
            ['Cache-Control' => 'no-store, private'],
        );
    }

    #[Route(
        '/api/inventory-exports',
        name: 'api_inventory_exports_create',
        methods: ['POST'],
    )]
    public function create(): JsonResponse
    {
        $exportId = $this->exportRequester->request();

        return new JsonResponse(
            ['data' => [
                'id' => $exportId,
            ]],
            Response::HTTP_ACCEPTED,
        );
    }

    #[Route(
        '/api/inventory-exports/{id}/download',
        name: 'api_inventory_exports_download',
        requirements: ['id' => '\d+'],
        methods: ['GET'],
    )]
    public function download(int $id): Response
    {
        $export = $this->entityManager->find(InventoryExport::class, $id);

        if ($export === null) {
            return new JsonResponse(
                ['error' => ['message' => 'Inventory export not found.']],
                Response::HTTP_NOT_FOUND,
                ['Cache-Control' => 'no-store, private'],
            );
        }

        if ($export->getStatus() !== InventoryExportStatus::Ready) {
            return new JsonResponse(
                ['error' => ['message' => 'Inventory export is not ready.']],
                Response::HTTP_CONFLICT,
                ['Cache-Control' => 'no-store, private'],
            );
        }

        $path = $this->projectDir . '/var/' . $export->getFilename();

        if (!is_file($path)) {
            return new JsonResponse(
                ['error' => ['message' => 'Export file is unavailable.']],
                Response::HTTP_NOT_FOUND,
                ['Cache-Control' => 'no-store, private'],
            );
        }

        $response = new BinaryFileResponse($path);

        $response->headers->set('Content-Type', 'text/csv; charset=UTF-8');
        $response->headers->set('Cache-Control', 'no-store, private');

        $response->setContentDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            $export->getFilename(),
        );

        return $response;
    }
}
