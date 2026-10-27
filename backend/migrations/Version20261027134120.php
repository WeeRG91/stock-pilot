<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261027134120 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add product low-stock thresholds initialized to zero';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE products ADD low_stock_threshold INT DEFAULT 0 NOT NULL',
        );
        $this->addSql(
            'ALTER TABLE products ALTER low_stock_threshold DROP DEFAULT',
        );
        $this->addSql(
            'ALTER TABLE products ADD CONSTRAINT chk_products_low_stock_threshold_nonnegative CHECK (low_stock_threshold >= 0)',
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE products DROP low_stock_threshold');
    }
}
