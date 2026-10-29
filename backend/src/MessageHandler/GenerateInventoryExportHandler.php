<?php

declare(strict_types=1);

namespace App\MessageHandler;

use App\Entity\InventoryExport;
use App\Enum\InventoryExportStatus;
use App\Message\GenerateInventoryExport;
use App\Repository\ProductRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Messenger\Exception\UnrecoverableMessageHandlingException;

#[AsMessageHandler]
final class GenerateInventoryExportHandler
{
    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly ProductRepository $productRepository,
        #[Autowire('%kernel.project_dir%')]
        private readonly string $projectDir,
        private readonly EntityManagerInterface $entityManager,
    ) {}

    public function __invoke(GenerateInventoryExport $message): void
    {
        $export = $this->entityManager->find(
            InventoryExport::class,
            $message->exportId,
        );

        if ($export === null) {
            throw new UnrecoverableMessageHandlingException(
                sprintf('Export #%d does not exist.', $message->exportId),
            );
        }

        if ($export->getStatus() === InventoryExportStatus::Ready) {
            return;
        }

        $path = $this->projectDir . '/var/' . $export->getFilename();

        $temporaryPath = tempnam(
            $this->projectDir . '/var',
            'inventory-export-',
        );

        if ($temporaryPath === false) {
            throw new \RuntimeException('Cannot create a temporary export file.');
        }

        $file = fopen($temporaryPath, 'wb');

        if ($file === false) {
            unlink($temporaryPath);

            throw new \RuntimeException('Cannot open the export file.');
        }

        try {
            try {
                if (fputcsv($file, ['sku', 'name', 'stock'], ',', '"', '') === false) {
                    throw new \RuntimeException('Cannot write the CSV header.');
                }

                $rows = $this->productRepository->findInventoryExportRows();

                foreach ($rows as $row) {
                    if (fputcsv($file, [
                        $row['sku'],
                        $row['name'],
                        $row['stock'],
                    ], ',', '"', '') === false) {
                        throw new \RuntimeException('Cannot write the export row.');
                    }
                }

                if (!fflush($file)) {
                    throw new \RuntimeException('Cannot flush the export file.');
                }
            } finally {
                fclose($file);
            }

            if (!rename($temporaryPath, $path)) {
                throw new \RuntimeException('Cannot publish the export file.');
            }
        } finally {
            if (is_file($temporaryPath)) {
                unlink($temporaryPath);
            }
        }

        $export->markReady();
        $this->entityManager->flush();

        $this->logger->warning('Inventory export generated.', [
            'path' => $path,
        ]);
    }
}
