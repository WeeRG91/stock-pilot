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
}