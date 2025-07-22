// backend/src/migrations/1753172334040-AddDisplayNameColumnToUsers.ts
import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"; // Ensure TableColumn is imported

export class AddDisplayNameColumnToUsers1753172334040 implements MigrationInterface {
    name = 'AddDisplayNameColumnToUsers1753172334040'; // Ensure this matches your class name and timestamp

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("users", new TableColumn({
            name: "display_name",
            type: "varchar",
            length: "255",
            isNullable: true, // This must match your User entity's nullable setting (it is true based on your user.entity.ts)
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "display_name");
    }
}
