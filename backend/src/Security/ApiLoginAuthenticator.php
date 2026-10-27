<?php

declare(strict_types=1);

namespace App\Security;

use JsonException;
use Override;
use stdClass;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Core\Exception\InvalidCsrfTokenException;
use Symfony\Component\Security\Core\Exception\TooManyLoginAttemptsAuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\CsrfTokenBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Credentials\PasswordCredentials;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;

final class ApiLoginAuthenticator extends AbstractAuthenticator
{
    public function supports(Request $request): ?bool
    {
        return $request->isMethod('POST')
            && $request->attributes->get('_route') === 'api_auth_login';
    }

    public function authenticate(Request $request): Passport
    {
        try {
            $payload = json_decode(
                $request->getContent(),
                flags: JSON_THROW_ON_ERROR,
            );
        } catch (JsonException) {
            throw new BadCredentialsException();
        }

        if (
            !$payload instanceof stdClass ||
            !isset($payload->email, $payload->password) ||
            !is_string($payload->email) ||
            !is_string($payload->password)
        ) {
            throw new BadCredentialsException();
        }

        $email = strtolower(trim($payload->email));
        $password = $payload->password;

        if (
            strlen($email) > 180 ||
            filter_var($email, FILTER_VALIDATE_EMAIL) === false ||
            $password === '' ||
            mb_strlen($password) > 128
        ) {
            throw new BadCredentialsException();
        }

        return new Passport(
            new UserBadge($email),
            new PasswordCredentials($password),
            [
                new CsrfTokenBadge(
                    'authenticate',
                    $request->headers->get('X-CSRF-TOKEN'),
                ),
            ],
        );
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        if ($exception instanceof InvalidCsrfTokenException) {
            $status = Response::HTTP_FORBIDDEN;
            $message = 'Invalid CSRF token.';
        } elseif ($exception instanceof TooManyLoginAttemptsAuthenticationException) {
            $status = Response::HTTP_TOO_MANY_REQUESTS;
            $message = 'Too many login attempts. Please try again later.';
        } else {
            $status = Response::HTTP_UNAUTHORIZED;
            $message = 'Invalid email or password.';
        }

        return new JsonResponse(
            ['error' => ['message' => $message]],
            $status,
            ['Cache-Control' => 'no-store, private'],
        );
    }
}
