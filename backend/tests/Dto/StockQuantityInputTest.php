<?php

declare(strict_types=1);

namespace App\Tests\Dto;

use App\Dto\StockQuantityInput;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Validator\Validation;

final class StockQuantityInputTest extends TestCase
{
    public function testAcceptsPositiveQuantity(): void
    {
        $input = new StockQuantityInput(10);

        $validator = Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();

        self::assertSame(10, $input->quantity);
        self::assertCount(0, $validator->validate($input));
    }

    public function testAcceptsMaximumDatabaseInteger(): void
    {
        $input = new StockQuantityInput(2147483647);

        $validator = Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();

        self::assertCount(0, $validator->validate($input));
    }

    public function testRejectsZeroQuantity(): void
    {
        $input = new StockQuantityInput(0);

        $validator = Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();

        $violations = $validator->validate($input);

        self::assertCount(1, $violations);
        self::assertSame('quantity', $violations[0]->getPropertyPath());
        self::assertSame(
            'Quantity must be positive.',
            $violations[0]->getMessage(),
        );
    }

    public function testRejectsNegativeQuantity(): void
    {
        $input = new StockQuantityInput(-5);

        $validator = Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();

        $violations = $validator->validate($input);

        self::assertCount(1, $violations);
        self::assertSame(
            'Quantity must be positive.',
            $violations[0]->getMessage(),
        );
    }

    public function testRejectsQuantityAboveDatabaseMaximum(): void
    {
        $input = new StockQuantityInput(2147483648);

        $validator = Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();

        $violations = $validator->validate($input);

        self::assertCount(1, $violations);
        self::assertSame(
            'Quantity must not exceed 2147483647.',
            $violations[0]->getMessage(),
        );
    }
}
