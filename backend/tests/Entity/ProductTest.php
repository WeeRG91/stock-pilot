<?php

declare(strict_types=1);

namespace App\Tests\Entity;

use App\Entity\Product;
use PHPUnit\Framework\TestCase;

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
}
