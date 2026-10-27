<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

final class AuthenticationController
{
    #[Route(
        '/api/auth/login',
        name: 'api_auth_login',
        methods: ['POST'],
    )]
    public function login(#[CurrentUser] ?User $user): JsonResponse
    {
        return $this->userResponse($user);
    }

    #[Route(
        '/api/auth/me',
        name: 'api_auth_me',
        methods: ['GET'],
    )]
    public function me(#[CurrentUser] ?User $user): JsonResponse
    {
        return $this->userResponse($user);
    }

    private function userResponse(?User $user): JsonResponse
    {
        if ($user === null) {
            return new JsonResponse(
                ['error' => ['message' => 'Authentication required.']],
                Response::HTTP_UNAUTHORIZED,
                ['Cache-Control' => 'no-store, private'],
            );
        }

        return new JsonResponse(
            ['data' => [
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'roles' => $user->getRoles(),
                ],
            ]],
            headers: ['Cache-Control' => 'no-store, private'],
        );
    }
}
