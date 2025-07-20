// servemee/backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user/user.entity'; // Import the user entity
import { Service } from './service/service.entity';
import { AuthModule } from './auth/auth.module';
import { FirebaseService } from './config/firebase/firebase.service';
import { ServiceModule } from './service/service.module';
import { Booking } from './booking/booking.entity';
import { BookingModule } from './booking/booking.module';

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
      entities: [User, Service, Booking], // We'll add our entities here later
      synchronize: false, // Set to false in production! Use migrations.
      logging: true, // Enable logging for debugging
      // Add migrations configuration
      migrations: [__dirname + '/migration/**/*.ts'], // Path to your migration files
      migrationsRun: false, // Don't run migrations automatically on startup
    }),
    AuthModule,
    ServiceModule,
    //UserModule, 
    BookingModule,
  ],
  controllers: [AppController],
  providers: [AppService, FirebaseService],
})
export class AppModule {}
