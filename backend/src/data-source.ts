// backend/src/data-source.ts (Updated)
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
import { ServiceProvider } from './service-provider/service-provider.entity'; // Import ServiceProvider

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST!,
  port: parseInt(process.env.DATABASE_PORT!, 10),
  username: process.env.DATABASE_USERNAME!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE_NAME!,
  entities: [
    User,
    Service,
    Booking,
    Locality,
    ServiceCategory,
    ServiceType,
    ServiceRequest,
    RatingReview,
    ServiceProvider // Add ServiceProvider here
  ],
  migrations: [__dirname + '/migrations/**/*.ts'],
  synchronize: false,
  logging: ['query', 'error'],
});
