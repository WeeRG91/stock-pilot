<?php

declare(strict_types=1);

namespace App\Controller;

use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class HealthController
{
    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly string $applicationName,
    ) {}

    #[Route('/api/health', name: 'api_health', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $this->logger->info('Application health endpoint requested.');

        return new JsonResponse([
            'status' => 'ok',
            'application' => $this->applicationName,
        ]);
    }
}