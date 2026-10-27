<?php

declare(strict_types=1);

namespace App\Tests\Security;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

final class UserPasswordHasherTest extends KernelTestCase
{
    public function testHashesAndVerifiesUserPasswords(): void
    {
        self::bootKernel();

        $hasher = static::getContainer()->get('test.user_password_hasher');

        $user = new User('developer@example.com');
        $plaintextPassword = 'Example-password-for-tests';

        $hash = $hasher->hashPassword($user, $plaintextPassword);
        $user->setPasswordHash($hash);

        self::assertNotSame($plaintextPassword, $hash);
        self::assertTrue(
            $hasher->isPasswordValid($user, $plaintextPassword),
        );
        self::assertFalse(
            $hasher->isPasswordValid($user, 'incorrect-password'),
        );
    }
}