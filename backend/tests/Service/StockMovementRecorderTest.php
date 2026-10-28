<?php

declare(strict_types=1);

namespace App\Tests\Service;

use App\Entity\StockMovement;
use App\Repository\StockMovementRepository;
use App\Service\InventoryUpdatePublisher;
use App\Service\StockMovementRecorder;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;
use DomainException;
use LogicException;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use RuntimeException;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;

final class StockMovementRecorderTest extends TestCase
{
    #[DataProvider('recordingMethods')]
    public function testPublishesOnlyAfterTheTransactionWrapperCompletes(
        string $method,
    ): void {
        $connection = $this->createStub(Connection::class);
        $connection->method('isTransactionActive')->willReturn(false);

        $movement = $this->createStub(StockMovement::class);
        $movement->method('getId')->willReturn(42);

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('getConnection')->willReturn($connection);

        $transactionCompleted = false;

        $entityManager->expects(self::once())
            ->method('wrapInTransaction')
            ->willReturnCallback(
                static function (callable $callback) use (
                    &$transactionCompleted,
                    $movement,
                ): StockMovement {
                    // Model the successful return after Doctrine commits.
                    $transactionCompleted = true;

                    return $movement;
                },
            );

        $hub = $this->createMock(HubInterface::class);
        $hub->expects(self::once())
            ->method('publish')
            ->with(self::callback(
                static function (Update $update) use (
                    &$transactionCompleted,
                ): bool {
                    self::assertTrue($transactionCompleted);

                    $payload = json_decode(
                        $update->getData(),
                        true,
                        flags: JSON_THROW_ON_ERROR,
                    );

                    self::assertSame(2, $payload['productId']);
                    self::assertSame(42, $payload['movementId']);

                    return true;
                },
            ))
            ->willReturn('event-id');

        $publisher = new InventoryUpdatePublisher(
            $hub,
            $this->createStub(LoggerInterface::class),
        );

        $repository = new StockMovementRepository(
            $this->createStub(ManagerRegistry::class),
        );

        $recorder = new StockMovementRecorder(
            $entityManager,
            $repository,
            $publisher,
        );

        self::assertSame($movement, $recorder->$method(2, 1));
    }

    public static function recordingMethods(): iterable
    {
        yield 'stock in' => ['recordStockIn'];
        yield 'stock out' => ['recordStockOut'];
    }

    #[DataProvider('recordingMethods')]
    public function testDoesNotPublishWhenTheProductIsMissing(
        string $method,
    ): void {
        $connection = $this->createStub(Connection::class);
        $connection->method('isTransactionActive')->willReturn(false);

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('getConnection')->willReturn($connection);
        $entityManager->expects(self::once())
            ->method('wrapInTransaction')
            ->willReturn(null);

        $hub = $this->createMock(HubInterface::class);
        $hub->expects(self::never())->method('publish');

        $recorder = $this->createRecorder($entityManager, $hub);

        self::assertNull($recorder->$method(2, 1));
    }

    #[DataProvider('recordingMethods')]
    public function testDoesNotPublishWhenTheTransactionFails(
        string $method,
    ): void {
        $connection = $this->createStub(Connection::class);
        $connection->method('isTransactionActive')->willReturn(false);

        $failure = new DomainException('Movement rejected.');

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('getConnection')->willReturn($connection);
        $entityManager->expects(self::once())
            ->method('wrapInTransaction')
            ->willThrowException($failure);

        $hub = $this->createMock(HubInterface::class);
        $hub->expects(self::never())->method('publish');

        $recorder = $this->createRecorder($entityManager, $hub);

        $this->expectExceptionObject($failure);

        $recorder->$method(2, 1);
    }

    private function createRecorder(
        EntityManagerInterface $entityManager,
        HubInterface $hub,
    ): StockMovementRecorder {
        return new StockMovementRecorder(
            $entityManager,
            new StockMovementRepository(
                $this->createStub(ManagerRegistry::class),
            ),
            new InventoryUpdatePublisher(
                $hub,
                $this->createStub(LoggerInterface::class),
            ),
        );
    }

    #[DataProvider('recordingMethods')]
    public function testRejectsAnExistingTransaction(
        string $method,
    ): void {
        $connection = $this->createStub(Connection::class);
        $connection->method('isTransactionActive')->willReturn(true);

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('getConnection')->willReturn($connection);
        $entityManager->expects(self::never())
            ->method('wrapInTransaction');

        $hub = $this->createMock(HubInterface::class);
        $hub->expects(self::never())->method('publish');

        $recorder = $this->createRecorder($entityManager, $hub);

        $this->expectException(LogicException::class);
        $this->expectExceptionMessage(
            'Stock recording must start outside an existing transaction.',
        );

        $recorder->$method(2, 1);
    }

    #[DataProvider('recordingMethods')]
    public function testReturnsTheMovementWhenPublicationFails(
        string $method,
    ): void {
        $connection = $this->createStub(Connection::class);
        $connection->method('isTransactionActive')->willReturn(false);

        $movement = $this->createStub(StockMovement::class);
        $movement->method('getId')->willReturn(42);

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('getConnection')->willReturn($connection);
        $entityManager->expects(self::once())
            ->method('wrapInTransaction')
            ->willReturn($movement);

        $hub = $this->createMock(HubInterface::class);
        $hub->expects(self::once())
            ->method('publish')
            ->willThrowException(new RuntimeException('Hub unavailable.'));

        $recorder = $this->createRecorder($entityManager, $hub);

        self::assertSame($movement, $recorder->$method(2, 1));
    }
}
