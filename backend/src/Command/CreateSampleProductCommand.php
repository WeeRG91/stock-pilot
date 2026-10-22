<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\Product;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:create-sample-product',
    description: 'Create and reload a sample product for learning',
)]
final class CreateSampleProductCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
    ) {
        parent::__construct();
    }

    protected function execute(
        InputInterface $input,
        OutputInterface $output,
    ): int {
        $io = new SymfonyStyle($input, $output);

        $existing = $this->entityManager
            ->getRepository(Product::class)
            ->findOneBy(['sku' => 'MOUSE-001']);

        if ($existing !== null) {
            $io->note('Sample product MOUSE-001 already exists; no product created.');

            return Command::SUCCESS;
        }

        $product = new Product('Wireless Mouse', 'MOUSE-001');

        $this->entityManager->persist($product);
        $this->entityManager->flush();

        $id = $product->getId();

        $this->entityManager->clear();

        $reloaded = $this->entityManager->find(Product::class, $id);

        if ($reloaded === null) {
            $io->error('The saved product could not be reloaded.');

            return Command::FAILURE;
        }

        $io->success(sprintf(
            'Reloaded product #%d: %s (%s)',
            $reloaded->getId(),
            $reloaded->getName(),
            $reloaded->getSku(),
        ));

        return Command::SUCCESS;
    }
}