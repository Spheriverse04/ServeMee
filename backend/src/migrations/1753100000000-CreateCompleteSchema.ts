import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateCompleteSchema1753100000000 implements MigrationInterface {
    name = 'CreateCompleteSchema1753100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable required extension for UUID generation
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Create custom enum for BaseFareType
        await queryRunner.query(`
            CREATE TYPE "public"."base_fare_type_enum" AS ENUM ('hourly', 'fixed', 'per_km', 'per_item', 'custom');
        `);

        // Create users table
        await queryRunner.createTable(new Table({
            name: "users",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "firebase_uid", type: "varchar", length: "255", isUnique: true, isNullable: false },
                { name: "email", type: "varchar", length: "255", isUnique: true, isNullable: false },
                { name: "phone_number", type: "varchar", length: "20", isNullable: true },
                { name: "display_name", type: "varchar", length: "255", isNullable: true },
                { name: "profile_picture_url", type: "text", isNullable: true },
                { name: "address", type: "varchar", length: "255", isNullable: true },
                { name: "latitude", type: "numeric", precision: 10, scale: 8, isNullable: true },
                { name: "longitude", type: "numeric", precision: 11, scale: 8, isNullable: true },
                { name: "role", type: "enum", enum: ["consumer", "service_provider"], default: "'consumer'", isNullable: false },
                { name: "created_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
                { name: "updated_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
                { name: "last_login", type: "timestamp with time zone", isNullable: true },
                { name: "is_active", type: "boolean", default: true, isNullable: false },
            ],
        }), true);

        // Create service_categories table
        await queryRunner.createTable(new Table({
            name: "service_categories",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "name", type: "varchar", length: "255", isUnique: true, isNullable: false },
                { name: "description", type: "text", isNullable: true },
                { name: "icon_url", type: "text", isNullable: true },
                { name: "is_active", type: "boolean", default: true, isNullable: false },
                { name: "sort_order", type: "int", default: 0, isNullable: false },
                { name: "created_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
                { name: "updated_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
            ],
        }), true);

        // Create service_types table
        await queryRunner.createTable(new Table({
            name: "service_types",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "category_id", type: "uuid", isNullable: false },
                { name: "name", type: "varchar", length: "255", isUnique: true, isNullable: false },
                { name: "description", type: "text", isNullable: true },
                // ADDED 'base_fare_type' column using the custom enum
                {
                    name: "base_fare_type",
                    type: "enum",
                    enum: ["hourly", "fixed", "per_km", "per_item", "custom"], // Ensure these match your BaseFareType enum
                    isNullable: false
                },
                { name: "average_rating", type: "numeric", precision: 3, scale: 2, default: 0.00, isNullable: false },
                { name: "total_ratings", type: "integer", default: 0, isNullable: false },
                { name: "sort_order", type: "integer", default: 0, isNullable: false },
                { name: "additional_attributes", type: "jsonb", isNullable: true },
                { name: "is_active", type: "boolean", default: true, isNullable: false },
                { name: "created_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
                { name: "updated_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
            ],
        }), true);

        await queryRunner.createForeignKey("service_types", new TableForeignKey({
            columnNames: ["category_id"],
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
            onUpdate: "NO ACTION",
            referencedTableName: "service_categories",
        }));

        // Create service_providers table
        await queryRunner.createTable(new Table({
            name: "service_providers",
            columns: [
                { name: "user_id", type: "uuid", isPrimary: true, isNullable: false }, // Foreign key to users table
                { name: "company_name", type: "varchar", length: "255", isNullable: true },
                { name: "bio", type: "text", isNullable: true },
                { name: "average_rating", type: "numeric", precision: 3, scale: 2, default: 0.00, isNullable: false },
                { name: "total_ratings", type: "integer", default: 0, isNullable: false },
                { name: "is_verified", type: "boolean", default: false, isNullable: false },
                { name: "availability_status", type: "varchar", length: "50", default: "'available'", isNullable: false },
                { name: "created_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
                { name: "updated_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
            ],
        }), true);

        await queryRunner.createForeignKey("service_providers", new TableForeignKey({
            columnNames: ["user_id"],
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
            onUpdate: "NO ACTION",
            referencedTableName: "users",
        }));

        // Create services table
        await queryRunner.createTable(new Table({
            name: "services",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "service_type_id", type: "uuid", isNullable: false },
                { name: "service_provider_id", type: "uuid", isNullable: false }, // Foreign key to service_providers
                { name: "name", type: "varchar", length: "255", isNullable: false },
                { name: "description", type: "text", isNullable: true },
                { name: "price", type: "numeric", precision: 10, scale: 2, isNullable: false },
                { name: "unit", type: "varchar", length: "50", isNullable: false },
                { name: "image_url", type: "text", isNullable: true },
                { name: "average_rating", type: "numeric", precision: 3, scale: 2, default: 0.00, isNullable: false },
                { name: "total_ratings", type: "integer", default: 0, isNullable: false },
                { name: "is_active", type: "boolean", default: true, isNullable: false },
                { name: "created_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
                { name: "updated_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
            ],
        }), true);

        await queryRunner.createForeignKey("services", new TableForeignKey({
            columnNames: ["service_type_id"],
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
            onUpdate: "NO ACTION",
            referencedTableName: "service_types",
        }));
        await queryRunner.createForeignKey("services", new TableForeignKey({
            columnNames: ["service_provider_id"],
            referencedColumnNames: ["user_id"],
            onDelete: "CASCADE",
            onUpdate: "NO ACTION",
            referencedTableName: "service_providers",
        }));

        // Create bookings table
        await queryRunner.createTable(new Table({
            name: "bookings",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "service_id", type: "uuid", isNullable: false },
                { name: "consumer_id", type: "uuid", isNullable: false },
                { name: "service_provider_id", type: "uuid", isNullable: false },
                { name: "booking_date_time", type: "timestamp with time zone", isNullable: false },
                { name: "status", type: "enum", enum: ["pending", "confirmed", "completed", "cancelled"], default: "'pending'", isNullable: false },
                { name: "total_price", type: "numeric", precision: 10, scale: 2, isNullable: false },
                { name: "notes", type: "text", isNullable: true },
                { name: "created_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
                { name: "updated_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
            ],
        }), true);

        await queryRunner.createForeignKey("bookings", new TableForeignKey({
            columnNames: ["service_id"],
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
            onUpdate: "NO ACTION",
            referencedTableName: "services",
        }));
        await queryRunner.createForeignKey("bookings", new TableForeignKey({
            columnNames: ["consumer_id"],
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
            onUpdate: "NO ACTION",
            referencedTableName: "users",
        }));
        await queryRunner.createForeignKey("bookings", new TableForeignKey({
            columnNames: ["service_provider_id"],
            referencedColumnNames: ["user_id"],
            onDelete: "RESTRICT",
            onUpdate: "NO ACTION",
            referencedTableName: "service_providers",
        }));


        // Create service_requests table
        await queryRunner.createTable(new Table({
            name: "service_requests",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "consumer_id", type: "uuid", isNullable: false },
                { name: "service_type_id", type: "uuid", isNullable: false },
                { name: "service_provider_id", type: "uuid", isNullable: true }, // Can be null if consumer just requests a type of service
                { name: "description", type: "text", isNullable: false },
                { name: "status", type: "enum", enum: ["pending", "accepted", "rejected", "completed", "cancelled"], default: "'pending'", isNullable: false },
                { name: "request_date_time", type: "timestamp with time zone", default: "NOW()", isNullable: false },
                { name: "required_date_time", type: "timestamp with time zone", isNullable: true },
                { name: "location_latitude", type: "numeric", precision: 10, scale: 8, isNullable: true },
                { name: "location_longitude", type: "numeric", precision: 11, scale: 8, isNullable: true },
                // Add locality_id to service_requests table
                { name: "locality_id", type: "uuid", isNullable: true },
                { name: "created_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
                { name: "updated_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
            ],
        }), true);

        await queryRunner.createForeignKey("service_requests", new TableForeignKey({
            columnNames: ["consumer_id"],
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
            onUpdate: "NO ACTION",
            referencedTableName: "users",
        }));
        await queryRunner.createForeignKey("service_requests", new TableForeignKey({
            columnNames: ["service_type_id"],
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
            onUpdate: "NO ACTION",
            referencedTableName: "service_types",
        }));
        await queryRunner.createForeignKey("service_requests", new TableForeignKey({
            columnNames: ["service_provider_id"],
            referencedColumnNames: ["user_id"],
            onDelete: "SET NULL", // If provider is removed, request might still exist
            onUpdate: "NO ACTION",
            referencedTableName: "service_providers",
        }));

        // Create new location tables: countries, states, districts, and localities
        await queryRunner.createTable(new Table({
            name: "countries",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "name", type: "varchar", length: "255", isUnique: true, isNullable: false },
                { name: "created_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
                { name: "updated_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
            ],
        }), true);

        await queryRunner.createTable(new Table({
            name: "states",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "country_id", type: "uuid", isNullable: false },
                { name: "name", type: "varchar", length: "255", isUnique: true, isNullable: false },
                { name: "created_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
                { name: "updated_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
            ],
        }), true);

        await queryRunner.createForeignKey("states", new TableForeignKey({
            columnNames: ["country_id"],
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
            onUpdate: "NO ACTION",
            referencedTableName: "countries",
        }));

        await queryRunner.createTable(new Table({
            name: "districts",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "state_id", type: "uuid", isNullable: false },
                { name: "name", type: "varchar", length: "255", isUnique: true, isNullable: false },
                { name: "created_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
                { name: "updated_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
            ],
        }), true);

        await queryRunner.createForeignKey("districts", new TableForeignKey({
            columnNames: ["state_id"],
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
            onUpdate: "NO ACTION",
            referencedTableName: "states",
        }));

        await queryRunner.createTable(new Table({
            name: "localities",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "district_id", type: "uuid", isNullable: false },
                { name: "name", type: "varchar", length: "255", isUnique: true, isNullable: false },
                { name: "created_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
                { name: "updated_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
            ],
        }), true);

        await queryRunner.createForeignKey("localities", new TableForeignKey({
            columnNames: ["district_id"],
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
            onUpdate: "NO ACTION",
            referencedTableName: "districts",
        }));

        // Add foreign key for locality_id in service_requests
        await queryRunner.createForeignKey("service_requests", new TableForeignKey({
            columnNames: ["locality_id"],
            referencedColumnNames: ["id"],
            onDelete: "SET NULL",
            onUpdate: "NO ACTION",
            referencedTableName: "localities",
        }));

        // Create a many-to-many join table for service_providers and localities
        await queryRunner.createTable(new Table({
            name: "service_provider_localities",
            columns: [
                { name: "service_provider_id", type: "uuid", isPrimary: true, isNullable: false },
                { name: "locality_id", type: "uuid", isPrimary: true, isNullable: false },
                { name: "created_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
                { name: "updated_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
            ],
        }), true);

        await queryRunner.createForeignKey("service_provider_localities", new TableForeignKey({
            columnNames: ["service_provider_id"],
            referencedColumnNames: ["user_id"],
            onDelete: "CASCADE",
            onUpdate: "NO ACTION",
            referencedTableName: "service_providers",
        }));

        await queryRunner.createForeignKey("service_provider_localities", new TableForeignKey({
            columnNames: ["locality_id"],
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
            onUpdate: "NO ACTION",
            referencedTableName: "localities",
        }));

        // Create ratings_reviews table
        await queryRunner.createTable(new Table({
            name: "ratings_reviews",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "service_request_id", type: "uuid", isUnique: true, isNullable: false }, // One review per request
                { name: "consumer_id", type: "uuid", isNullable: false },
                { name: "service_provider_id", type: "uuid", isNullable: false },
                { name: "rating", type: "integer", isNullable: false },
                { name: "review_text", type: "text", isNullable: true },
                { name: "created_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
                { name: "updated_at", type: "timestamp with time zone", default: "NOW()", isNullable: false },
            ],
        }), true);

        await queryRunner.createForeignKey("ratings_reviews", new TableForeignKey({
            columnNames: ["service_request_id"],
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
            onUpdate: "NO ACTION",
            referencedTableName: "service_requests",
        }));
        await queryRunner.createForeignKey("ratings_reviews", new TableForeignKey({
            columnNames: ["consumer_id"],
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
            onUpdate: "NO ACTION",
            referencedTableName: "users",
        }));
        await queryRunner.createForeignKey("ratings_reviews", new TableForeignKey({
            columnNames: ["service_provider_id"],
            referencedColumnNames: ["user_id"],
            onDelete: "CASCADE",
            onUpdate: "NO ACTION",
            referencedTableName: "service_providers",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys first to avoid dependency issues in reverse order of creation
        const foreignKeysToDrop = [
            // From ratings_reviews
            new TableForeignKey({ columnNames: ["service_request_id"], referencedColumnNames: ["id"], referencedTableName: "service_requests" }),
            new TableForeignKey({ columnNames: ["consumer_id"], referencedColumnNames: ["id"], referencedTableName: "users" }),
            new TableForeignKey({ columnNames: ["service_provider_id"], referencedColumnNames: ["user_id"], referencedTableName: "service_providers" }),
            // From service_provider_localities
            new TableForeignKey({ columnNames: ["service_provider_id"], referencedColumnNames: ["user_id"], referencedTableName: "service_providers" }),
            new TableForeignKey({ columnNames: ["locality_id"], referencedColumnNames: ["id"], referencedTableName: "localities" }),
            // From service_requests
            new TableForeignKey({ columnNames: ["locality_id"], referencedColumnNames: ["id"], referencedTableName: "localities" }),
            new TableForeignKey({ columnNames: ["consumer_id"], referencedColumnNames: ["id"], referencedTableName: "users" }),
            new TableForeignKey({ columnNames: ["service_type_id"], referencedColumnNames: ["id"], referencedTableName: "service_types" }),
            new TableForeignKey({ columnNames: ["service_provider_id"], referencedColumnNames: ["user_id"], referencedTableName: "service_providers" }),
            // From bookings
            new TableForeignKey({ columnNames: ["service_id"], referencedColumnNames: ["id"], referencedTableName: "services" }),
            new TableForeignKey({ columnNames: ["consumer_id"], referencedColumnNames: ["id"], referencedTableName: "users" }),
            new TableForeignKey({ columnNames: ["service_provider_id"], referencedColumnNames: ["user_id"], referencedTableName: "service_providers" }),
            // From services
            new TableForeignKey({ columnNames: ["service_type_id"], referencedColumnNames: ["id"], referencedTableName: "service_types" }),
            new TableForeignKey({ columnNames: ["service_provider_id"], referencedColumnNames: ["user_id"], referencedTableName: "service_providers" }),
            // From service_providers
            new TableForeignKey({ columnNames: ["user_id"], referencedColumnNames: ["id"], referencedTableName: "users" }),
            // From service_types
            new TableForeignKey({ columnNames: ["category_id"], referencedColumnNames: ["id"], referencedTableName: "service_categories" }),
            // From localities
            new TableForeignKey({ columnNames: ["district_id"], referencedColumnNames: ["id"], referencedTableName: "districts" }),
            // From districts
            new TableForeignKey({ columnNames: ["state_id"], referencedColumnNames: ["id"], referencedTableName: "states" }),
            // From states
            new TableForeignKey({ columnNames: ["country_id"], referencedColumnNames: ["id"], referencedTableName: "countries" }),
        ];

        // Manually drop foreign keys for the relevant tables, starting with dependent tables
        const tablesWithFks = [
            "ratings_reviews",
            "service_provider_localities",
            "service_requests",
            "bookings",
            "services",
            "service_providers",
            "service_types",
            "localities",
            "districts",
            "states",
        ];

        for (const tableName of tablesWithFks) {
            const table = await queryRunner.getTable(tableName);
            if (table) {
                // Filter for foreign keys that reference tables being dropped or modified in this migration
                const fksToDropForTable = table.foreignKeys.filter(fk =>
                    foreignKeysToDrop.some(fkt =>
                        fkt.columnNames.every((col, i) => col === fk.columnNames[i]) &&
                        fkt.referencedColumnNames.every((refCol, i) => refCol === fk.referencedColumnNames[i]) &&
                        fkt.referencedTableName === fk.referencedTableName
                    )
                );
                if (fksToDropForTable.length > 0) {
                    await queryRunner.dropForeignKeys(table, fksToDropForTable);
                }
            }
        }

        // Drop tables in reverse order of creation / dependency
        await queryRunner.dropTable("ratings_reviews");
        await queryRunner.dropTable("service_provider_localities");
        await queryRunner.dropTable("bookings");
        await queryRunner.dropTable("service_requests");
        await queryRunner.dropTable("services");
        await queryRunner.dropTable("service_providers");
        await queryRunner.dropTable("service_types");
        await queryRunner.dropTable("service_categories");
        await queryRunner.dropTable("localities");
        await queryRunner.dropTable("districts");
        await queryRunner.dropTable("states");
        await queryRunner.dropTable("countries");
        await queryRunner.dropTable("users");


        // Drop the uuid-ossp extension if it's no longer used by any other tables/migrations
        await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
        // Drop the custom enum type
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."base_fare_type_enum"`);
    }
}
