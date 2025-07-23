// backend/src/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './user/user.entity';
import { Service } from './service/service.entity';
import { Booking } from './booking/booking.entity';
import { Locality } from './locality/locality.entity';
import { ServiceCategory } from './service-category/service-category.entity';
import { ServiceType } from './service-type/service-type.entity';
import { ServiceRequest } from './service-request/service-request.entity';
import { RatingReview } from './rating-review/rating-review.entity';
import { ServiceProvider } from './service-provider/service-provider.entity';

// --- NEW IMPORTS FOR GEOGRAPHICAL HIERARCHY ---
import { Country } from './country/country.entity';
import { State } from './state/state.entity';
import { District } from './district/district.entity';
// --- END NEW IMPORTS ---

config(); // Load environment variables from .env file

export const AppDataSource = new DataSource({
  type: 'postgres',
  // Provide fallback empty strings or default values instead of '!'
  host: process.env.DATABASE_HOST || 'localhost', // Provide a sensible default or ensure .env is loaded
  port: parseInt(process.env.DATABASE_PORT || '5432', 10), // Default to 5432 if not set
  username: process.env.DATABASE_USERNAME || 'postgres', // Default username
  password: process.env.DATABASE_PASSWORD || 'postgres', // Default password
  database: process.env.DATABASE_NAME || 'servemee_db', // Default database name
  entities: [
    User,
    Service,
    Booking,
    Locality,
    ServiceCategory,
    ServiceType,
    ServiceRequest,
    RatingReview,
    ServiceProvider,
    Country,
    State,
    District,
  ],
  migrations: [__dirname + '/migrations/**/*.ts'], // Ensure this path is correct for your migrations
  synchronize: false, // Keep this false for production, rely on migrations
  logging: ['query', 'error'], // Log SQL queries and errors
});
