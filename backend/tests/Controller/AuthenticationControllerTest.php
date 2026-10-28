<?php

declare(strict_types=1);

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class AuthenticationControllerTest extends WebTestCase
{
    public function testAnonymousUserCannotGetAccountDetails(): void
    {
        $client = self::createClient();
        $client->request('GET', '/api/auth/me');

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

    public function testLoginWithoutCsrfTokenIsRejected(): void
    {
        $client = self::createClient();
        $client->jsonRequest('POST', '/api/auth/login', [
            'email' => 'developer@example.com',
            'password' => 'not-the-real-password',
        ]);

        self::assertResponseStatusCodeSame(403);
        self::assertJsonStringEqualsJsonString(
            '{"error":{"message":"Invalid CSRF token."}}',
            $client->getResponse()->getContent(),
        );
        self::assertTrue(
            $client->getResponse()->headers->hasCacheControlDirective('no-store'),
        );

        $client->request('GET', '/api/auth/me');

        self::assertResponseStatusCodeSame(401);
    }

    public function testAnonymousUserCannotLogOut(): void
    {
        $client = self::createClient();
        $client->request('POST', '/api/auth/logout');

        self::assertResponseStatusCodeSame(401);
        self::assertJsonStringEqualsJsonString(
            '{"error":{"message":"Authentication required."}}',
            $client->getResponse()->getContent(),
        );
        self::assertTrue(
            $client->getResponse()->headers->hasCacheControlDirective('no-store'),
        );
    }
}
