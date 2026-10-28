<?php

declare(strict_types=1);

namespace App\Tests\Controller;

use App\Controller\RealtimeAuthorizationController;
use App\Entity\User;
use DateTimeImmutable;
use Lcobucci\JWT\Encoding\JoseEncoder;
use Lcobucci\JWT\Token\Parser;
use Lcobucci\JWT\UnencryptedToken;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mercure\Authorization;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\HubRegistry;
use Symfony\Component\Mercure\Jwt\DefaultClaimsTokenFactory;
use Symfony\Component\Mercure\Jwt\LcobucciFactory;

final class RealtimeAuthorizationControllerTest extends TestCase
{
    public function testIssuesAShortLivedHttpOnlyCookie(): void
    {
        $before = time();
        $response = $this->authorizeUser();
        $after = time();

        self::assertSame(200, $response->getStatusCode());
        self::assertTrue(
            $response->headers->hasCacheControlDirective('no-store'),
        );

        $cookies = $response->headers->getCookies();
        self::assertCount(1, $cookies);

        $cookie = $cookies[0];

        self::assertSame('mercure_access_token', $cookie->getName());
        self::assertTrue($cookie->isHttpOnly());
        self::assertFalse($cookie->isSecure()); // Local HTTP hub.
        self::assertSame(Cookie::SAMESITE_STRICT, $cookie->getSameSite());
        self::assertSame('/.well-known/mercure', $cookie->getPath());
        self::assertGreaterThanOrEqual($before + 60, $cookie->getExpiresTime());
        self::assertLessThanOrEqual($after + 60, $cookie->getExpiresTime());

        $payload = json_decode(
            $response->getContent(),
            true,
            flags: JSON_THROW_ON_ERROR,
        );

        self::assertSame(
            'http://127.0.0.1:8081/.well-known/mercure',
            $payload['data']['hubUrl'],
        );
        self::assertSame(
            'urn:stockpilot:inventory',
            $payload['data']['topic'],
        );
        self::assertStringNotContainsString(
            $cookie->getValue(),
            $response->getContent(),
        );
    }

    private function authorizeUser(): JsonResponse
    {
        $factory = new DefaultClaimsTokenFactory(
            new LcobucciFactory(str_repeat('test-key-', 8)),
            [
                'iss' => 'http://127.0.0.1:8000',
                'aud' => 'http://127.0.0.1:8081/.well-known/mercure',
                'sub' => 'stockpilot-backend',
                'client_id' => 'stockpilot-backend',
            ],
        );

        $hub = $this->createStub(HubInterface::class);
        $hub->method('getFactory')->willReturn($factory);
        $hub->method('getPublicUrl')->willReturn(
            'http://127.0.0.1:8081/.well-known/mercure',
        );
        $hub->method('getCookieName')->willReturn('mercure_access_token');

        $user = $this->createStub(User::class);
        $user->method('getId')->willReturn(1);

        return (new RealtimeAuthorizationController())->authorize(
            Request::create(
                'http://127.0.0.1:8000/api/realtime/authorize',
                'POST',
            ),
            $user,
            new Authorization(new HubRegistry($hub)),
            $hub,
        );
    }

    public function testTokenGrantsOnlyInventorySubscription(): void
    {
        $response = $this->authorizeUser();
        $cookie = $response->headers->getCookies()[0];

        $token = (new Parser(new JoseEncoder()))->parse($cookie->getValue());

        self::assertInstanceOf(UnencryptedToken::class, $token);
        self::assertSame('at+jwt', $token->headers()->get('typ'));

        $claims = $token->claims();

        self::assertSame(
            'http://127.0.0.1:8000',
            $claims->get('iss'),
        );
        self::assertSame(
            ['http://127.0.0.1:8081/.well-known/mercure'],
            $claims->get('aud'),
        );
        self::assertSame('stockpilot-user:1', $claims->get('sub'));
        self::assertSame('stockpilot-frontend', $claims->get('client_id'));

        self::assertSame(
            [
                [
                    'type' => 'https://mercure.rocks/authorization-detail',
                    'actions' => ['subscribe'],
                    'topics' => [
                        ['match' => 'urn:stockpilot:inventory'],
                    ],
                ],
            ],
            $claims->get('authorization_details'),
        );

        self::assertNotEmpty($claims->get('jti'));

        $expiresAt = $claims->get('exp');

        self::assertInstanceOf(DateTimeImmutable::class, $expiresAt);
        self::assertSame(
            $cookie->getExpiresTime(),
            $expiresAt->getTimestamp(),
        );

        $payload = json_decode(
            $response->getContent(),
            true,
            flags: JSON_THROW_ON_ERROR,
        );

        self::assertSame(
            $expiresAt->getTimestamp(),
            (new DateTimeImmutable($payload['data']['expiresAt']))->getTimestamp(),
        );
    }
}
