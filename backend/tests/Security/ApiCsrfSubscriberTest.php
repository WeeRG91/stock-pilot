<?php

declare(strict_types=1);

namespace App\Tests\Security;

use App\EventSubscriber\ApiCsrfSubscriber;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ControllerEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Component\Security\Csrf\CsrfToken;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;

final class ApiCsrfSubscriberTest extends TestCase
{
    public function testRejectsAMissingTokenBeforeRunningTheController(): void
    {
        $tokenManager = $this->createMock(CsrfTokenManagerInterface::class);

        $tokenManager->expects(self::once())
            ->method('isTokenValid')
            ->with(self::callback(
                static fn(CsrfToken $token): bool =>
                $token->getId() === 'api'
                    && $token->getValue() === '',
            ))
            ->willReturn(false);

        $request = Request::create('/api/products', 'POST');
        $request->attributes->set('_route', 'api_products_create');

        $originalController = static function (): Response {
            self::fail('The inventory controller must not run.');
        };

        $event = new ControllerEvent(
            $this->createStub(HttpKernelInterface::class),
            $originalController,
            $request,
            HttpKernelInterface::MAIN_REQUEST,
        );

        (new ApiCsrfSubscriber($tokenManager))->onKernelController($event);

        $response = ($event->getController())();

        self::assertSame(403, $response->getStatusCode());
        self::assertJsonStringEqualsJsonString(
            '{"error":{"message":"Invalid CSRF token."}}',
            $response->getContent(),
        );
        self::assertTrue(
            $response->headers->hasCacheControlDirective('no-store'),
        );
    }

    public function testAllowsAMutationWithAValidApiToken(): void
    {
        $tokenManager = $this->createMock(CsrfTokenManagerInterface::class);

        $tokenManager->expects(self::once())
            ->method('isTokenValid')
            ->with(self::callback(
                static fn(CsrfToken $token): bool =>
                $token->getId() === 'api'
                    && $token->getValue() === 'valid-api-token',
            ))
            ->willReturn(true);

        $request = Request::create(
            '/api/products/1',
            'PUT',
            server: ['HTTP_X_CSRF_TOKEN' => 'valid-api-token'],
        );
        $request->attributes->set('_route', 'api_products_update');

        $expectedResponse = new Response('controller reached');
        $originalController = static fn(): Response => $expectedResponse;

        $event = new ControllerEvent(
            $this->createStub(HttpKernelInterface::class),
            $originalController,
            $request,
            HttpKernelInterface::MAIN_REQUEST,
        );

        (new ApiCsrfSubscriber($tokenManager))->onKernelController($event);

        self::assertSame($originalController, $event->getController());
        self::assertSame($expectedResponse, ($event->getController())());
    }

    #[DataProvider('excludedRequests')]
    public function testSkipsExcludedRequests(
        string $method,
        string $path,
        string $route,
        int $requestType,
    ): void {
        $tokenManager = $this->createMock(CsrfTokenManagerInterface::class);

        $tokenManager->expects(self::never())
            ->method('isTokenValid');

        $request = Request::create($path, $method);
        $request->attributes->set('_route', $route);

        $originalController = static fn(): Response => new Response();

        $event = new ControllerEvent(
            $this->createStub(HttpKernelInterface::class),
            $originalController,
            $request,
            $requestType,
        );

        (new ApiCsrfSubscriber($tokenManager))->onKernelController($event);

        self::assertSame($originalController, $event->getController());
    }

    public static function excludedRequests(): iterable
    {
        yield 'GET read' => [
            'GET',
            '/api/products',
            'api_products_index',
            HttpKernelInterface::MAIN_REQUEST,
        ];

        yield 'HEAD read' => [
            'HEAD',
            '/api/products',
            'api_products_index',
            HttpKernelInterface::MAIN_REQUEST,
        ];

        yield 'non-API request' => [
            'POST',
            '/contact',
            'contact',
            HttpKernelInterface::MAIN_REQUEST,
        ];

        yield 'login uses its own CSRF intent' => [
            'POST',
            '/api/auth/login',
            'api_auth_login',
            HttpKernelInterface::MAIN_REQUEST,
        ];

        yield 'logout uses its own CSRF intent' => [
            'POST',
            '/api/auth/logout',
            'api_auth_logout',
            HttpKernelInterface::MAIN_REQUEST,
        ];

        yield 'subrequest' => [
            'POST',
            '/api/products',
            'api_products_create',
            HttpKernelInterface::SUB_REQUEST,
        ];
    }
}
