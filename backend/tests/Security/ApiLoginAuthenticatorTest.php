<?php

declare(strict_types=1);

namespace App\Tests\Security;

use App\Security\ApiLoginAuthenticator;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\CsrfTokenBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Credentials\PasswordCredentials;
use PHPUnit\Framework\Attributes\DataProvider;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\InvalidCsrfTokenException;
use Symfony\Component\Security\Core\Exception\TooManyLoginAttemptsAuthenticationException;

final class ApiLoginAuthenticatorTest extends TestCase
{
    public function testSupportsOnlyTheLoginPostRoute(): void
    {
        $authenticator = new ApiLoginAuthenticator();

        $request = Request::create('/api/auth/login', 'POST');
        $request->attributes->set('_route', 'api_auth_login');

        self::assertTrue($authenticator->supports($request));

        $request->setMethod('GET');

        self::assertFalse($authenticator->supports($request));

        $request->setMethod('POST');
        $request->attributes->set('_route', 'api_auth_me');

        self::assertFalse($authenticator->supports($request));
    }

    public function testBuildsPassportWithoutTrimmingThePassword(): void
    {
        $request = Request::create(
            '/api/auth/login',
            'POST',
            server: [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_CSRF_TOKEN' => 'test-csrf-token',
            ],
            content: json_encode([
                'email' => ' Developer@Example.COM ',
                'password' => ' password with spaces ',
            ], JSON_THROW_ON_ERROR),
        );

        $passport = (new ApiLoginAuthenticator())->authenticate($request);

        $user = $passport->getBadge(UserBadge::class);
        self::assertInstanceOf(UserBadge::class, $user);
        self::assertSame('developer@example.com', $user->getUserIdentifier());

        $credentials = $passport->getBadge(PasswordCredentials::class);
        self::assertInstanceOf(PasswordCredentials::class, $credentials);
        self::assertSame(
            ' password with spaces ',
            $credentials->getPassword(),
        );

        $csrf = $passport->getBadge(CsrfTokenBadge::class);
        self::assertInstanceOf(CsrfTokenBadge::class, $csrf);
        self::assertSame('authenticate', $csrf->getCsrfTokenId());
        self::assertSame('test-csrf-token', $csrf->getCsrfToken());
    }

    #[DataProvider('invalidPayloads')]
    public function testRejectsInvalidPayloads(string $body): void
    {
        $request = Request::create(
            '/api/auth/login',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: $body,
        );

        $this->expectException(BadCredentialsException::class);

        (new ApiLoginAuthenticator())->authenticate($request);
    }

    public static function invalidPayloads(): iterable
    {
        yield 'malformed JSON' => ['{"email":'];
        yield 'null' => ['null'];
        yield 'array' => ['[]'];
        yield 'missing fields' => ['{}'];

        yield 'numeric email' => [
            '{"email":123,"password":"test-password"}',
        ];

        yield 'numeric password' => [
            '{"email":"developer@example.com","password":123}',
        ];

        yield 'invalid email' => [
            '{"email":"not-an-email","password":"test-password"}',
        ];

        yield 'empty password' => [
            '{"email":"developer@example.com","password":""}',
        ];

        yield 'oversized password' => [
            json_encode([
                'email' => 'developer@example.com',
                'password' => str_repeat('a', 129),
            ], JSON_THROW_ON_ERROR),
        ];

        yield 'oversized email' => [
            json_encode([
                'email' => str_repeat('a', 170) . '@example.com',
                'password' => 'test-password',
            ], JSON_THROW_ON_ERROR),
        ];
    }

    #[DataProvider('authenticationFailures')]
    public function testReturnsSafeUncachedErrors(
        AuthenticationException $exception,
        int $expectedStatus,
        string $expectedMessage,
    ): void {
        $response = (new ApiLoginAuthenticator())->onAuthenticationFailure(
            Request::create('/api/auth/login', 'POST'),
            $exception,
        );

        self::assertNotNull($response);
        self::assertSame($expectedStatus, $response->getStatusCode());
        self::assertSame(
            ['error' => ['message' => $expectedMessage]],
            json_decode($response->getContent(), true, flags: JSON_THROW_ON_ERROR),
        );
        self::assertTrue($response->headers->hasCacheControlDirective('no-store'));
        self::assertTrue($response->headers->hasCacheControlDirective('private'));
    }

    public static function authenticationFailures(): iterable
    {
        yield 'invalid credentials' => [
            new BadCredentialsException('Internal credential details'),
            401,
            'Invalid email or password.',
        ];

        yield 'invalid CSRF token' => [
            new InvalidCsrfTokenException('Internal token details'),
            403,
            'Invalid CSRF token.',
        ];

        yield 'login throttled' => [
            new TooManyLoginAttemptsAuthenticationException(),
            429,
            'Too many login attempts. Please try again later.',
        ];
    }
}
