<?php

declare(strict_types=1);

namespace App\Tests\Command;

use App\Command\CheckMercureCommand;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Tester\CommandTester;
use Symfony\Component\Mercure\Exception\RuntimeException;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;

final class CheckMercureCommandTest extends TestCase
{
    public function testPublishesAPrivateDiagnosticEvent(): void
    {
        $hub = $this->createMock(HubInterface::class);

        $hub->expects(self::once())
            ->method('publish')
            ->with(self::callback(
                static function (Update $update): bool {
                    return $update->isPrivate()
                        && $update->getTopics() === ['urn:stockpilot:inventory']
                        && json_decode(
                            $update->getData(),
                            true,
                            flags: JSON_THROW_ON_ERROR,
                        ) === ['type' => 'connection.test'];
                },
            ))
            ->willReturn('test-event-id');

        $tester = new CommandTester(new CheckMercureCommand($hub));

        $status = $tester->execute([]);

        self::assertSame(Command::SUCCESS, $status);
        self::assertStringContainsString(
            'Mercure accepted the private connection-check event.',
            $tester->getDisplay(),
        );
    }

    public function testReportsPublicationFailureWithoutInternalDetails(): void
    {
        $hub = $this->createMock(HubInterface::class);

        $hub->expects(self::once())
            ->method('publish')
            ->willThrowException(
                new RuntimeException('Internal connection details'),
            );

        $tester = new CommandTester(new CheckMercureCommand($hub));

        $status = $tester->execute([]);

        self::assertSame(Command::FAILURE, $status);
        self::assertStringContainsString(
            'Mercure publication failed.',
            $tester->getDisplay(),
        );
        self::assertStringNotContainsString(
            'Internal connection details',
            $tester->getDisplay(),
        );
    }
}