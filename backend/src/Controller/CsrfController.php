<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;

final class CsrfController
{
    #[Route(
        '/api/auth/csrf/{intent}',
        name: 'api_auth_csrf',
        requirements: ['intent' => 'authenticate|logout|api'],
        methods: ['GET'],
    )]
    public function token(
        string $intent,
        CsrfTokenManagerInterface $tokenManager,
    ): JsonResponse {
        $token = $tokenManager->getToken($intent);

        return new JsonResponse(
            ['data' => [
                'intent' => $intent,
                'token' => $token->getValue(),
            ]],
            headers: [
                'Cache-Control' => 'no-store, private',
            ],
        );
    }
}
