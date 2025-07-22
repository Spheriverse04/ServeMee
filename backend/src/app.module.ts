// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user/user.entity'; // Import the user entity
import { ServiceProvider } from './service-provider/service-provider.entity';
import { Service } from './service/service.entity';
import { AuthModule } from './auth/auth.module';
import { FirebaseService } from './config/firebase/firebase.service';
import { ServiceModule } from './service/service.module';
import { Booking } from './booking/booking.entity';
import { BookingModule } from './booking/booking.module';
import { Locality } from './locality/locality.entity';
import { ServiceCategory } from './service-category/service-category.entity';
import { ServiceType } from './service-type/service-type.entity';
import { ServiceRequest } from './service-request/service-request.entity';
import { RatingReview } from './rating-review/rating-review.entity';
import { LocalityModule } from './locality/locality.module';
import { ServiceCategoryModule } from './service-category/service-category.module';
import { ServiceTypeModule } from './service-type/service-type.module';
import { ServiceRequestModule } from './service-request/service-request.module';
import { RatingReviewModule } from './rating-review/rating-review.module';

// --- NEW IMPORTS FOR GEOGRAPHICAL HIERARCHY ---
import { Country } from './country/country.entity';
import { State } from './state/state.entity';
import { District } from './district/district.entity';
import { CountryModule } from './country/country.module';
import { StateModule } from './state/state.module';
import { DistrictModule } from './district/district.module';
// --- END NEW IMPORTS ---

// Assuming dataSourceOptions is not directly used here but TypeOrmModule.forRoot uses direct config
// If you have a separate data-source.ts that exports dataSourceOptions, ensure it's imported or its content is here.
// Example: import { dataSourceOptions } from './data-source';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config module available everywhere
      envFilePath: '.env', // Specify your .env file path
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432', 10), // Convert string to number
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [
        User,
        ServiceProvider,
        Service,
        Booking,
        Locality,
        ServiceCategory,
        ServiceType,
        ServiceRequest,
        RatingReview,
        // --- ADD NEW ENTITIES HERE ---
        Country,
        State,
        District,
        // --- END NEW ENTITIES ---
      ],
      synchronize: false, // Set to false in production! Use migrations.
      logging: true, // Enable logging for debugging
      // Add migrations configuration
      migrations: [__dirname + '/migration/**/*.ts'], // Path to your migration files
      migrationsRun: false, // Don't run migrations automatically on startup
    }),
    AuthModule,
    ServiceModule,
    BookingModule,
    LocalityModule,
    ServiceCategoryModule,
    ServiceTypeModule,
    ServiceRequestModule,
    RatingReviewModule,
    // --- ADD NEW MODULES HERE ---
    CountryModule,
    StateModule,
    DistrictModule,
    // --- END NEW MODULES ---
  ],
  controllers: [AppController],
  providers: [AppService, FirebaseService],
})
export class AppModule {}
