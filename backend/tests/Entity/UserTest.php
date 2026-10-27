<?php

declare(strict_types=1);

namespace App\Tests\Entity;

use App\Entity\User;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

final class UserTest extends TestCase
{
    public function testNormalizesEmailAndHasNoId(): void
    {
        $user = new User(' Developer@Example.com ');

        self::assertNull($user->getId());
        self::assertSame('developer@example.com', $user->getEmail());
        self::assertSame(
            'developer@example.com',
            $user->getUserIdentifier(),
        );
    }

    public function testProvidesTheDefaultUserRole(): void
    {
        $user = new User('developer@example.com');

        self::assertSame(['ROLE_USER'], $user->getRoles());
    }

    public function testNewUserHasNoPasswordHash(): void
    {
        $user = new User('developer@example.com');

        self::assertNull($user->getPassword());
    }

    public function testStoresTheProvidedPasswordHash(): void
    {
        $user = new User('developer@example.com');

        $hash = password_hash(
            'unit-test-password',
            PASSWORD_BCRYPT,
            ['cost' => 4],
        );

        $user->setPasswordHash($hash);

        self::assertSame($hash, $user->getPassword());
    }

    public function testRejectsInvalidEmail(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage(
            'A valid email address of at most 180 characters is required.',
        );

        new User('not-an-email');
    }

    public function testRejectsEmptyPasswordHash(): void
    {
        $user = new User('developer@example.com');

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage(
            'Password hash must not be empty.',
        );

        $user->setPasswordHash('');
    }
}