// ormconfig.ts
import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './src/user/user.entity';
import { Service } from './src/service/service.entity';
import { Booking } from './src/booking/booking.entity';
import { Locality } from './src/locality/locality.entity';
import { ServiceCategory } from './src/service-category/service-category.entity';
import { ServiceType } from './src/service-type/service-type.entity';
import { ServiceRequest } from './src/service-request/service-request.entity';
import { RatingReview } from './src/rating-review/rating-review.entity';

dotenv.config(); // Load environment variables from .env

const config: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [
    User,
    Service,
    Booking,
    Locality,
    ServiceCategory,
    ServiceType,
    ServiceRequest,
    RatingReview,
  ],
  synchronize: false, // ALWAYS false in production. True only for rapid development or initial setup.
  logging: true,
  migrations: [__dirname + '/src/migration/**/*.ts'], // Path to your migration files
  // cli: {
  //   migrationsDir: 'src/migration', // This is for generating migrations
  // },
};

export default config;
