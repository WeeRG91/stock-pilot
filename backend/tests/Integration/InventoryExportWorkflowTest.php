<?php

declare(strict_types=1);

namespace App\Tests\Integration;

use App\Controller\InventoryExportController;
use App\Entity\InventoryExport;
use App\Entity\Product;
use App\Entity\StockMovement;
use App\EventSubscriber\InventoryExportFailureSubscriber;
use App\Message\GenerateInventoryExport;
use App\MessageHandler\GenerateInventoryExportHandler;
use App\Repository\ProductRepository;
use App\Service\InventoryExportRequester;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\DriverManager;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\ORMSetup;
use Doctrine\ORM\Tools\SchemaTool;
use Doctrine\Persistence\ManagerRegistry;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;
use Symfony\Component\DependencyInjection\ServiceLocator;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\Messenger\Bridge\Doctrine\Transport\Connection as QueueConnection;
use Symfony\Component\Messenger\Bridge\Doctrine\Transport\DoctrineTransport;
use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\EventListener\SendFailedMessageForRetryListener;
use Symfony\Component\Messenger\EventListener\SendFailedMessageToFailureTransportListener;
use Symfony\Component\Messenger\EventListener\StopWorkerOnMessageLimitListener;
use Symfony\Component\Messenger\Handler\HandlersLocator;
use Symfony\Component\Messenger\MessageBus;
use Symfony\Component\Messenger\Middleware\HandleMessageMiddleware;
use Symfony\Component\Messenger\Middleware\SendMessageMiddleware;
use Symfony\Component\Messenger\Retry\MultiplierRetryStrategy;
use Symfony\Component\Messenger\Transport\Sender\SendersLocator;
use Symfony\Component\Messenger\Transport\Serialization\PhpSerializer;
use Symfony\Component\Messenger\Worker;

/** Real ORM, database queue, worker and filesystem; never uses DATABASE_URL. */
final class InventoryExportWorkflowTest extends TestCase
{
    private Connection $connection;
    private EntityManager $entityManager;
    private DoctrineTransport $async;
    private DoctrineTransport $failed;
    private MessageBus $bus;
    private GenerateInventoryExportHandler $handler;
    private InventoryExportRequester $requester;
    private string $directory;

    protected function setUp(): void
    {
        $this->directory = sys_get_temp_dir() . '/stockpilot-export-test-' . bin2hex(random_bytes(8));
        mkdir($this->directory . '/var', 0777, true);
        $this->connection = DriverManager::getConnection([
            'driver' => 'pdo_sqlite',
            'memory' => true,
        ]);
        $configuration = ORMSetup::createAttributeMetadataConfig([dirname(__DIR__, 2) . '/src/Entity'], true);
        $configuration->setProxyDir($this->directory . '/var');
        $configuration->setProxyNamespace('StockPilotTestProxies');
        $configuration->setAutoGenerateProxyClasses(\Doctrine\ORM\Proxy\ProxyFactory::AUTOGENERATE_EVAL);
        $this->entityManager = new EntityManager($this->connection, $configuration);
        (new SchemaTool($this->entityManager))->createSchema(array_map(
            $this->entityManager->getClassMetadata(...),
            [InventoryExport::class, Product::class, StockMovement::class],
        ));

        $this->async = $this->transport('default');
        $this->async->setup();
        $this->failed = $this->transport('failed');

        $registry = $this->createStub(ManagerRegistry::class);
        $registry->method('getManagerForClass')->willReturn($this->entityManager);
        $this->handler = new GenerateInventoryExportHandler(
            new NullLogger(),
            new ProductRepository($registry),
            $this->directory,
            $this->entityManager,
        );
        $this->bus = $this->bus($this->handler);
        $this->requester = new InventoryExportRequester($this->entityManager, $this->bus);
    }

    protected function tearDown(): void
    {
        $this->entityManager->close();
        $this->connection->close();
        // Only files in this test's randomly named, flat export directory.
        foreach (glob($this->directory . '/var/*') as $file) {
            unlink($file);
        }
        rmdir($this->directory . '/var');
        rmdir($this->directory);
    }

