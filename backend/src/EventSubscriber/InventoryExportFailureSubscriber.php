<?php

declare(strict_types=1);

namespace App\EventSubscriber;

use App\Enum\InventoryExportStatus;
use App\Message\GenerateInventoryExport;
use Doctrine\DBAL\Connection;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Messenger\Event\WorkerMessageFailedEvent;

final class InventoryExportFailureSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly Connection $connection,
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [
            WorkerMessageFailedEvent::class => ['onMessageFailed', -200],
        ];
    }

    public function onMessageFailed(WorkerMessageFailedEvent $event): void
    {
        if ($event->willRetry()) {
            return;
        }

        $message = $event->getEnvelope()->getMessage();

        if (!$message instanceof GenerateInventoryExport) {
            return;
        }

        $this->connection->executeStatement(
            <<<'SQL'
                UPDATE inventory_exports
                SET status = :failed
                WHERE id = :id
                  AND status <> :ready
                SQL,
            [
                'failed' => InventoryExportStatus::Failed->value,
                'ready' => InventoryExportStatus::Ready->value,
                'id' => $message->exportId,
            ],
        );
    }
}