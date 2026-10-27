<?php

declare(strict_types=1);

namespace App\Tests\Entity;

use App\Entity\User;
use PHPUnit\Framework\TestCase;

final class UserSerializationTest extends TestCase
{
    public function testSerializesFingerprintInsteadOfPasswordHash(): void
    {
        $user = new User('developer@example.com');
        $hash = password_hash(
            'unit-test-password',
            PASSWORD_BCRYPT,
            ['cost' => 4],
        );
        $user->setPasswordHash($hash);

        $serialized = serialize($user);

        self::assertStringNotContainsString($hash, $serialized);
        self::assertSame($hash, $user->getPassword());

        $restored = unserialize(
            $serialized,
            ['allowed_classes' => [User::class]],
        );

        self::assertInstanceOf(User::class, $restored);
        self::assertSame(
            hash('crc32c', $hash),
            $restored->getPassword(),
        );
    }

    public function testPreservesUserIdentityAndRoles(): void
    {
        $user = new User(' Developer@Example.com ');

        $restored = unserialize(
            serialize($user),
            ['allowed_classes' => [User::class]],
        );

        self::assertInstanceOf(User::class, $restored);
        self::assertNull($restored->getId());
        self::assertSame(
            'developer@example.com',
            $restored->getUserIdentifier(),
        );
        self::assertSame(['ROLE_USER'], $restored->getRoles());
    }

    public function testPreservesNullWhenNoPasswordIsAssigned(): void
    {
        $user = new User('developer@example.com');

        $restored = unserialize(
            serialize($user),
            ['allowed_classes' => [User::class]],
        );

        self::assertInstanceOf(User::class, $restored);
        self::assertNull($restored->getPassword());
    }
}
