// src/booking/booking.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { BookingService } from './booking.service';
import { User } from '../user/user.entity'; // Import User entity
import { Service } from '../service/service.entity'; // Import Service entity
import { AuthModule } from '../auth/auth.module'; // Import AuthModule for guards
import { BookingController } from './booking.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, User, Service]), // Provide repositories for Booking, User, and Service
    AuthModule, // Import AuthModule to use FirebaseAuthGuard and RolesGuard in the controller
  ],
  providers: [BookingService],
  controllers: [BookingController], // We will add BookingController here in the next step
  exports: [BookingService] // Export BookingService if other modules might need to inject it
})
export class BookingModule {}
