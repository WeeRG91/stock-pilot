<?php

declare(strict_types=1);

namespace App\Tests\Service;

use App\Service\InventoryUpdatePublisher;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use RuntimeException;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;

final class InventoryUpdatePublisherTest extends TestCase
{
    public function testPublishesAPrivateMovementNotification(): void
    {
        $hub = $this->createMock(HubInterface::class);
        $logger = $this->createMock(LoggerInterface::class);

        $hub->expects(self::once())
            ->method('publish')
            ->with(self::callback(
                static function (Update $update): bool {
                    self::assertTrue($update->isPrivate());
                    self::assertSame(
                        ['urn:stockpilot:inventory'],
                        $update->getTopics(),
                    );
                    self::assertSame(
                        'urn:stockpilot:movement:42',
                        $update->getId(),
                    );
                    self::assertSame(
                        [
                            'type' => 'inventory.changed',
                            'productId' => 2,
                            'movementId' => 42,
                        ],
                        json_decode(
                            $update->getData(),
                            true,
                            flags: JSON_THROW_ON_ERROR,
                        ),
                    );

                    return true;
                },
            ))
            ->willReturn('hub-event-id');

        $logger->expects(self::never())->method('warning');

        $publisher = new InventoryUpdatePublisher($hub, $logger);
        $publisher->publishMovement(2, 42);
    }

    public function testLogsPublicationFailureWithoutThrowing(): void
    {
        $hub = $this->createMock(HubInterface::class);
        $logger = $this->createMock(LoggerInterface::class);

        $hub->expects(self::once())
            ->method('publish')
            ->willThrowException(
                new RuntimeException('Internal connection details'),
            );

        $logger->expects(self::once())
            ->method('warning')
            ->with(
                'Committed stock movement notification could not be published.',
                [
                    'productId' => 2,
                    'movementId' => 42,
                ],
            );

        $publisher = new InventoryUpdatePublisher($hub, $logger);
        $publisher->publishMovement(2, 42);
    }
}