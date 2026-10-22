<?php

declare(strict_types=1);

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class HealthControllerTest extends WebTestCase
{
    public function testHealthEndpointReturnsApplicationStatus(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/health');

        self::assertResponseStatusCodeSame(200);
        self::assertResponseHeaderSame(
            'Content-Type',
            'application/json',
        );

        $content = $client->getResponse()->getContent();

        self::assertNotFalse($content);

        $data = json_decode($content, true, 512, JSON_THROW_ON_ERROR);

        self::assertSame([
            'status' => 'ok',
            'application' => 'StockPilot',
        ], $data);
    }
}