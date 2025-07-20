// servemee/backend/src/migrations/1678888888888-InitialSchema.ts (your timestamp will be different)
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1678888888888 implements MigrationInterface {
  name = 'InitialSchema1678888888888';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Copy the SQL DDL from the "SQL DDL for PostgreSQL (Initial Schema)" section above
    // Paste it here within the executeSql calls.

    await queryRunner.query(`
        -- Enable UUID-OSSP extension for UUID generation
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);
    await queryRunner.query(`
        -- Enable PostGIS extension for geographical data types
        CREATE EXTENSION IF NOT EXISTS postgis;
    `);

    await queryRunner.query(`
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            firebase_uid VARCHAR(128) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE,
            phone_number VARCHAR(20) UNIQUE NOT NULL,
            username VARCHAR(50) UNIQUE,
            profile_picture_url TEXT,
            full_name VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
    `);
    await queryRunner.query(`
        CREATE INDEX idx_users_firebase_uid ON users (firebase_uid);
    `);
    await queryRunner.query(`
        CREATE INDEX idx_users_role ON users (role);
    `);
    await queryRunner.query(`
        CREATE INDEX idx_users_phone_number ON users (phone_number);
    `);

    await queryRunner.query(`
        CREATE TABLE service_providers (
            user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            description TEXT,
            passport_photo_url TEXT,
            is_verified BOOLEAN DEFAULT FALSE NOT NULL,
            average_rating NUMERIC(2,1) DEFAULT 0.0 NOT NULL,
            total_ratings INTEGER DEFAULT 0 NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
    `);

    await queryRunner.query(`
        CREATE TABLE localities (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) UNIQUE NOT NULL,
            polygon_geometry GEOMETRY(POLYGON, 4326) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
    `);
    await queryRunner.query(`
        CREATE INDEX idx_localities_geometry ON localities USING GIST (polygon_geometry);
    `);

    await queryRunner.query(`
        CREATE TABLE service_provider_localities (
            service_provider_id UUID NOT NULL REFERENCES service_providers(user_id) ON DELETE CASCADE,
            locality_id UUID NOT NULL REFERENCES localities(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            PRIMARY KEY (service_provider_id, locality_id)
        );
    `);

    await queryRunner.query(`
        CREATE TABLE service_categories (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) UNIQUE NOT NULL,
            description TEXT,
            icon_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
    `);

    await queryRunner.query(`
        CREATE TABLE service_types (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            base_fare_type VARCHAR(50) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            UNIQUE (category_id, name)
        );
    `);

    await queryRunner.query(`
        CREATE TABLE provider_services (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            service_provider_id UUID NOT NULL REFERENCES service_providers(user_id) ON DELETE CASCADE,
            service_type_id UUID NOT NULL REFERENCES service_types(id) ON DELETE CASCADE,
            base_fare NUMERIC(10,2) NOT NULL,
            is_available BOOLEAN DEFAULT TRUE NOT NULL,
            additional_attributes JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            UNIQUE (service_provider_id, service_type_id)
        );
    `);

    await queryRunner.query(`
        CREATE TABLE service_requests (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            consumer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            service_provider_id UUID REFERENCES service_providers(user_id) ON DELETE SET NULL,
            service_type_id UUID NOT NULL REFERENCES service_types(id) ON DELETE RESTRICT,
            requested_at_location GEOMETRY(POINT, 4326) NOT NULL,
            service_address TEXT NOT NULL,
            status VARCHAR(50) NOT NULL,
            otp_code VARCHAR(6),
            total_cost NUMERIC(10,2),
            payment_status VARCHAR(50) DEFAULT 'pending' NOT NULL,
            payment_method VARCHAR(50),
            request_details JSONB,
            requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            accepted_at TIMESTAMP WITH TIME ZONE,
            completed_at TIMESTAMP WITH TIME ZONE,
            cancelled_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
    `);
    await queryRunner.query(`
        CREATE INDEX idx_service_requests_location ON service_requests USING GIST (requested_at_location);
    `);
    await queryRunner.query(`
        CREATE INDEX idx_service_requests_status ON service_requests (status);
    `);
    await queryRunner.query(`
        CREATE INDEX idx_service_requests_consumer_id ON service_requests (consumer_id);
    `);
    await queryRunner.query(`
        CREATE INDEX idx_service_requests_service_provider_id ON service_requests (service_provider_id);
    `);

    await queryRunner.query(`
        CREATE TABLE ratings_reviews (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            service_request_id UUID UNIQUE NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
            consumer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            service_provider_id UUID NOT NULL REFERENCES service_providers(user_id) ON DELETE CASCADE,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            review_text TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
    `);
    await queryRunner.query(`
        CREATE INDEX idx_ratings_reviews_provider_id ON ratings_reviews (service_provider_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Write the reversal (DROP TABLE) statements in reverse order of creation
    await queryRunner.query(`DROP TABLE IF EXISTS ratings_reviews CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS service_requests CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS provider_services CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS service_types CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS service_categories CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS service_provider_localities CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS localities CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS service_providers CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE;`);
    // Drop extensions if they were only for this database and you want to clean up completely
    await queryRunner.query(`DROP EXTENSION IF EXISTS postgis;`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp";`);
  }
}
