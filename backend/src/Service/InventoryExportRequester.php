<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\InventoryExport;
use App\Message\GenerateInventoryExport;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Messenger\MessageBusInterface;

final class InventoryExportRequester
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly MessageBusInterface $bus,
    ) {}

    public function request(): int
    {
        return $this->entityManager->wrapInTransaction(
            function (): int {
                $export = new InventoryExport();

                $this->entityManager->persist($export);
                $this->entityManager->flush();

                $exportId = $export->getId();

                if ($exportId === null) {
                    throw new \LogicException('Export ID was not generated.');
                }

                $this->bus->dispatch(
                    new GenerateInventoryExport($exportId),
                );

                return $exportId;
            }
        );
    }
}
