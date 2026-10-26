<?php

declare(strict_types=1);

namespace App\Tests\Entity;

use App\Entity\Product;
use App\Entity\StockMovement;
use App\Enum\StockMovementType;
use PHPUnit\Framework\TestCase;
use DomainException;
use InvalidArgumentException;

final class StockMovementTest extends TestCase
{
    public function testRecordsStockInForAnActiveProduct(): void
    {
        $product = new Product('Ergonomic Keyboard', 'KEYBOARD-002');

        $movement = StockMovement::stockIn($product, 10);

        self::assertNull($movement->getId());
        self::assertSame($product, $movement->getProduct());
        self::assertSame(StockMovementType::In, $movement->getType());
        self::assertSame(10, $movement->getQuantity());
        self::assertSame(
            'UTC',
            $movement->getCreatedAt()->getTimezone()->getName(),
        );
    }

    public function testRejectsZeroQuantity(): void
    {
        $product = new Product('Ergonomic Keyboard', 'KEYBOARD-002');

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Movement quantity must be positive.');

        StockMovement::stockIn($product, 0);
    }

    public function testRejectsNegativeQuantity(): void
    {
        $product = new Product('Ergonomic Keyboard', 'KEYBOARD-002');

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Movement quantity must be positive.');

        StockMovement::stockIn($product, -5);
    }

    public function testRejectsStockInForAnInactiveProduct(): void
    {
        $product = new Product('Ergonomic Keyboard', 'KEYBOARD-002');
        $product->deactivate();

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage(
            'Cannot record stock movements for an inactive product.',
        );

        StockMovement::stockIn($product, 10);
    }
}
