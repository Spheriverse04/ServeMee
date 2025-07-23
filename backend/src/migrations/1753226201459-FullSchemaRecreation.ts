import { MigrationInterface, QueryRunner } from "typeorm";

export class FullSchemaRecreation1753226201459 implements MigrationInterface {
    name = 'FullSchemaRecreation1753226201459'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "service_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text, "icon_url" text, "is_active" boolean NOT NULL DEFAULT true, "sort_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_7ef2e28b495d09a4eb28997c653" UNIQUE ("name"), CONSTRAINT "PK_fe4da5476c4ffe5aa2d3524ae68" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ratings_reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "service_request_id" uuid NOT NULL, "consumer_id" uuid NOT NULL, "service_provider_id" uuid NOT NULL, "rating" integer NOT NULL, "review_text" text, "is_verified" boolean NOT NULL DEFAULT true, "helpful_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_e8bef70d6ae75899c8de2bdf7ac" UNIQUE ("service_request_id"), CONSTRAINT "CHK_5701502bb500f5d30f0f59c934" CHECK (rating >= 1 AND rating <= 5), CONSTRAINT "PK_7b074af47390c638b415e2f7376" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service_providers" ("user_id" uuid NOT NULL, "company_name" character varying(255), "description" text, "average_rating" numeric(3,2) NOT NULL DEFAULT '0', "total_ratings" integer NOT NULL DEFAULT '0', "is_verified" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_2cc7c52b39288cadfad8a0ad63c" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "countries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "iso2" character varying(2), "iso3" character varying(3), "numeric_code" character varying(3), "phone_code" character varying(255), "capital" character varying(255), "currency" character varying(255), "currency_name" character varying(255), "currency_symbol" character varying(255), "tld" character varying(255), "native" character varying(255), "region" character varying(255), "subregion" character varying(255), "timezones" jsonb, "latitude" numeric(10,8), "longitude" numeric(11,8), "emoji" character varying(255), "emoji_u" character varying(255), "flag" boolean NOT NULL DEFAULT false, "wiki_data_id" character varying(255), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_a4b58a9f3c44431b37623a096aa" UNIQUE ("numeric_code"), CONSTRAINT "UQ_b29f9172f8b660e7834000c4246" UNIQUE ("iso3"), CONSTRAINT "UQ_9706e3c52695ce44a202f24c26b" UNIQUE ("iso2"), CONSTRAINT "PK_b2d7006793e8697ab3ae2deff18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "states" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "country_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_fd995ee0bec1758b056730f3b84" UNIQUE ("name", "country_id"), CONSTRAINT "PK_09ab30ca0975c02656483265f4f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f3bbd0bc19bb6d8a887add0846" ON "states" ("country_id") `);
        await queryRunner.query(`CREATE TABLE "districts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "state_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_2902a526d13993ccec64a9d5810" UNIQUE ("name", "state_id"), CONSTRAINT "PK_972a72ff4e3bea5c7f43a2b98af" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_18b176b7f592f3a1c55d5e43a8" ON "districts" ("state_id") `);
        await queryRunner.query(`CREATE TABLE "localities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "district_id" uuid, "description" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_88c3b7404cf8430b49ce0041c87" UNIQUE ("name"), CONSTRAINT "PK_7fa2291f3588423d800e02a8479" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."service_requests_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "service_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "service_type_id" uuid NOT NULL, "consumer_id" uuid NOT NULL, "service_provider_id" uuid, "status" "public"."service_requests_status_enum" NOT NULL DEFAULT 'PENDING', "locality_id" uuid, "address" text, "notes" text, "scheduled_time" TIMESTAMP WITH TIME ZONE, "otp_code" character varying(10), "total_cost" numeric(10,2), "accepted_at" TIMESTAMP WITH TIME ZONE, "completed_at" TIMESTAMP WITH TIME ZONE, "cancelled_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ee60bcd826b7e130bfbd97daf66" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fd51374e987547873f53965540" ON "service_requests" ("consumer_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_2c0b2ee39608f22fcd6a9dd977" ON "service_requests" ("service_provider_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_4608c7dc7c2a928d566741952e" ON "service_requests" ("locality_id") `);
        await queryRunner.query(`CREATE TYPE "public"."service_types_base_fare_type_enum" AS ENUM('hourly', 'fixed', 'per_km', 'per_item', 'custom')`);
        await queryRunner.query(`CREATE TABLE "service_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "category_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "description" text, "base_fare_type" "public"."service_types_base_fare_type_enum" NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "sort_order" integer NOT NULL DEFAULT '0', "additional_attributes" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1dc93417a097cdee3491f39d7cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text, "image_url" text, "base_fare" numeric(10,2) NOT NULL DEFAULT '0', "service_type_id" uuid NOT NULL, "service_provider_id" uuid NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."bookings_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startTime" TIMESTAMP WITH TIME ZONE NOT NULL, "endTime" TIMESTAMP WITH TIME ZONE NOT NULL, "agreedPrice" numeric(10,2) NOT NULL, "status" "public"."bookings_status_enum" NOT NULL DEFAULT 'PENDING', "notes" text, "consumer_id" uuid NOT NULL, "service_id" uuid NOT NULL, "service_provider_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('consumer', 'service_provider', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firebase_uid" character varying NOT NULL, "email" character varying NOT NULL, "phone_number" character varying(20), "display_name" character varying(100), "role" "public"."users_role_enum" NOT NULL DEFAULT 'consumer', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_0fd54ced5cc75f7cb92925dd803" UNIQUE ("firebase_uid"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service_provider_localities" ("service_provider_id" uuid NOT NULL, "locality_id" uuid NOT NULL, CONSTRAINT "PK_1de4df8654e7df5ea7c328ac9b6" PRIMARY KEY ("service_provider_id", "locality_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0e7314e9e91cbf8188807543d5" ON "service_provider_localities" ("service_provider_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_af9e647dbb4d4bf3f99f72c20a" ON "service_provider_localities" ("locality_id") `);
        await queryRunner.query(`ALTER TABLE "ratings_reviews" ADD CONSTRAINT "FK_e8bef70d6ae75899c8de2bdf7ac" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ratings_reviews" ADD CONSTRAINT "FK_71d5183c11b7cd8588b9f04881a" FOREIGN KEY ("consumer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ratings_reviews" ADD CONSTRAINT "FK_760ff71aa646ebac4904f5425a8" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_providers" ADD CONSTRAINT "FK_2cc7c52b39288cadfad8a0ad63c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "states" ADD CONSTRAINT "FK_f3bbd0bc19bb6d8a887add08461" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "districts" ADD CONSTRAINT "FK_18b176b7f592f3a1c55d5e43a87" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "localities" ADD CONSTRAINT "FK_3d939c06ffb142e4bf8ac99bf6c" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_requests" ADD CONSTRAINT "FK_e0b22dfd82074364f7cf39de64d" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_requests" ADD CONSTRAINT "FK_fd51374e987547873f539655406" FOREIGN KEY ("consumer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_requests" ADD CONSTRAINT "FK_2c0b2ee39608f22fcd6a9dd9770" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("user_id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_requests" ADD CONSTRAINT "FK_4608c7dc7c2a928d566741952ed" FOREIGN KEY ("locality_id") REFERENCES "localities"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_types" ADD CONSTRAINT "FK_c3f5113950eef9654b8fcb13f9e" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_70d400878cfc6cf1a8dcfcdcf66" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_298e6fc7011a043cf570557f4ee" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_26cb1abfe7ec7479360c8977f8c" FOREIGN KEY ("consumer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_df22e2beaabc33a432b4f65e3c2" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_12a0a22c64de5ca379662109301" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        // Removed the problematic circular foreign key constraint on users table
        // await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a3ffb1c0c8416b9fc6f907b7433" FOREIGN KEY ("id") REFERENCES "service_providers"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_provider_localities" ADD CONSTRAINT "FK_0e7314e9e91cbf8188807543d5c" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("user_id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "service_provider_localities" ADD CONSTRAINT "FK_af9e647dbb4d4bf3f99f72c20a0" FOREIGN KEY ("locality_id") REFERENCES "localities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_provider_localities" DROP CONSTRAINT "FK_af9e647dbb4d4bf3f99f72c20a0"`);
        await queryRunner.query(`ALTER TABLE "service_provider_localities" DROP CONSTRAINT "FK_0e7314e9e91cbf8188807543d5c"`);
        // Removed the problematic circular foreign key constraint on users table
        // await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a3ffb1c0c8416b9fc6f907b7433"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_12a0a22c64de5ca379662109301"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_df22e2beaabc33a432b4f65e3c2"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_26cb1abfe7ec7479360c8977f8c"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_298e6fc7011a043cf570557f4ee"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_70d400878cfc6cf1a8dcfcdcf66"`);
        await queryRunner.query(`ALTER TABLE "service_types" DROP CONSTRAINT "FK_c3f5113950eef9654b8fcb13f9e"`);
        await queryRunner.query(`ALTER TABLE "service_requests" DROP CONSTRAINT "FK_4608c7dc7c2a928d566741952ed"`);
        await queryRunner.query(`ALTER TABLE "service_requests" DROP CONSTRAINT "FK_2c0b2ee39608f22fcd6a9dd9770"`);
        await queryRunner.query(`ALTER TABLE "service_requests" DROP CONSTRAINT "FK_fd51374e987547873f539655406"`);
        await queryRunner.query(`ALTER TABLE "service_requests" DROP CONSTRAINT "FK_e0b22dfd82074364f7cf39de64d"`);
        await queryRunner.query(`ALTER TABLE "localities" DROP CONSTRAINT "FK_3d939c06ffb142e4bf8ac99bf6c"`);
        await queryRunner.query(`ALTER TABLE "districts" DROP CONSTRAINT "FK_18b176b7f592f3a1c55d5e43a87"`);
        await queryRunner.query(`ALTER TABLE "states" DROP CONSTRAINT "FK_f3bbd0bc19bb6d8a887add08461"`);
        await queryRunner.query(`ALTER TABLE "service_providers" DROP CONSTRAINT "FK_2cc7c52b39288cadfad8a0ad63c"`);
        await queryRunner.query(`ALTER TABLE "ratings_reviews" DROP CONSTRAINT "FK_760ff71aa646ebac4904f5425a8"`);
        await queryRunner.query(`ALTER TABLE "ratings_reviews" DROP CONSTRAINT "FK_71d5183c11b7cd8588b9f04881a"`);
        await queryRunner.query(`ALTER TABLE "ratings_reviews" DROP CONSTRAINT "FK_e8bef70d6ae75899c8de2bdf7ac"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_af9e647dbb4d4bf3f99f72c20a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0e7314e9e91cbf8188807543d5"`);
        await queryRunner.query(`DROP TABLE "service_provider_localities"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TYPE "public"."bookings_status_enum"`);
        await queryRunner.query(`DROP TABLE "services"`);
        await queryRunner.query(`DROP TABLE "service_types"`);
        await queryRunner.query(`DROP TYPE "public"."service_types_base_fare_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4608c7dc7c2a928d566741952e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2c0b2ee39608f22fcd6a9dd977"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fd51374e987547873f53965540"`);
        await queryRunner.query(`DROP TABLE "service_requests"`);
        await queryRunner.query(`DROP TYPE "public"."service_requests_status_enum"`);
        await queryRunner.query(`DROP TABLE "localities"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_18b176b7f592f3a1c55d5e43a8"`);
        await queryRunner.query(`DROP TABLE "districts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f3bbd0bc19bb6d8a887add0846"`);
        await queryRunner.query(`DROP TABLE "states"`);
        await queryRunner.query(`DROP TABLE "countries"`);
        await queryRunner.query(`DROP TABLE "service_providers"`);
        await queryRunner.query(`DROP TABLE "ratings_reviews"`);
        await queryRunner.query(`DROP TABLE "service_categories"`);
    }
}
