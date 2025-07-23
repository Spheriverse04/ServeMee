// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Entities
import { User } from './user/user.entity';
import { ServiceProvider } from './service-provider/service-provider.entity';
import { Service } from './service/service.entity';
import { Booking } from './booking/booking.entity';
import { Locality } from './locality/locality.entity';
import { ServiceCategory } from './service-category/service-category.entity';
import { ServiceType } from './service-type/service-type.entity';
import { ServiceRequest } from './service-request/service-request.entity';
import { RatingReview } from './rating-review/rating-review.entity';
import { Country } from './country/country.entity';
import { State } from './state/state.entity';
import { District } from './district/district.entity';

// Modules
import { AuthModule } from './auth/auth.module';
import { FirebaseService } from './config/firebase/firebase.service';
import { ServiceModule } from './service/service.module';
import { BookingModule } from './booking/booking.module';
import { LocalityModule } from './locality/locality.module';
import { ServiceCategoryModule } from './service-category/service-category.module';
import { ServiceTypeModule } from './service-type/service-type.module';
import { ServiceRequestModule } from './service-request/service-request.module';
import { RatingReviewModule } from './rating-review/rating-review.module';
import { CountryModule } from './country/country.module';
import { StateModule } from './state/state.module';
import { DistrictModule } from './district/district.module';
import { ServiceProviderModule } from './service-provider/service-provider.module'; // ✅ ADD THIS

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
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
        Country,
        State,
        District,
      ],
      synchronize: false,
      logging: true,
      migrations: [__dirname + '/migration/**/*.ts'],
      migrationsRun: false,
    }),
    AuthModule,
    ServiceModule,
    BookingModule,
    LocalityModule,
    ServiceCategoryModule,
    ServiceTypeModule,
    ServiceRequestModule,
    RatingReviewModule,
    CountryModule,
    StateModule,
    DistrictModule,
    ServiceProviderModule, // ✅ REGISTERED HERE
  ],
  controllers: [AppController],
  providers: [AppService, FirebaseService],
})
export class AppModule {}

