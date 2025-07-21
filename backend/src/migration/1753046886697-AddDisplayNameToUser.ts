import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddDisplayNameToUser1753046886697 implements MigrationInterface {
    name = 'AddDisplayNameToUser1753046886697'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("users", new TableColumn({
            name: "displayName",
            type: "varchar",
            length: "100", // Matches the length in your entity
            isNullable: true, // Matches nullable: true in your entity
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "displayName");
    }
}
