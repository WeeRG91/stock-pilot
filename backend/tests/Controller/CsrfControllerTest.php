<?php

declare(strict_types=1);

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class CsrfControllerTest extends WebTestCase
{
    public function testProvidesAnUncachedTokenAndSessionCookie(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/auth/csrf/authenticate');

        self::assertResponseIsSuccessful();
        self::assertResponseHeaderSame(
            'Content-Type',
            'application/json',
        );

        $payload = json_decode(
            $client->getResponse()->getContent(),
            associative: true,
            flags: JSON_THROW_ON_ERROR,
        );

        self::assertSame('authenticate', $payload['data']['intent']);
        self::assertNotEmpty($payload['data']['token']);
        self::assertNotNull(
            $client->getCookieJar()->get('MOCKSESSID'),
        );
        self::assertTrue(
            $client->getResponse()->headers
                ->hasCacheControlDirective('no-store'),
        );
    }

    public function testRejectsAnUnsupportedIntent(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/auth/csrf/unknown');

        self::assertResponseStatusCodeSame(404);
    }
}