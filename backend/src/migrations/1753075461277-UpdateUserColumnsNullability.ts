import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserColumnsNullability1753075461277 implements MigrationInterface {
    name = 'UpdateUserColumnsNullability1753075461277'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "full_name" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "full_name" SET NOT NULL`);
    }

}
