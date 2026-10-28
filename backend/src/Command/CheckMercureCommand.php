<?php

declare(strict_types=1);

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Mercure\Exception\ExceptionInterface;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;

#[AsCommand(
    name: 'app:mercure:check',
    description: 'Publish a private connection-check event to Mercure',
)]
final class CheckMercureCommand extends Command
{
    public function __construct(
        private readonly HubInterface $hub,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        try {
            $this->hub->publish(new Update(
                topics: 'urn:stockpilot:inventory',
                data: json_encode(
                    ['type' => 'connection.test'],
                    JSON_THROW_ON_ERROR,
                ),
                private: true,
            ));
        } catch (ExceptionInterface) {
            $io->error(
                'Mercure publication failed. Check the hub and local configuration.',
            );

            return Command::FAILURE;
        }

        $io->success('Mercure accepted the private connection-check event.');

        return Command::SUCCESS;
    }
}