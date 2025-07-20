import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RenameBookingColumns1753023857561 implements MigrationInterface { // <-- ENSURE YOUR CLASS NAME MATCHES THE GENERATED ONE
    name = 'RenameBookingColumns1753023857561' // <-- ENSURE YOUR NAME MATCHES THE GENERATED ONE

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('Running UP migration: RenameBookingColumns');

        // Step 1: Drop existing foreign key constraints that depend on the old column names
        // These must be dropped before renaming the columns they reference.
        // Check if constraints exist before dropping to prevent errors on re-runs
        const table = await queryRunner.getTable("bookings");
        const fkConsumer = table?.foreignKeys.find(fk => fk.columnNames.includes("consumerId"));
        const fkService = table?.foreignKeys.find(fk => fk.columnNames.includes("serviceId"));

        if (fkConsumer) {
            console.log(`Dropping FK: ${fkConsumer.name}`);
            await queryRunner.dropForeignKey("bookings", fkConsumer);
        }
        if (fkService) {
            console.log(`Dropping FK: ${fkService.name}`);
            await queryRunner.dropForeignKey("bookings", fkService);
        }

        // Step 2: Rename columns to snake_case and adjust types/nullability/defaults
        // This approach ensures data is preserved.

        // Rename consumerId to consumer_id
        const consumerIdCol = table?.columns.find(col => col.name === "consumerId");
        if (consumerIdCol) {
            console.log('Renaming column "consumerId" to "consumer_id" in "bookings" table.');
            await queryRunner.renameColumn("bookings", "consumerId", "consumer_id");
            // Ensure type is uuid and it's NOT NULL (as per entity definition expectation)
            // This assumes existing data is valid UUIDs.
            await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "consumer_id" TYPE uuid USING "consumer_id"::uuid`);
            await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "consumer_id" SET NOT NULL`);
        } else if (table && !table.columns.find(col => col.name === "consumer_id")) {
             console.warn("Column 'consumerId' not found to rename, and 'consumer_id' does not exist. Adding 'consumer_id' column. This may require manual data population if there are existing rows.");
             await queryRunner.addColumn("bookings", new TableColumn({
                 name: "consumer_id",
                 type: "uuid",
                 isNullable: false, // Must match your entity
             }));
        }

        // Rename serviceId to service_id
        const serviceIdCol = table?.columns.find(col => col.name === "serviceId");
        if (serviceIdCol) {
            console.log('Renaming column "serviceId" to "service_id" in "bookings" table.');
            await queryRunner.renameColumn("bookings", "serviceId", "service_id");
            // Ensure type is uuid and it's NOT NULL
            await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "service_id" TYPE uuid USING "service_id"::uuid`);
            await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "service_id" SET NOT NULL`);
        } else if (table && !table.columns.find(col => col.name === "service_id")) {
             console.warn("Column 'serviceId' not found to rename, and 'service_id' does not exist. Adding 'service_id' column.");
             await queryRunner.addColumn("bookings", new TableColumn({
                 name: "service_id",
                 type: "uuid",
                 isNullable: false, // Must match your entity
             }));
        }

        // Rename createdAt to created_at and adjust type to TIMESTAMP WITHOUT TIME ZONE
        const createdAtCol = table?.columns.find(col => col.name === "createdAt");
        if (createdAtCol) {
            console.log('Renaming column "createdAt" to "created_at" in "bookings" table.');
            await queryRunner.renameColumn("bookings", "createdAt", "created_at");
            await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "created_at" TYPE TIMESTAMP WITHOUT TIME ZONE USING "created_at"::TIMESTAMP WITHOUT TIME ZONE`);
            await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "created_at" SET DEFAULT now()`);
            await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "created_at" SET NOT NULL`);
        } else if (table && !table.columns.find(col => col.name === "created_at")) {
            console.warn("Column 'createdAt' not found to rename, and 'created_at' does not exist. Adding 'created_at' column.");
            await queryRunner.addColumn("bookings", new TableColumn({
                name: "created_at",
                type: "timestamp",
                isNullable: false,
                default: "now()",
            }));
        }

        // Rename updatedAt to updated_at and adjust type to TIMESTAMP WITHOUT TIME ZONE
        const updatedAtCol = table?.columns.find(col => col.name === "updatedAt");
        if (updatedAtCol) {
            console.log('Renaming column "updatedAt" to "updated_at" in "bookings" table.');
            await queryRunner.renameColumn("bookings", "updatedAt", "updated_at");
            await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "updated_at" TYPE TIMESTAMP WITHOUT TIME ZONE USING "updated_at"::TIMESTAMP WITHOUT TIME ZONE`);
            await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "updated_at" SET DEFAULT now()`);
            await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "updated_at" SET NOT NULL`);
        } else if (table && !table.columns.find(col => col.name === "updated_at")) {
            console.warn("Column 'updatedAt' not found to rename, and 'updated_at' does not exist. Adding 'updated_at' column.");
            await queryRunner.addColumn("bookings", new TableColumn({
                name: "updated_at",
                type: "timestamp",
                isNullable: false,
                default: "now()",
            }));
        }

        // Handle 'notes' column type change (if needed) and nullability
        const notesCol = table?.columns.find(col => col.name === "notes");
        if (notesCol) {
            // Check if type needs changing or nullability needs adjustment
            // Assuming it was 'character varying' and needs to be 'text' and nullable
            if (notesCol.type !== 'text' || !notesCol.isNullable) {
                console.log('Altering column "notes" type to text and ensuring nullability.');
                await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "notes" TYPE text USING "notes"::text`);
                await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "notes" DROP NOT NULL`); // Ensure it's nullable
            }
        } else {
            console.warn("Column 'notes' does not exist. Adding 'notes' column.");
            await queryRunner.addColumn("bookings", new TableColumn({
                name: "notes",
                type: "text",
                isNullable: true,
            }));
        }

        // Step 3: Re-add foreign key constraints with the new snake_case column names
        console.log('Re-adding foreign key constraints.');
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_26cb1abfe7ec7479360c8977f8c" FOREIGN KEY ("consumer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_df22e2beaabc33a432b4f65e3c2" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('Running DOWN migration: RenameBookingColumns');

        // Step 1: Drop new foreign key constraints
        const table = await queryRunner.getTable("bookings");
        const fkConsumer = table?.foreignKeys.find(fk => fk.columnNames.includes("consumer_id"));
        const fkService = table?.foreignKeys.find(fk => fk.columnNames.includes("service_id"));

        if (fkService) {
            console.log(`Dropping FK: ${fkService.name}`);
            await queryRunner.dropForeignKey("bookings", fkService);
        }
        if (fkConsumer) {
            console.log(`Dropping FK: ${fkConsumer.name}`);
            await queryRunner.dropForeignKey("bookings", fkConsumer);
        }

        // Step 2: Revert 'notes' column type and nullability
        const notesCol = table?.columns.find(col => col.name === "notes");
        if (notesCol) {
            // Revert type to character varying, preserving data
            console.log('Reverting column "notes" type to character varying.');
            await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "notes" TYPE character varying USING "notes"::character varying`);
            // If it was NOT NULL before, set it back. Assuming it was nullable.
            await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "notes" DROP NOT NULL`);
        }

        // Step 3: Rename columns back to camelCase and revert their types/nullability/defaults
        const consumer_id_Col = table?.columns.find(col => col.name === "consumer_id");
        if (consumer_id_Col) {
            console.log('Renaming column "consumer_id" back to "consumerId".');
            await queryRunner.renameColumn("bookings", "consumer_id", "consumerId");
            await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "consumerId" TYPE uuid USING "consumerId"::uuid`);
            await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "consumerId" SET NOT NULL`);
        }

        const service_id_Col = table?.columns.find(col => col.name === "service_id");
        if (service_id_Col) {
            console.log('Renaming column "service_id" back to "serviceId".');
            await queryRunner.renameColumn("bookings", "service_id", "serviceId");
            await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "serviceId" TYPE uuid USING "serviceId"::uuid`);
            await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "serviceId" SET NOT NULL`);
        }

        const created_at_Col = table?.columns.find(col => col.name === "created_at");
        if (created_at_Col) {
            await queryRunner.renameColumn("bookings", "created_at", "createdAt");
            await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt"::TIMESTAMP WITH TIME ZONE`);
            await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "createdAt" SET DEFAULT now()`);
            await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "createdAt" SET NOT NULL`);
        }

        const updated_at_Col = table?.columns.find(col => col.name === "updated_at");
        if (updated_at_Col) {
            await queryRunner.renameColumn("bookings", "updated_at", "updatedAt");
            await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt"::TIMESTAMP WITH TIME ZONE`);
            await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
            await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "updatedAt" SET NOT NULL`);
        }

        // Step 4: Re-add old foreign key constraints with camelCase column names
        console.log('Re-adding old foreign key constraints.');
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_15a2431ec10d29dcd96c9563b65" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_473cff726078715c7417a7c65e6" FOREIGN KEY ("consumerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
