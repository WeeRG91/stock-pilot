<?php

declare(strict_types=1);

namespace App\Tests\Dto;

use App\Dto\LowStockThresholdInput;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Validator\Validation;

final class LowStockThresholdInputTest extends TestCase
{
    public function testAcceptsValidThresholds(): void
    {
        $validator = Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();

        foreach ([0, 5, 2147483647] as $threshold) {
            $input = new LowStockThresholdInput($threshold);

            self::assertCount(
                0,
                $validator->validate($input),
                'Rejected valid threshold: ' . $threshold,
            );
        }
    }

    public function testRejectsNegativeThreshold(): void
    {
        $validator = Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();

        $violations = $validator->validate(
            new LowStockThresholdInput(-1),
        );

        self::assertCount(1, $violations);
        self::assertSame(
            'Threshold must be zero or positive.',
            $violations[0]->getMessage(),
        );
    }

    public function testRejectsThresholdAboveDatabaseMaximum(): void
    {
        $validator = Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();

        $violations = $validator->validate(
            new LowStockThresholdInput(2147483648),
        );

        self::assertCount(1, $violations);
        self::assertSame(
            'Threshold must not exceed 2147483647.',
            $violations[0]->getMessage(),
        );
    }
}