    public function testRequestPersistsPendingExportAndQueuesItsIdWithoutGeneratingFile(): void
    {
        $id = $this->requester->request();

        self::assertSame('pending', $this->exportStatus($id));
        self::assertSame(1, $this->async->getMessageCount());
        $messages = iterator_to_array($this->async->all());
        self::assertSame($id, array_values($messages)[0]->getMessage()->exportId);
        self::assertSame([], glob($this->directory . '/var/*'));
    }

    public function testQueueInsertAndExportRecordRollBackTogetherWhenDispatchFails(): void
    {
        // Insert a real queue row, then simulate a dispatch failure before commit.
        $failingBus = new MessageBus([
            new class($this->async) implements \Symfony\Component\Messenger\Middleware\MiddlewareInterface {
                public function __construct(private DoctrineTransport $transport) {}

                public function handle(Envelope $envelope, \Symfony\Component\Messenger\Middleware\StackInterface $stack): Envelope
                {
                    $this->transport->send($envelope);
                    throw new \RuntimeException('Dispatch interrupted.');
                }
            },
        ]);

        try {
            (new InventoryExportRequester($this->entityManager, $failingBus))->request();
            self::fail('Dispatch should fail.');
        } catch (\RuntimeException $exception) {
            self::assertSame('Dispatch interrupted.', $exception->getMessage());
        }

        self::assertSame(0, (int) $this->connection->fetchOne('SELECT COUNT(*) FROM inventory_exports'));
        self::assertSame(0, $this->async->getMessageCount());
    }

    public function testWorkerGeneratesCorrectCsvIncludingProductsWithoutMovements(): void
    {
        $product = new Product('Mouse, "Pro"', 'MOUSE');
        $emptyProduct = new Product('No movements', 'EMPTY');
        $this->entityManager->persist($product);
        $this->entityManager->persist($emptyProduct);
        $this->entityManager->persist(StockMovement::stockIn($product, 10));
        $this->entityManager->persist(StockMovement::stockOut($product, 3, 10));
        $this->entityManager->flush();
        $id = $this->requester->request();

        $this->work();

        self::assertSame('ready', $this->exportStatus($id));
        self::assertSame(0, $this->async->getMessageCount());
        $file = fopen($this->path($id), 'rb');
        try {
            self::assertSame(['sku', 'name', 'stock'], fgetcsv($file, null, ',', '"', ''));
            self::assertSame(['MOUSE', 'Mouse, "Pro"', '7'], fgetcsv($file, null, ',', '"', ''));
            self::assertSame(['EMPTY', 'No movements', '0'], fgetcsv($file, null, ',', '"', ''));
            self::assertFalse(fgetcsv($file, null, ',', '"', ''));
        } finally {
            fclose($file);
        }
        self::assertSame([$this->path($id)], glob($this->directory . '/var/*'));
    }

    public function testDuplicateDeliveryDoesNotRewriteCompletedExport(): void
    {
        $id = $this->requester->request();
        $this->work();
        file_put_contents($this->path($id), 'Previously completed export');
        $this->bus->dispatch(new GenerateInventoryExport($id));

        $this->work();

        self::assertSame('Previously completed export', file_get_contents($this->path($id)));
        self::assertSame(0, $this->async->getMessageCount());
    }

    public function testWritingFailureCleansTemporaryFileAndPreservesPreviousFile(): void
    {
        $id = $this->requester->request();
        file_put_contents($this->path($id), 'Previous complete CSV');
        // Fail the real repository query after the handler has written its header.
        $this->connection->executeStatement('DROP TABLE stock_movements');

        $this->work();

        self::assertSame('pending', $this->exportStatus($id));
        self::assertSame('Previous complete CSV', file_get_contents($this->path($id)));
        self::assertSame([$this->path($id)], glob($this->directory . '/var/*'));
        self::assertSame(1, $this->async->getMessageCount());
        self::assertSame(0, $this->failed->getMessageCount());
    }

