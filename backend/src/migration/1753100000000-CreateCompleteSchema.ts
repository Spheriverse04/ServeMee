import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCompleteSchema1753100000000 implements MigrationInterface {
    name = 'CreateCompleteSchema1753100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable required extensions
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "postgis"`);

        // Create localities table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "localities" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(255) UNIQUE NOT NULL,
                "polygon_geometry" geometry(POLYGON, 4326) NOT NULL,
                "description" text,
                "is_active" boolean DEFAULT true NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
            )
        `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_localities_geometry" ON "localities" USING GIST ("polygon_geometry")`);

        // Create service_categories table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "service_categories" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(255) UNIQUE NOT NULL,
                "description" text,
                "icon_url" text,
                "is_active" boolean DEFAULT true NOT NULL,
                "sort_order" integer DEFAULT 0 NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
            )
        `);

        // Create service_types table
        await queryRunner.query(`
            CREATE TYPE "service_types_base_fare_type_enum" AS ENUM('hourly', 'fixed', 'per_km', 'per_item', 'custom')
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "service_types" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "category_id" uuid NOT NULL,
                "name" varchar(255) NOT NULL,
                "description" text,
                "base_fare_type" "service_types_base_fare_type_enum" NOT NULL,
                "is_active" boolean DEFAULT true NOT NULL,
                "sort_order" integer DEFAULT 0 NOT NULL,
                "additional_attributes" jsonb,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                CONSTRAINT "FK_service_types_category" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE CASCADE,
                UNIQUE ("category_id", "name")
            )
        `);

        // Update users table with new columns
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN IF NOT EXISTS "passport_photo_url" text,
            ADD COLUMN IF NOT EXISTS "is_verified" boolean DEFAULT false NOT NULL,
            ADD COLUMN IF NOT EXISTS "average_rating" decimal(2,1) DEFAULT 0.0 NOT NULL,
            ADD COLUMN IF NOT EXISTS "total_ratings" integer DEFAULT 0 NOT NULL,
            ADD COLUMN IF NOT EXISTS "description" text
        `);

        // Update services table structure
        await queryRunner.query(`
            ALTER TABLE "services" 
            ADD COLUMN IF NOT EXISTS "service_type_id" uuid,
            ADD COLUMN IF NOT EXISTS "base_fare" decimal(10,2),
            ADD COLUMN IF NOT EXISTS "is_available" boolean DEFAULT true NOT NULL,
            ADD COLUMN IF NOT EXISTS "additional_attributes" jsonb,
            ADD COLUMN IF NOT EXISTS "average_rating" decimal(2,1) DEFAULT 0.0 NOT NULL,
            ADD COLUMN IF NOT EXISTS "total_ratings" integer DEFAULT 0 NOT NULL
        `);

        // Rename columns in services table to match entity
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'providerId') THEN
                    ALTER TABLE "services" RENAME COLUMN "providerId" TO "provider_id";
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'imageUrl') THEN
                    ALTER TABLE "services" RENAME COLUMN "imageUrl" TO "image_url";
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'isActive') THEN
                    ALTER TABLE "services" RENAME COLUMN "isActive" TO "is_active";
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'createdAt') THEN
                    ALTER TABLE "services" RENAME COLUMN "createdAt" TO "created_at";
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'updatedAt') THEN
                    ALTER TABLE "services" RENAME COLUMN "updatedAt" TO "updated_at";
                END IF;
            END $$;
        `);

        // Create service_requests table
        await queryRunner.query(`
            CREATE TYPE "service_requests_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED')
        `);

        await queryRunner.query(`
            CREATE TYPE "service_requests_payment_status_enum" AS ENUM('pending', 'paid', 'failed', 'refunded')
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "service_requests" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "consumer_id" uuid NOT NULL,
                "service_provider_id" uuid,
                "service_type_id" uuid NOT NULL,
                "requested_at_location" geometry(POINT, 4326) NOT NULL,
                "service_address" text NOT NULL,
                "status" "service_requests_status_enum" DEFAULT 'PENDING' NOT NULL,
                "otp_code" varchar(6),
                "total_cost" decimal(10,2),
                "payment_status" "service_requests_payment_status_enum" DEFAULT 'pending' NOT NULL,
                "payment_method" varchar(50),
                "request_details" jsonb,
                "requested_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                "accepted_at" TIMESTAMP WITH TIME ZONE,
                "completed_at" TIMESTAMP WITH TIME ZONE,
                "cancelled_at" TIMESTAMP WITH TIME ZONE,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                CONSTRAINT "FK_service_requests_consumer" FOREIGN KEY ("consumer_id") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_service_requests_provider" FOREIGN KEY ("service_provider_id") REFERENCES "users"("id") ON DELETE SET NULL,
                CONSTRAINT "FK_service_requests_service_type" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE RESTRICT
            )
        `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_service_requests_location" ON "service_requests" USING GIST ("requested_at_location")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_service_requests_status" ON "service_requests" ("status")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_service_requests_consumer_id" ON "service_requests" ("consumer_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_service_requests_provider_id" ON "service_requests" ("service_provider_id")`);

        // Create ratings_reviews table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "ratings_reviews" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "service_request_id" uuid UNIQUE NOT NULL,
                "consumer_id" uuid NOT NULL,
                "service_provider_id" uuid NOT NULL,
                "rating" integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
                "review_text" text,
                "is_verified" boolean DEFAULT true NOT NULL,
                "helpful_count" integer DEFAULT 0 NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                CONSTRAINT "FK_ratings_reviews_service_request" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_ratings_reviews_consumer" FOREIGN KEY ("consumer_id") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_ratings_reviews_provider" FOREIGN KEY ("service_provider_id") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_ratings_reviews_provider_id" ON "ratings_reviews" ("service_provider_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_ratings_reviews_created_at" ON "ratings_reviews" ("created_at")`);

        // Add foreign key constraint for services.service_type_id
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'FK_services_service_type'
                ) THEN
                    ALTER TABLE "services" 
                    ADD CONSTRAINT "FK_services_service_type" 
                    FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE RESTRICT;
                END IF;
            END $$;
        `);

        // Add index for services.provider_id
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_services_provider_id" ON "services" ("provider_id")`);

        // Insert default service categories
        await queryRunner.query(`
            INSERT INTO "service_categories" ("name", "description", "sort_order") VALUES
            ('Household Services', 'Home maintenance and repair services', 1),
            ('Food & Beverage', 'Food delivery and catering services', 2),
            ('Transportation', 'Vehicle and transportation services', 3),
            ('Healthcare', 'Medical and wellness services', 4),
            ('Beauty & Personal Care', 'Beauty and grooming services', 5),
            ('Education & Training', 'Learning and skill development services', 6),
            ('Professional Services', 'Business and professional consulting', 7),
            ('Entertainment', 'Event and entertainment services', 8)
            ON CONFLICT (name) DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order
        await queryRunner.query(`DROP TABLE IF EXISTS "ratings_reviews" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "service_requests" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "service_types" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "service_categories" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "localities" CASCADE`);

        // Drop enums
        await queryRunner.query(`DROP TYPE IF EXISTS "service_requests_payment_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "service_requests_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "service_types_base_fare_type_enum"`);

        // Remove added columns from users table
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN IF EXISTS "passport_photo_url",
            DROP COLUMN IF EXISTS "is_verified",
            DROP COLUMN IF EXISTS "average_rating",
            DROP COLUMN IF EXISTS "total_ratings",
            DROP COLUMN IF EXISTS "description"
        `);

        // Remove added columns from services table
        await queryRunner.query(`
            ALTER TABLE "services" 
            DROP COLUMN IF EXISTS "service_type_id",
            DROP COLUMN IF EXISTS "base_fare",
            DROP COLUMN IF EXISTS "is_available",
            DROP COLUMN IF EXISTS "additional_attributes",
            DROP COLUMN IF EXISTS "average_rating",
            DROP COLUMN IF EXISTS "total_ratings"
        `);

        // Revert column names in services table
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'provider_id') THEN
                    ALTER TABLE "services" RENAME COLUMN "provider_id" TO "providerId";
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'image_url') THEN
                    ALTER TABLE "services" RENAME COLUMN "image_url" TO "imageUrl";
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'is_active') THEN
                    ALTER TABLE "services" RENAME COLUMN "is_active" TO "isActive";
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'created_at') THEN
                    ALTER TABLE "services" RENAME COLUMN "created_at" TO "createdAt";
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'updated_at') THEN
                    ALTER TABLE "services" RENAME COLUMN "updated_at" TO "updatedAt";
                END IF;
            END $$;
        `);
    }
}