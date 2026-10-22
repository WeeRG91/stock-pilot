<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261022132705 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add product active status and mark existing products active';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE products ADD active BOOLEAN DEFAULT NULL');
        $this->addSql('UPDATE products SET active = TRUE');
        $this->addSql('ALTER TABLE products ALTER active SET NOT NULL');
        $this->addSql('ALTER TABLE products ALTER active DROP DEFAULT');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE products DROP active');
    }
}
