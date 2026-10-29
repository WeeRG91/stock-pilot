<?php

declare(strict_types=1);

namespace App\Command;

use App\Service\InventoryExportRequester;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:inventory:export',
    description: 'Queue an inventory export.',
)]
final class RequestInventoryExportCommand extends Command
{
    public function __construct(
        private readonly InventoryExportRequester $exportRequester,
    ) {
        parent::__construct();
    }

    protected function execute(
        InputInterface $input,
        OutputInterface $output,
    ): int {
        $exportId = $this->exportRequester->request();

        $output->writeln(sprintf(
            'Inventory export #%d queued.',
            $exportId,
        ));

        return Command::SUCCESS;
    }
}
