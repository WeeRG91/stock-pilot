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

    public function testRecordsStockOutWhenStockIsSufficient(): void
    {
        $product = new Product('Ergonomic Keyboard', 'KEYBOARD-002');

        $movement = StockMovement::stockOut(
            product: $product,
            quantity: 4,
            availableStock: 15,
        );

        self::assertNull($movement->getId());
        self::assertSame($product, $movement->getProduct());
        self::assertSame(StockMovementType::Out, $movement->getType());
        self::assertSame(4, $movement->getQuantity());
    }

    public function testAllowsStockOutEqualToAvailableStock(): void
    {
        $product = new Product('Ergonomic Keyboard', 'KEYBOARD-002');

        $movement = StockMovement::stockOut(
            product: $product,
            quantity: 15,
            availableStock: 15,
        );

        self::assertSame(StockMovementType::Out, $movement->getType());
        self::assertSame(15, $movement->getQuantity());
    }

    public function testRejectsStockOutExceedingAvailableStock(): void
    {
        $product = new Product('Ergonomic Keyboard', 'KEYBOARD-002');

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('Insufficient stock.');

        StockMovement::stockOut(
            product: $product,
            quantity: 16,
            availableStock: 15,
        );
    }

    public function testRejectsStockOutWhenNoStockIsAvailable(): void
    {
        $product = new Product('Ergonomic Keyboard', 'KEYBOARD-002');

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('Insufficient stock.');

        StockMovement::stockOut(
            product: $product,
            quantity: 1,
            availableStock: 0,
        );
    }

    public function testRejectsStockOutWithZeroQuantity(): void
    {
        $product = new Product('Ergonomic Keyboard', 'KEYBOARD-002');

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Movement quantity must be positive.');

        StockMovement::stockOut(
            product: $product,
            quantity: 0,
            availableStock: 15,
        );
    }

    public function testRejectsStockOutWithNegativeQuantity(): void
    {
        $product = new Product('Ergonomic Keyboard', 'KEYBOARD-002');

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Movement quantity must be positive.');

        StockMovement::stockOut(
            product: $product,
            quantity: -4,
            availableStock: 15,
        );
    }

    public function testRejectsStockOutForAnInactiveProduct(): void
    {
        $product = new Product('Ergonomic Keyboard', 'KEYBOARD-002');
        $product->deactivate();

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage(
            'Cannot record stock movements for an inactive product.',
        );

        StockMovement::stockOut(
            product: $product,
            quantity: 4,
            availableStock: 15,
        );
    }

    public function testRejectsNegativeAvailableStock(): void
    {
        $product = new Product('Ergonomic Keyboard', 'KEYBOARD-002');

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Available stock must not be negative.');

        StockMovement::stockOut(
            product: $product,
            quantity: 4,
            availableStock: -1,
        );
    }
}