    public function testRetriesKeepPendingThenMarkFailedAndManualRecoveryMakesReady(): void
    {
        $id = $this->requester->request();
        $failingBus = $this->bus(static function (GenerateInventoryExport $message): void {
            throw new \RuntimeException('Simulated generation failure.');
        });

        $this->work($failingBus);
        self::assertSame('pending', $this->exportStatus($id));
        self::assertSame(1, $this->async->getMessageCount());
        self::assertSame(0, $this->failed->getMessageCount());

        $this->work($failingBus);
        self::assertSame('failed', $this->exportStatus($id));
        self::assertSame(0, $this->async->getMessageCount());
        self::assertSame(1, $this->failed->getMessageCount());

        $messages = iterator_to_array($this->failed->get());
        $envelope = array_values($messages)[0];
        $this->bus->dispatch($envelope->getMessage());
        $this->failed->ack($envelope);
        $this->entityManager->clear();
        $this->work();

        self::assertSame('ready', $this->exportStatus($id));
        self::assertFileExists($this->path($id));
        self::assertSame(0, $this->failed->getMessageCount());
    }

    public function testMissingExportGoesStraightToFailureTransport(): void
    {
        $this->bus->dispatch(new GenerateInventoryExport(999));
        $this->work();

        self::assertSame(0, $this->async->getMessageCount());
        self::assertSame(1, $this->failed->getMessageCount());
        self::assertSame([], glob($this->directory . '/var/*'));
    }

    public function testControllerRejectsPendingDownloadThenServesReadyFileAndListsNewestFirst(): void
    {
        $controller = new InventoryExportController($this->requester, $this->entityManager, $this->directory);
        $id = $this->requester->request();
        self::assertSame(409, $controller->download($id)->getStatusCode());
        self::assertSame(404, $controller->download(999)->getStatusCode());

        $this->work();
        $response = $controller->download($id);
        self::assertInstanceOf(BinaryFileResponse::class, $response);
        self::assertSame($this->path($id), $response->getFile()->getPathname());
        self::assertStringContainsString('attachment;', $response->headers->get('Content-Disposition'));
        self::assertTrue($response->headers->hasCacheControlDirective('no-store'));

        $newId = $this->requester->request();
        $payload = json_decode($controller->index()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        self::assertSame([$newId, $id], array_column($payload['data'], 'id'));

        unlink($this->path($id));
        self::assertSame(404, $controller->download($id)->getStatusCode());
    }

    private function transport(string $queue): DoctrineTransport
    {
        return new DoctrineTransport(
            new QueueConnection(['queue_name' => $queue, 'auto_setup' => false], $this->connection),
            new PhpSerializer(),
        );
    }

    private function bus(callable $handler): MessageBus
    {
        return new MessageBus([
            new SendMessageMiddleware(new SendersLocator(
                [GenerateInventoryExport::class => ['async']],
                new ServiceLocator(['async' => fn () => $this->async]),
            )),
            new HandleMessageMiddleware(new HandlersLocator([
                GenerateInventoryExport::class => [$handler],
            ])),
        ]);
    }

    private function work(?MessageBus $bus = null): void
    {
        $dispatcher = new EventDispatcher();
        $dispatcher->addSubscriber(new SendFailedMessageForRetryListener(
            new ServiceLocator(['async' => fn () => $this->async]),
            new ServiceLocator(['async' => static fn () => new MultiplierRetryStrategy(1, 0)]),
        ));
        $dispatcher->addSubscriber(new SendFailedMessageToFailureTransportListener(
            new ServiceLocator(['async' => fn () => $this->failed]),
        ));
        $dispatcher->addSubscriber(new InventoryExportFailureSubscriber($this->connection));
        $dispatcher->addSubscriber(new StopWorkerOnMessageLimitListener(1));
        (new Worker(['async' => $this->async], $bus ?? $this->bus, $dispatcher))->run([
            'sleep' => 0,
            'time_limit' => 2,
        ]);
    }

    private function exportStatus(int $id): string
    {
        return $this->connection->fetchOne('SELECT status FROM inventory_exports WHERE id = ?', [$id]);
    }

    private function path(int $id): string
    {
        return $this->directory . '/var/inventory-export-' . $id . '.csv';
    }
}