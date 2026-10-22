<?php

declare(strict_types=1);

namespace App\Tests\Dto;

use App\Dto\ProductDetailsInput;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Validator\Validation;

final class ProductDetailsInputTest extends TestCase
{
    public function testTrimsInputAndAcceptsValidValues(): void
    {
        $input = new ProductDetailsInput(' Wireless Mouse ', ' MOUSE-001 ');

        $validator = Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();

        self::assertSame('Wireless Mouse', $input->name);
        self::assertSame('MOUSE-001', $input->sku);
        self::assertCount(0, $validator->validate($input));
    }

    public function testRejectsWhitespaceOnlyValues(): void
    {
        $input = new ProductDetailsInput('   ', '   ');

        $validator = Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();

        $violations = $validator->validate($input);
        $messages = [];

        foreach ($violations as $violation) {
            $messages[$violation->getPropertyPath()] = $violation->getMessage();
        }

        self::assertCount(2, $violations);
        self::assertSame('Name is required.', $messages['name']);
        self::assertSame('SKU is required.', $messages['sku']);
    }

    public function testAcceptsMaximumLengths(): void
    {
        $input = new ProductDetailsInput(
            str_repeat('N', 150),
            str_repeat('S', 50),
        );

        $validator = Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();

        self::assertCount(0, $validator->validate($input));
    }

    public function testRejectsValuesExceedingMaximumLengths(): void
    {
        $input = new ProductDetailsInput(
            str_repeat('N', 151),
            str_repeat('S', 51),
        );

        $validator = Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();

        $violations = $validator->validate($input);
        $messages = [];

        foreach ($violations as $violation) {
            $messages[$violation->getPropertyPath()] = $violation->getMessage();
        }

        self::assertCount(2, $violations);
        self::assertSame(
            'Name must contain at most 150 characters.',
            $messages['name'],
        );
        self::assertSame(
            'SKU must contain at most 50 characters.',
            $messages['sku'],
        );
    }
}