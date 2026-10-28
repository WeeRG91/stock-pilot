<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Csrf\CsrfToken;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
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

    #[Route(
        '/api/auth/logout',
        name: 'api_auth_logout',
        methods: ['POST'],
    )]
    public function logout(
        Request $request,
        #[CurrentUser] ?User $user,
        CsrfTokenManagerInterface $csrfTokenManager,
        Security $security,
    ): Response {
        if ($user === null) {
            return $this->userResponse(null);
        }

        $csrfToken = new CsrfToken(
            'logout',
            $request->headers->get('X-CSRF-TOKEN'),
        );

        if (!$csrfTokenManager->isTokenValid($csrfToken)) {
            return new JsonResponse(
                ['error' => ['message' => 'Invalid CSRF token.']],
                Response::HTTP_FORBIDDEN,
                ['Cache-Control' => 'no-store, private'],
            );
        }

        $response = $security->logout(validateCsrfToken: false)
            ?? new Response();

        $response->setStatusCode(Response::HTTP_OK);
        $response->headers->remove('Location');
        $response->headers->set('Content-Type', 'application/json');
        $response->headers->set('Cache-Control', 'no-store, private');
        $response->setContent('{"data":{"message":"Logged out."}}');

        return $response;
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
