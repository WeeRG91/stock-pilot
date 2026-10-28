<?php

declare(strict_types=1);

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Throwable;

final class InventoryUpdatePublisher
{
    public function __construct(
        private readonly HubInterface $hub,
        private readonly LoggerInterface $logger,
    ) {}

    public function publishMovement(
        int $productId,
        int $movementId,
    ): void {
        try {
            $this->hub->publish(new Update(
                topics: 'urn:stockpilot:inventory',
                data: json_encode([
                    'type' => 'inventory.changed',
                    'productId' => $productId,
                    'movementId' => $movementId,
                ], JSON_THROW_ON_ERROR),
                private: true,
                id: sprintf('urn:stockpilot:movement:%d', $movementId),
            ));
        } catch (Throwable) {
            $this->logger->warning(
                'Committed stock movement notification could not be published.',
                [
                    'productId' => $productId,
                    'movementId' => $movementId,
                ],
            );
        }
    }
}
