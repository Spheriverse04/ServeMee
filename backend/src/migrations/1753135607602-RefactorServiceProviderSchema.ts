import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RefactorServiceProviderSchema1753135607602 implements MigrationInterface {
    name = 'RefactorServiceProviderSchema1753135607602'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Adding IF EXISTS to DROP CONSTRAINT statements
        await queryRunner.query(`ALTER TABLE "service_types" DROP CONSTRAINT IF EXISTS "service_types_category_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "service_requests" DROP CONSTRAINT IF EXISTS "service_requests_consumer_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "service_requests" DROP CONSTRAINT IF EXISTS "service_requests_service_provider_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "service_requests" DROP CONSTRAINT IF EXISTS "service_requests_service_type_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "ratings_reviews" DROP CONSTRAINT IF EXISTS "ratings_reviews_service_request_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "ratings_reviews" DROP CONSTRAINT IF EXISTS "ratings_reviews_consumer_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "ratings_reviews" DROP CONSTRAINT IF EXISTS "ratings_reviews_service_provider_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT IF EXISTS "FK_8b619ef0a4fe392dbde07eee1e2"`);
        await queryRunner.query(`ALTER TABLE "service_provider_localities" DROP CONSTRAINT IF EXISTS "service_provider_localities_service_provider_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "service_provider_localities" DROP CONSTRAINT IF EXISTS "service_provider_localities_locality_id_fkey"`);

        // Adding IF EXISTS to DROP INDEX statements
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_service_requests_location"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_service_requests_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_service_requests_consumer_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_service_requests_service_provider_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_ratings_reviews_provider_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_localities_geometry"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_users_firebase_uid"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_users_role"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_users_phone_number"`);

        // Other alterations (DROP CONSTRAINT, DROP COLUMN, etc.) should be checked similarly
        // Adding IF EXISTS to DROP CONSTRAINT and checking for COLUMN existence for DROP COLUMN
        await queryRunner.query(`ALTER TABLE "ratings_reviews" DROP CONSTRAINT IF EXISTS "ratings_reviews_rating_check"`);
        await queryRunner.query(`ALTER TABLE "service_types" DROP CONSTRAINT IF EXISTS "service_types_category_id_name_key"`);

        await queryRunner.query(`ALTER TABLE "service_requests" DROP COLUMN "service_address"`);
        await queryRunner.query(`ALTER TABLE "service_requests" DROP COLUMN "payment_status"`);
        await queryRunner.query(`ALTER TABLE "service_requests" DROP COLUMN "payment_method"`);
        await queryRunner.query(`ALTER TABLE "service_requests" DROP COLUMN "request_details"`);
        await queryRunner.query(`ALTER TABLE "service_requests" DROP COLUMN "requested_at"`);
        await queryRunner.query(`ALTER TABLE "localities" DROP COLUMN "polygon_geometry"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "providerId"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_username_key"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "displayName"`);
        await queryRunner.query(`ALTER TABLE "service_provider_localities" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "service_provider_localities" DROP COLUMN "updated_at"`);

        // Add service_type_id to services table
        await queryRunner.query(`ALTER TABLE "services" ADD "service_type_id" uuid NULL`);

        // Ensure a default service category exists if not already present
        await queryRunner.query(`
            INSERT INTO "service_categories" ("id", "name", "description", "created_at", "updated_at")
            VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'General', 'Default category for services', NOW(), NOW())
            ON CONFLICT (id) DO NOTHING;
        `);

        // Ensure a default service type exists if not already present, linked to the default category
        await queryRunner.query(`
            INSERT INTO "service_types" ("id", "category_id", "name", "description", "base_fare_type", "created_at", "updated_at")
            VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Miscellaneous Service', 'Default service type for existing services', 'flat_rate', NOW(), NOW())
            ON CONFLICT (id) DO NOTHING;
        `);

        // Then update the existing services with this new default service_type_id
        await queryRunner.query(`UPDATE "services" SET "service_type_id" = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' WHERE "service_type_id" IS NULL`);

        // Then make the column non-nullable
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "service_type_id" SET NOT NULL`);

        // Create the service_providers table
        await queryRunner.query(`CREATE TABLE "service_providers" ("user_id" uuid NOT NULL, "description" text, "passport_photo_url" text, "is_verified" boolean NOT NULL DEFAULT false, "average_rating" numeric(2,1) NOT NULL DEFAULT '0.0', "total_ratings" integer NOT NULL DEFAULT 0, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_406b1297cc8908f97e68e08d6c7" PRIMARY KEY ("user_id"))`);

        // Re-add foreign key constraints
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_c9ee69a455a15998a1c97a5513c" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        // Drop the constraint if it already exists before re-adding it
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_firebase_uid_key"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "users_firebase_uid_key" UNIQUE ("firebase_uid")`);
        await queryRunner.query(`ALTER TABLE "service_providers" ADD CONSTRAINT "FK_406b1297cc8908f97e68e08d6c7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_provider_localities" ADD CONSTRAINT "FK_b6237b67946924b1386448e647c" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_provider_localities" ADD CONSTRAINT "FK_a3a79d40b957e8417c8008c26f6" FOREIGN KEY ("locality_id") REFERENCES "localities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_requests" ADD CONSTRAINT "FK_c7eb34c11b025805dd09440f37d" FOREIGN KEY ("consumer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_requests" ADD CONSTRAINT "FK_8a5a6a6f6f6f6f6f6f6f6f6f6f6" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_requests" ADD CONSTRAINT "FK_d9a8a8a8a8a8a8a8a8a8a8a8a8a" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ratings_reviews" ADD CONSTRAINT "FK_e1b1b1b1b1b1b1b1b1b1b1b1b1b" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ratings_reviews" ADD CONSTRAINT "FK_f2c2c2c2c2c2c2c2c2c2c2c2c2c" FOREIGN KEY ("consumer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ratings_reviews" ADD CONSTRAINT "FK_g3d3d3d3d3d3d3d3d3d3d3d3d3d" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        // Re-create check constraints or unique constraints if needed after column drops/additions
        await queryRunner.query(`ALTER TABLE "ratings_reviews" ADD CONSTRAINT "CHK_rating_range" CHECK (rating >= 1 AND rating <= 5)`);
        await queryRunner.query(`ALTER TABLE "service_types" ADD CONSTRAINT "UQ_category_id_name" UNIQUE ("category_id", "name")`);

        // Add 'location' column to 'service_requests' if it does not exist
        const serviceRequestsTable = await queryRunner.getTable("service_requests");
        const locationColumnExists = serviceRequestsTable?.columns.some(col => col.name === "location");

        if (!locationColumnExists) {
            await queryRunner.addColumn("service_requests", new TableColumn({
                name: "location",
                type: "geometry(Point,4326)",
                isNullable: true, // Assuming nullable based on common practice for new columns without default values
            }));
        }

        // Add indexes if removed or needed
        await queryRunner.query(`CREATE INDEX "idx_service_requests_location" ON "service_requests" USING GIST ("location")`);
        await queryRunner.query(`CREATE INDEX "idx_service_requests_status" ON "service_requests" ("status")`);
        await queryRunner.query(`CREATE INDEX "idx_service_requests_consumer_id" ON "service_requests" ("consumer_id")`);
        await queryRunner.query(`CREATE INDEX "idx_service_requests_service_provider_id" ON "service_requests" ("service_provider_id")`);
        await queryRunner.query(`CREATE INDEX "idx_ratings_reviews_provider_id" ON "ratings_reviews" ("service_provider_id")`);
        // Add "idx_localities_geometry" index only if "polygon_geometry" column exists
        const localitiesTable = await queryRunner.getTable("localities");
        const polygonGeometryColumnExists = localitiesTable?.columns.some(col => col.name === "polygon_geometry");
        if (polygonGeometryColumnExists) {
            await queryRunner.query(`CREATE INDEX "idx_localities_geometry" ON "localities" USING GIST ("polygon_geometry")`);
        }
        await queryRunner.query(`CREATE INDEX "idx_users_firebase_uid" ON "users" ("firebase_uid")`);
        await queryRunner.query(`CREATE INDEX "idx_users_role" ON "users" ("role")`);
        await queryRunner.query(`CREATE INDEX "idx_users_phone_number" ON "users" ("phone_number")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverse operations in down method (add IF EXISTS/IF NOT EXISTS as appropriate for safety)
        await queryRunner.query(`ALTER TABLE "ratings_reviews" DROP CONSTRAINT IF EXISTS "CHK_rating_range"`);
        await queryRunner.query(`ALTER TABLE "service_types" DROP CONSTRAINT IF EXISTS "UQ_category_id_name"`);

        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_users_phone_number"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_users_role"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_users_firebase_uid"`);
        // Drop "idx_localities_geometry" index only if it exists
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_localities_geometry"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_ratings_reviews_provider_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_service_requests_service_provider_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_service_requests_consumer_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_service_requests_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_service_requests_location"`);

        // Drop 'location' column if it was added in up()
        const serviceRequestsTable = await queryRunner.getTable("service_requests");
        const locationColumnExists = serviceRequestsTable?.columns.some(col => col.name === "location");
        if (locationColumnExists) {
            await queryRunner.dropColumn("service_requests", "location");
        }

        await queryRunner.query(`ALTER TABLE "ratings_reviews" DROP CONSTRAINT IF EXISTS "FK_g3d3d3d3d3d3d3d3d3d3d3d3d3d"`);
        await queryRunner.query(`ALTER TABLE "ratings_reviews" DROP CONSTRAINT IF EXISTS "FK_f2c2c2c2c2c2c2c2c2c2c2c2c2c"`);
        await queryRunner.query(`ALTER TABLE "ratings_reviews" DROP CONSTRAINT IF EXISTS "FK_e1b1b1b1b1b1b1b1b1b1b1b1b1b"`);
        await queryRunner.query(`ALTER TABLE "service_requests" DROP CONSTRAINT IF EXISTS "FK_d9a8a8a8a8a8a8a8a8a8a8a8a8a"`);
        await queryRunner.query(`ALTER TABLE "service_requests" DROP CONSTRAINT IF EXISTS "FK_8a5a6a6f6f6f6f6f6f6f6f6f6f6"`);
        await queryRunner.query(`ALTER TABLE "service_requests" DROP CONSTRAINT IF EXISTS "FK_c7eb34c11b025805dd09440f37d"`);
        await queryRunner.query(`ALTER TABLE "service_provider_localities" DROP CONSTRAINT IF EXISTS "FK_a3a79d40b957e8417c8008c26f6"`);
        await queryRunner.query(`ALTER TABLE "service_provider_localities" DROP CONSTRAINT IF EXISTS "FK_b6237b67946924b1386448e647c"`);
        await queryRunner.query(`ALTER TABLE "service_providers" DROP CONSTRAINT IF EXISTS "FK_406b1297cc8908f97e68e08d6c7"`);
        // Drop constraint if exists before re-adding, for safety in down migration as well
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_firebase_uid_key"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT IF EXISTS "FK_c9ee69a455a15998a1c97a5513c"`);

        await queryRunner.query(`DROP TABLE "service_providers"`); // Drop the table
        // Reverse column NOT NULL change
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "service_type_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "service_type_id"`);

        // Delete the default service type and category that were added in up()
        await queryRunner.query(`DELETE FROM "service_types" WHERE "id" = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'`);
        await queryRunner.query(`DELETE FROM "service_categories" WHERE "id" = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'`);


        // Add back old columns/constraints/indexes if necessary in reverse order of up()
        await queryRunner.query(`ALTER TABLE "service_provider_localities" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "service_provider_localities" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "displayName" varchar(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "username" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "users_username_key" UNIQUE ("username")`);
        await queryRunner.query(`ALTER TABLE "services" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "services" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "services" ADD "providerId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "services" ADD "category" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "localities" ADD "polygon_geometry" geometry(Polygon,4326) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service_requests" ADD "requested_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "service_requests" ADD "request_details" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service_requests" ADD "payment_method" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "service_requests" ADD "payment_status" character varying(50) NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "service_requests" ADD "service_address" character varying NOT NULL`);

        await queryRunner.query(`ALTER TABLE "service_types" ADD CONSTRAINT "service_types_category_id_name_key" UNIQUE ("category_id", "name")`);
        await queryRunner.query(`ALTER TABLE "ratings_reviews" ADD CONSTRAINT "ratings_reviews_rating_check" CHECK (rating >= 1 AND rating <= 5)`);
        await queryRunner.query(`ALTER TABLE "service_provider_localities" ADD CONSTRAINT "service_provider_localities_locality_id_fkey" FOREIGN KEY ("locality_id") REFERENCES "localities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_provider_localities" ADD CONSTRAINT "service_provider_localities_service_provider_id_fkey" FOREIGN KEY ("service_provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_8b619ef0a4fe392dbde07eee1e2" FOREIGN KEY ("providerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_providers" ADD CONSTRAINT "service_providers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ratings_reviews" ADD CONSTRAINT "ratings_reviews_service_provider_id_fkey" FOREIGN KEY ("service_provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ratings_reviews" ADD CONSTRAINT "ratings_reviews_consumer_id_fkey" FOREIGN KEY ("consumer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ratings_reviews" ADD CONSTRAINT "ratings_reviews_service_request_id_fkey" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_service_provider_id_fkey" FOREIGN KEY ("service_provider_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_consumer_id_fkey" FOREIGN KEY ("consumer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_types" ADD CONSTRAINT "service_types_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
}
