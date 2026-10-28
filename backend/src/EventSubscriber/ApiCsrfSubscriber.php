<?php

declare(strict_types=1);

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ControllerEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Security\Csrf\CsrfToken;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;

final class ApiCsrfSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly CsrfTokenManagerInterface $tokenManager,
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::CONTROLLER => 'onKernelController',
        ];
    }

    public function onKernelController(ControllerEvent $event): void
    {
        $request = $event->getRequest();

        if (
            !$event->isMainRequest() ||
            $request->isMethodSafe() ||
            !str_starts_with($request->getPathInfo(), '/api/')
        ) {
            return;
        }

        if (in_array(
            $request->attributes->get('_route'),
            ['api_auth_login', 'api_auth_logout'],
            true,
        )) {
            return;
        }

        $token = new CsrfToken(
            'api',
            $request->headers->get('X-CSRF-TOKEN'),
        );

        if ($this->tokenManager->isTokenValid($token)) {
            return;
        }

        $event->setController(static fn(): JsonResponse => new JsonResponse(
            ['error' => ['message' => 'Invalid CSRF token.']],
            Response::HTTP_FORBIDDEN,
            ['Cache-Control' => 'no-store, private'],
        ));
    }
}
