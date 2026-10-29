<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\InventoryExportStatus;
use Doctrine\ORM\Mapping as ORM;
use LogicException;

#[ORM\Entity]
#[ORM\Table(name: 'inventory_exports')]
class InventoryExport
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(enumType: InventoryExportStatus::class)]
    private InventoryExportStatus $status = InventoryExportStatus::Pending;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStatus(): InventoryExportStatus
    {
        return $this->status;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getFilename(): string
    {
        if ($this->id === null) {
            throw new LogicException('Export must be persisted first.');
        }

        return sprintf('inventory-export-%d.csv', $this->id);
    }

    public function markReady(): void
    {
        $this->status = InventoryExportStatus::Ready;
    }

    public function markFailed(): void
    {
        if ($this->status === InventoryExportStatus::Ready) {
            return;
        }

        $this->status = InventoryExportStatus::Failed;
    }
}
