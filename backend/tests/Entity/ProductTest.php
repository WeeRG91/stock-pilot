<?php

declare(strict_types=1);

namespace App\Tests\Entity;

use App\Entity\Product;
use PHPUnit\Framework\TestCase;
use InvalidArgumentException;

final class ProductTest extends TestCase
{
    public function testNewProductHasSuppliedDetailsAndNoId(): void
    {
        $product = new Product('Wireless Mouse', 'MOUSE-001');

        self::assertNull($product->getId());
        self::assertSame('Wireless Mouse', $product->getName());
        self::assertSame('MOUSE-001', $product->getSku());
    }

    public function testUpdatesProductDetails(): void
    {
        $product = new Product('Wireless Mouse', 'MOUSE-001');

        $product->updateDetails('Ergonomic Mouse', 'MOUSE-002');

        self::assertSame('Ergonomic Mouse', $product->getName());
        self::assertSame('MOUSE-002', $product->getSku());
        self::assertNull($product->getId());
    }

    public function testNewProductIsActive(): void
    {
        $product = new Product('Wireless Mouse', 'MOUSE-001');

        self::assertTrue($product->isActive());
    }

    public function testCanDeactivateAndReactivateProduct(): void
    {
        $product = new Product('Wireless Mouse', 'MOUSE-001');

        $product->deactivate();
        self::assertFalse($product->isActive());

        $product->deactivate();
        self::assertFalse($product->isActive());

        $product->activate();
        self::assertTrue($product->isActive());

        $product->activate();
        self::assertTrue($product->isActive());
    }

    public function testNewProductHasZeroLowStockThreshold(): void
    {
        $product = new Product('Wireless Mouse', 'MOUSE-001');

        self::assertSame(0, $product->getLowStockThreshold());
    }

    public function testUpdatesLowStockThreshold(): void
    {
        $product = new Product('Wireless Mouse', 'MOUSE-001');

        $product->updateLowStockThreshold(5);

        self::assertSame(5, $product->getLowStockThreshold());
    }

    public function testCanResetLowStockThresholdToZero(): void
    {
        $product = new Product('Wireless Mouse', 'MOUSE-001');
        $product->updateLowStockThreshold(5);

        $product->updateLowStockThreshold(0);

        self::assertSame(0, $product->getLowStockThreshold());
    }

    public function testAcceptsMaximumLowStockThreshold(): void
    {
        $product = new Product('Wireless Mouse', 'MOUSE-001');

        $product->updateLowStockThreshold(2147483647);

        self::assertSame(2147483647, $product->getLowStockThreshold());
    }

    public function testRejectsNegativeLowStockThreshold(): void
    {
        $product = new Product('Wireless Mouse', 'MOUSE-001');

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage(
            'Low-stock threshold must be between 0 and 2147483647.',
        );

        $product->updateLowStockThreshold(-1);
    }

    public function testRejectsLowStockThresholdAboveDatabaseMaximum(): void
    {
        $product = new Product('Wireless Mouse', 'MOUSE-001');

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage(
            'Low-stock threshold must be between 0 and 2147483647.',
        );

        $product->updateLowStockThreshold(2147483648);
    }
}
