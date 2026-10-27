<?php

declare(strict_types=1);

namespace App\Tests\Command;

use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Tester\CommandTester;

final class CreateUserCommandTest extends KernelTestCase
{
    public function testRejectsNoninteractiveExecution(): void
    {
        self::bootKernel();

        $application = new Application(self::$kernel);
        $tester = new CommandTester(
            $application->find('app:create-user'),
        );

        $status = $tester->execute(
            ['email' => 'developer@example.com'],
            ['interactive' => false],
        );

        self::assertSame(Command::INVALID, $status);
        self::assertStringContainsString(
            'This command requires interactive password entry.',
            $tester->getDisplay(),
        );
    }

    public function testRejectsInvalidEmailBeforeAskingForPassword(): void
    {
        self::bootKernel();

        $application = new Application(self::$kernel);
        $tester = new CommandTester(
            $application->find('app:create-user'),
        );

        $status = $tester->execute(
            ['email' => 'not-an-email'],
            ['interactive' => true],
        );

        self::assertSame(Command::INVALID, $status);
        self::assertStringContainsString(
            'A valid email address of at most 180 characters is required.',
            $tester->getDisplay(),
        );
    }
}