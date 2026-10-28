<?php

declare(strict_types=1);

namespace App\Tests\Security;

use PHPUnit\Framework\Attributes\DataProvider;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class ApiAccessTest extends WebTestCase
{
    #[DataProvider('protectedEndpoints')]
    public function testRequiresAuthentication(
        string $method,
        string $path,
    ): void {
        $client = self::createClient();
        $client->request($method, $path);

        self::assertResponseStatusCodeSame(401);
        self::assertResponseHeaderSame('Content-Type', 'application/json');
        self::assertJsonStringEqualsJsonString(
            '{"error":{"message":"Authentication required."}}',
            $client->getResponse()->getContent(),
        );
        self::assertTrue(
            $client->getResponse()->headers->hasCacheControlDirective('no-store'),
        );
    }

    public static function protectedEndpoints(): iterable
    {
        yield 'dashboard' => ['GET', '/api/dashboard'];
        yield 'product list' => ['GET', '/api/products'];
        yield 'product detail' => ['GET', '/api/products/1'];
        yield 'create product' => ['POST', '/api/products'];
        yield 'update product' => ['PUT', '/api/products/1'];
        yield 'activate product' => ['POST', '/api/products/1/activate'];
        yield 'deactivate product' => ['POST', '/api/products/1/deactivate'];
        yield 'current stock' => ['GET', '/api/products/1/stock'];
        yield 'movement history' => ['GET', '/api/products/1/movements'];
        yield 'stock in' => ['POST', '/api/products/1/stock-in'];
        yield 'stock out' => ['POST', '/api/products/1/stock-out'];
        yield 'read threshold' => [
            'GET',
            '/api/products/1/low-stock-threshold',
        ];
        yield 'update threshold' => [
            'PUT',
            '/api/products/1/low-stock-threshold',
        ];
    }
}