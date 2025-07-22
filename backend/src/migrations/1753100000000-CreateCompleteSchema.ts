// backend/src/migrations/1753100000000-CreateCompleteSchema.ts
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableUnique, TableIndex } from "typeorm";

export class CreateCompleteSchema1753100000000 implements MigrationInterface {
    name = 'CreateCompleteSchema1753100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable required extension for UUID generation
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Create custom enum for BaseFareType
        await queryRunner.query(`
            CREATE TYPE "public"."base_fare_type_enum" AS ENUM ('hourly', 'fixed', 'per_km', 'per_item', 'custom');
        `);

        // Create custom enum for ServiceRequestStatus
        await queryRunner.query(`
            CREATE TYPE "public"."service_request_status_enum" AS ENUM ('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED');
        `);

        // Create custom enum for BookingStatus
        await queryRunner.query(`
            CREATE TYPE "public"."bookings_status_enum" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
        `);

        // Create custom enum for UserRole
        await queryRunner.query(`
            CREATE TYPE "public"."user_role_enum" AS ENUM ('admin', 'consumer', 'service_provider');
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
                { name: "address", type: "varchar", length: "500", isNullable: true },
                { name: "role", type: "enum", enumName: "user_role_enum", default: `'consumer'`, isNullable: false },
                { name: "is_active", type: "boolean", default: true, isNullable: false },
                { name: "created_at", type: "timestamp with time zone", default: "now()" },
                { name: "updated_at", type: "timestamp with time zone", default: "now()" },
            ],
            uniques: [
                { columnNames: ["firebase_uid"] },
                { columnNames: ["email"] }
            ]
        }));

        // Create states table
        await queryRunner.createTable(new Table({
            name: "states",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "name", type: "varchar", length: "255", isUnique: true, isNullable: false },
                { name: "is_active", type: "boolean", default: true, isNullable: false },
                { name: "created_at", type: "timestamp with time zone", default: "now()" },
                { name: "updated_at", type: "timestamp with time zone", default: "now()" },
            ],
            uniques: [
                { columnNames: ["name"] }
            ]
        }));

        // Create districts table
        await queryRunner.createTable(new Table({
            name: "districts",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "state_id", type: "uuid", isNullable: false },
                { name: "name", type: "varchar", length: "255", isNullable: false },
                { name: "is_active", type: "boolean", default: true, isNullable: false },
                { name: "created_at", type: "timestamp with time zone", default: "now()" },
                { name: "updated_at", type: "timestamp with time zone", default: "now()" },
            ],
            uniques: [ // Compound unique constraint for name within a state
                { columnNames: ["state_id", "name"] }
            ]
        }));

        await queryRunner.createForeignKey("districts", new TableForeignKey({
            columnNames: ["state_id"],
            referencedTableName: "states",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT"
        }));

        // Create localities table
        await queryRunner.createTable(new Table({
            name: "localities",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "name", type: "varchar", length: "255", isUnique: true, isNullable: false },
                { name: "district_id", type: "uuid", isNullable: true }, // Added district_id
                { name: "description", type: "text", isNullable: true },
                { name: "is_active", type: "boolean", default: true, isNullable: false },
                { name: "created_at", type: "timestamp with time zone", default: "now()" },
                { name: "updated_at", type: "timestamp with time zone", default: "now()" },
            ],
            uniques: [
                { columnNames: ["name"] }
            ]
        }));

        // Foreign key for localities to districts
        await queryRunner.createForeignKey("localities", new TableForeignKey({
            columnNames: ["district_id"],
            referencedTableName: "districts",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT"
        }));


        // Create service_categories table
        await queryRunner.createTable(new Table({
            name: "service_categories",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "name", type: "varchar", length: "255", isUnique: true, isNullable: false },
                { name: "description", type: "text", isNullable: true },
                { name: "icon_url", type: "text", isNullable: true },
                { name: "is_active", type: "boolean", default: true, isNullable: false },
                { name: "sort_order", type: "int", isNullable: false, default: 0 },
                { name: "created_at", type: "timestamp with time zone", default: "now()" },
                { name: "updated_at", type: "timestamp with time zone", default: "now()" },
            ],
            uniques: [
                { columnNames: ["name"] }
            ]
        }));

        // Create service_types table
        await queryRunner.createTable(new Table({
            name: "service_types",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "category_id", type: "uuid", isNullable: false },
                { name: "name", type: "varchar", length: "255", isUnique: true, isNullable: false },
                { name: "description", type: "text", isNullable: true },
                { name: "base_fare_type", type: "enum", enumName: "base_fare_type_enum", isNullable: false },
                { name: "is_active", type: "boolean", default: true, isNullable: false },
                { name: "sort_order", type: "int", isNullable: false, default: 0 },
                { name: "additional_attributes", type: "jsonb", isNullable: true },
                { name: "created_at", type: "timestamp with time zone", default: "now()" },
                { name: "updated_at", type: "timestamp with time zone", default: "now()" },
            ],
            uniques: [ // Compound unique constraint for name within a category
                { columnNames: ["category_id", "name"] }
            ]
        }));

        await queryRunner.createForeignKey("service_types", new TableForeignKey({
            columnNames: ["category_id"],
            referencedTableName: "service_categories",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT"
        }));

        // Create service_providers table (extends users table)
        await queryRunner.createTable(new Table({
            name: "service_providers",
            columns: [
                { name: "user_id", type: "uuid", isPrimary: true, isNullable: false },
                { name: "company_name", type: "varchar", length: "255", isNullable: true },
                { name: "description", type: "text", isNullable: true },
                { name: "average_rating", type: "decimal", precision: 3, scale: 2, default: 0.0, isNullable: false },
                { name: "total_ratings", type: "int", default: 0, isNullable: false },
                { name: "is_verified", type: "boolean", default: false, isNullable: false },
                { name: "created_at", type: "timestamp with time zone", default: "now()" },
                { name: "updated_at", type: "timestamp with time zone", default: "now()" },
            ]
        }));

        await queryRunner.createForeignKey("service_providers", new TableForeignKey({
            columnNames: ["user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE"
        }));

        // Create services table (services offered by providers)
        await queryRunner.createTable(new Table({
            name: "services",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "name", type: "varchar", length: "255", isNullable: false },
                { name: "description", type: "text", isNullable: true },
                { name: "image_url", type: "text", isNullable: true },
                { name: "base_fare", type: "decimal", precision: 10, scale: 2, isNullable: false, default: 0.0 },
                { name: "service_type_id", type: "uuid", isNullable: false },
                { name: "service_provider_id", type: "uuid", isNullable: false },
                { name: "is_active", type: "boolean", default: true, isNullable: false },
                { name: "created_at", type: "timestamp with time zone", default: "now()" },
                { name: "updated_at", type: "timestamp with time zone", default: "now()" },
            ],
            uniques: [ // Compound unique constraint for service name offered by a provider
                { columnNames: ["service_provider_id", "name"] }
            ]
        }));

        await queryRunner.createForeignKey("services", new TableForeignKey({
            columnNames: ["service_type_id"],
            referencedTableName: "service_types",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT"
        }));

        await queryRunner.createForeignKey("services", new TableForeignKey({
            columnNames: ["service_provider_id"],
            referencedTableName: "service_providers",
            referencedColumnNames: ["user_id"],
            onDelete: "CASCADE"
        }));

        // Create service_requests table
        await queryRunner.createTable(new Table({
            name: "service_requests",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "service_type_id", type: "uuid", isNullable: false },
                { name: "consumer_id", type: "uuid", isNullable: false },
                { name: "service_provider_id", type: "uuid", isNullable: true },
                { name: "status", type: "enum", enumName: "service_request_status_enum", default: `'PENDING'`, isNullable: false },
                { name: "locality_id", type: "uuid", isNullable: true },
                { name: "address", type: "text", isNullable: true },
                { name: "notes", type: "text", isNullable: true },
                { name: "scheduled_time", type: "timestamp with time zone", isNullable: true },
                { name: "otp_code", type: "varchar", length: "10", isNullable: true },
                { name: "total_cost", type: "decimal", precision: 10, scale: 2, isNullable: true },
                { name: "accepted_at", type: "timestamp with time zone", isNullable: true },
                { name: "completed_at", type: "timestamp with time zone", isNullable: true },
                { name: "cancelled_at", type: "timestamp with time zone", isNullable: true },
                { name: "created_at", type: "timestamp with time zone", default: "now()" },
                { name: "updated_at", type: "timestamp with time zone", default: "now()" },
            ],
            foreignKeys: [
                {
                    columnNames: ["service_type_id"],
                    referencedTableName: "service_types",
                    referencedColumnNames: ["id"],
                    onDelete: "RESTRICT"
                },
                {
                    columnNames: ["consumer_id"],
                    referencedTableName: "users",
                    referencedColumnNames: ["id"],
                    onDelete: "RESTRICT"
                },
                {
                    columnNames: ["service_provider_id"],
                    referencedTableName: "service_providers",
                    referencedColumnNames: ["user_id"],
                    onDelete: "RESTRICT"
                },
                {
                    columnNames: ["locality_id"],
                    referencedTableName: "localities",
                    referencedColumnNames: ["id"],
                    onDelete: "RESTRICT"
                },
            ]
        }));

        // Create bookings table
        await queryRunner.createTable(new Table({
            name: "bookings",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "service_request_id", type: "uuid", isUnique: true, isNullable: false },
                { name: "service_id", type: "uuid", isNullable: false },
                { name: "consumer_id", type: "uuid", isNullable: false },
                { name: "service_provider_id", type: "uuid", isNullable: false },
                { name: "start_time", type: "timestamp with time zone", isNullable: false },
                { name: "end_time", type: "timestamp with time zone", isNullable: true },
                { name: "status", type: "enum", enumName: "bookings_status_enum", default: `'PENDING'`, isNullable: false },
                { name: "total_cost", type: "decimal", precision: 10, scale: 2, isNullable: true },
                { name: "notes", type: "text", isNullable: true },
                { name: "created_at", type: "timestamp with time zone", default: "now()" },
                { name: "updated_at", type: "timestamp with time zone", default: "now()" },
            ],
            uniques: [
                { columnNames: ["service_request_id"] }
            ]
        }));

        await queryRunner.createForeignKey("bookings", new TableForeignKey({
            columnNames: ["service_request_id"],
            referencedTableName: "service_requests",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("bookings", new TableForeignKey({
            columnNames: ["service_id"],
            referencedTableName: "services",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT"
        }));

        await queryRunner.createForeignKey("bookings", new TableForeignKey({
            columnNames: ["consumer_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT"
        }));

        await queryRunner.createForeignKey("bookings", new TableForeignKey({
            columnNames: ["service_provider_id"],
            referencedTableName: "service_providers",
            referencedColumnNames: ["user_id"],
            onDelete: "RESTRICT"
        }));

        // Create ratings_reviews table
        await queryRunner.createTable(new Table({
            name: "ratings_reviews",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "service_request_id", type: "uuid", isUnique: true, isNullable: false },
                { name: "consumer_id", type: "uuid", isNullable: false },
                { name: "service_provider_id", type: "uuid", isNullable: false },
                { name: "rating", type: "int", isNullable: false },
                { name: "review_text", type: "text", isNullable: true },
                { name: "created_at", type: "timestamp with time zone", default: "now()" },
                { name: "updated_at", type: "timestamp with time zone", default: "now()" },
            ],
            uniques: [
                { columnNames: ["service_request_id"] }
            ]
        }));

        await queryRunner.createForeignKey("ratings_reviews", new TableForeignKey({
            columnNames: ["service_request_id"],
            referencedTableName: "service_requests",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("ratings_reviews", new TableForeignKey({
            columnNames: ["consumer_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT"
        }));

        await queryRunner.createForeignKey("ratings_reviews", new TableForeignKey({
            columnNames: ["service_provider_id"],
            referencedTableName: "service_providers",
            referencedColumnNames: ["user_id"],
            onDelete: "RESTRICT"
        }));

        // Many-to-Many relationship table for ServiceProvider and Locality
        await queryRunner.createTable(new Table({
            name: "service_provider_localities",
            columns: [
                { name: "service_provider_id", type: "uuid", isPrimary: true },
                { name: "locality_id", type: "uuid", isPrimary: true },
                { name: "assigned_at", type: "timestamp with time zone", default: "now()" },
            ],
            foreignKeys: [
                {
                    columnNames: ["service_provider_id"],
                    referencedTableName: "service_providers",
                    referencedColumnNames: ["user_id"],
                    onDelete: "CASCADE"
                },
                {
                    columnNames: ["locality_id"],
                    referencedTableName: "localities",
                    referencedColumnNames: ["id"],
                    onDelete: "CASCADE"
                },
            ]
        }));

        // Add indexes for frequently queried columns for performance
        await queryRunner.createIndex("service_requests", new TableIndex({
            name: "IDX_service_requests_consumer_id",
            columnNames: ["consumer_id"],
        }));
        await queryRunner.createIndex("service_requests", new TableIndex({
            name: "IDX_service_requests_service_provider_id",
            columnNames: ["service_provider_id"],
        }));
        await queryRunner.createIndex("service_requests", new TableIndex({
            name: "IDX_service_requests_locality_id",
            columnNames: ["locality_id"],
        }));
        await queryRunner.createIndex("localities", new TableIndex({
            name: "IDX_localities_district_id",
            columnNames: ["district_id"],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        // Drop indexes first
        await queryRunner.dropIndex("service_requests", "IDX_service_requests_consumer_id");
        await queryRunner.dropIndex("service_requests", "IDX_service_requests_service_provider_id");
        await queryRunner.dropIndex("service_requests", "IDX_service_requests_locality_id");
        await queryRunner.dropIndex("localities", "IDX_localities_district_id");


        // Drop foreign keys in reverse order of creation or dependency
        await queryRunner.dropForeignKey("service_provider_localities", "FK_service_provider_localities_service_provider"); // Assuming a name, adjust if needed
        await queryRunner.dropForeignKey("service_provider_localities", "FK_service_provider_localities_locality"); // Assuming a name, adjust if needed

        await queryRunner.dropForeignKey("ratings_reviews", "FK_e8bef70d6ae75899c8de2bdf7ac"); // Using the generated name from schema dump for consistency
        await queryRunner.dropForeignKey("ratings_reviews", "FK_ratings_reviews_consumer"); // Adjust name
        await queryRunner.dropForeignKey("ratings_reviews", "FK_ratings_reviews_service_provider"); // Adjust name

        await queryRunner.dropForeignKey("bookings", "FK_bookings_service_request"); // Adjust name
        await queryRunner.dropForeignKey("bookings", "FK_df22e2beaabc33a432b4f65e3c2"); // Using the generated name from schema dump for consistency
        await queryRunner.dropForeignKey("bookings", "FK_bookings_consumer"); // Adjust name
        await queryRunner.dropForeignKey("bookings", "FK_bookings_service_provider"); // Adjust name

        // Drop service_requests foreign keys
        await queryRunner.dropForeignKey("service_requests", "FK_e0b22dfd82074364f7cf39de64d"); // Using the generated name from schema dump for consistency
        await queryRunner.dropForeignKey("service_requests", "FK_service_requests_consumer"); // Adjust name
        await queryRunner.dropForeignKey("service_requests", "FK_service_requests_service_provider"); // Adjust name
        await queryRunner.dropForeignKey("service_requests", "FK_service_requests_locality"); // Adjust name

        // Drop services foreign keys
        await queryRunner.dropForeignKey("services", "FK_services_service_type"); // Adjust name
        await queryRunner.dropForeignKey("services", "FK_services_service_provider"); // Adjust name

        await queryRunner.dropForeignKey("service_providers", "FK_service_providers_user"); // Adjust name

        await queryRunner.dropForeignKey("service_types", "FK_service_types_category"); // Adjust name

        await queryRunner.dropForeignKey("localities", "FK_localities_district"); // Adjust name, this is the new FK
        await queryRunner.dropForeignKey("districts", "FK_districts_state"); // Adjust name


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
        await queryRunner.dropTable("users");

        // Drop the custom enum types
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."bookings_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."service_request_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."base_fare_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_role_enum"`);

        // Drop the uuid-ossp extension if it's no longer used by any other tables/migrations
        await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
    }
}
