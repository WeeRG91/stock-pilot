<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use DateTimeImmutable;
use DateTimeZone;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mercure\Authorization;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Jwt\Grant;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

final class RealtimeAuthorizationController
{
    #[Route(
        '/api/realtime/authorize',
        name: 'api_realtime_authorize',
        methods: ['POST'],
    )]
    public function authorize(
        Request $request,
        #[CurrentUser] ?User $user,
        Authorization $authorization,
        HubInterface $hub,
    ): JsonResponse {
        if ($user === null || $user->getId() === null) {
            return new JsonResponse(
                ['error' => ['message' => 'Authentication required.']],
                Response::HTTP_UNAUTHORIZED,
                ['Cache-Control' => 'no-store, private'],
            );
        }

        $topic = 'urn:stockpilot:inventory';
        $expiresAt = new DateTimeImmutable(
            '+60 seconds',
            new DateTimeZone('UTC'),
        );

        $cookie = $authorization->createCookie(
            request: $request,
            grants: [
                new Grant(
                    actions: [Grant::ACTION_SUBSCRIBE],
                    topics: [$topic],
                ),
            ],
            additionalClaims: [
                'sub' => sprintf('stockpilot-user:%d', $user->getId()),
                'client_id' => 'stockpilot-frontend',
                'exp' => $expiresAt,
            ],
        );

        $response = new JsonResponse(
            ['data' => [
                'hubUrl' => $hub->getPublicUrl(),
                'topic' => $topic,
                'expiresAt' => $expiresAt->format(DATE_ATOM),
            ]],
            headers: ['Cache-Control' => 'no-store, private'],
        );

        $response->headers->setCookie($cookie);

        return $response;
    }
}