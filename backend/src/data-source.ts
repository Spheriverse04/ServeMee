import 'reflect-metadata'; // IMPORTANT: Keep this at the very top
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './user/user.entity';
import { Service } from './service/service.entity'; // Import Service entity
import { Booking } from './booking/booking.entity'; // Import Booking entity

config(); // Load environment variables from .env

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST!,
  port: parseInt(process.env.DATABASE_PORT!, 10),
  username: process.env.DATABASE_USERNAME!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE_NAME!,
  entities: [
    User,
    Service, // Add Service here
    Booking  // Add Booking here
  ],
  // Ensure this path matches the one in app.module.ts
  migrations: [__dirname + '/migration/**/*.ts'], // Use 'migrations' folder
  synchronize: false,
  logging: ['query', 'error'], // This logging is fine, or change to true for more verbosity
});
