<?php

declare(strict_types=1);

namespace App\Tests\Security;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\Storage\MockArraySessionStorage;
use Symfony\Component\Security\Csrf\CsrfToken;

final class CsrfTokenManagerTest extends KernelTestCase
{
    public function testBindsTokensToTheirSessionAndIntent(): void
    {
        self::bootKernel();

        $container = static::getContainer();
        $tokenManager = $container->get('test.csrf_token_manager');
        $requestStack = $container->get('request_stack');

        $firstSession = new Session(new MockArraySessionStorage());

        $request = Request::create('/api/auth/csrf/authenticate');
        $request->setSession($firstSession);
        $requestStack->push($request);

        try {
            $value = $tokenManager
                ->getToken('authenticate')
                ->getValue();

            self::assertTrue(
                $tokenManager->isTokenValid(
                    new CsrfToken('authenticate', $value),
                ),
            );

            self::assertFalse(
                $tokenManager->isTokenValid(
                    new CsrfToken('logout', $value),
                ),
            );

            $request->setSession(
                new Session(new MockArraySessionStorage()),
            );

            self::assertFalse(
                $tokenManager->isTokenValid(
                    new CsrfToken('authenticate', $value),
                ),
            );

            $request->setSession($firstSession);

            self::assertTrue(
                $tokenManager->isTokenValid(
                    new CsrfToken('authenticate', $value),
                ),
            );
        } finally {
            $requestStack->pop();
        }
    }
}