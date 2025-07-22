import { MigrationInterface, QueryRunner } from "typeorm";

export class MakePhoneNumberNullableInUser1753047758591 implements MigrationInterface {
    name = 'MakePhoneNumberNullableInUser1753047758591'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone_number" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone_number" DROP NOT NULL`);
    }

}
