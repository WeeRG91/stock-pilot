<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use InvalidArgumentException;
use RuntimeException;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-user',
    description: 'Create a StockPilot user with an interactive password prompt',
)]
final class CreateUserCommand extends Command
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addArgument(
            'email',
            InputArgument::REQUIRED,
            'Email address for the new user',
        );

        $this->addOption(
            'reset-password',
            null,
            InputOption::VALUE_NONE,
            'Replace the password of an existing user',
        );
    }

    protected function execute(
        InputInterface $input,
        OutputInterface $output,
    ): int {
        $io = new SymfonyStyle($input, $output);

        if (!$input->isInteractive()) {
            $io->error('This command requires interactive password entry.');

            return Command::INVALID;
        }

        try {
            $user = new User((string) $input->getArgument('email'));
        } catch (InvalidArgumentException $exception) {
            $io->error($exception->getMessage());

            return Command::INVALID;
        }

        $existing = $this->userRepository->findOneBy([
            'email' => $user->getEmail(),
        ]);

        $resetPassword = (bool) $input->getOption('reset-password');

        if ($existing !== null) {
            if (!$resetPassword) {
                $io->error('A user with this email already exists.');

                return Command::FAILURE;
            }

            $user = $existing;
        } elseif ($resetPassword) {
            $io->error('No user with this email exists.');

            return Command::FAILURE;
        }

        $normalizePasswordInput = static function (mixed $value): mixed {
            return is_string($value)
                ? rtrim($value, "\r\n")
                : $value;
        };

        $passwordQuestion = new Question('Password (12–128 characters)');
        $passwordQuestion->setHidden(true);
        $passwordQuestion->setHiddenFallback(false);
        $passwordQuestion->setTrimmable(false);
        $passwordQuestion->setNormalizer($normalizePasswordInput);
        $passwordQuestion->setMaxAttempts(3);
        $passwordQuestion->setValidator(
            static function (mixed $value): string {
                if (
                    !is_string($value)
                    || mb_strlen($value) < 12
                    || mb_strlen($value) > 128
                ) {
                    throw new RuntimeException(
                        'Password must contain between 12 and 128 characters.',
                    );
                }

                return $value;
            },
        );

        $password = $io->askQuestion($passwordQuestion);

        $confirmationQuestion = new Question('Confirm password');
        $confirmationQuestion->setHidden(true);
        $confirmationQuestion->setHiddenFallback(false);
        $confirmationQuestion->setTrimmable(false);
        $confirmationQuestion->setNormalizer($normalizePasswordInput);
        $confirmationQuestion->setMaxAttempts(3);
        $confirmationQuestion->setValidator(
            static function (mixed $value) use ($password): string {
                if (!is_string($value) || $value !== $password) {
                    throw new RuntimeException('Passwords do not match.');
                }

                return $value;
            },
        );

        $io->askQuestion($confirmationQuestion);

        $user->setPasswordHash(
            $this->passwordHasher->hashPassword($user, $password),
        );

        unset($password);

        try {
            $this->entityManager->persist($user);
            $this->entityManager->flush();
        } catch (UniqueConstraintViolationException) {
            $io->error('A user with this email already exists.');

            return Command::FAILURE;
        }

        $io->success(sprintf(
            $resetPassword
                ? 'Updated password for user #%d: %s'
                : 'Created user #%d: %s',
            $user->getId(),
            $user->getEmail(),
        ));

        return Command::SUCCESS;
    }
}
