// src/booking/booking.controller.ts
import { Controller, Post, Get, Patch, Delete, Body, Param, Req, UseGuards, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { UserRole } from '../auth/roles/roles.enum';
import { Request } from 'express';
import { User } from '../user/user.entity'; // Import User for type hinting

@UseGuards(FirebaseAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  /**
   * Endpoint for consumers to create a new booking.
   * Only consumers can make new bookings.
   * POST /bookings
   */
  @Post()
  @Roles(UserRole.CONSUMER)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @Req() req: Request & { user: User }, // Type the request to include user
  ) {
    const consumerId = req.user.id; // Access user from req.user
    const booking = await this.bookingService.createBooking(createBookingDto, consumerId);
    return {
      message: 'Booking created successfully!',
      booking,
    };
  }

  /**
   * Endpoint for consumers AND service providers to view their respective bookings.
   * GET /bookings
   */
  @Get()
  @Roles(UserRole.CONSUMER, UserRole.SERVICE_PROVIDER)
  async findAll(@Req() req: Request & { user: User }) { // Type the request
    const userId = req.user.id;
    const userRole = req.user.role;
    // Corrected method name: from findAllBookingsForUser to findBookingsForUser
    const bookings = await this.bookingService.findBookingsForUser(userId, userRole as UserRole);
    return {
      message: 'Bookings fetched successfully!',
      bookings,
    };
  }

  /**
   * Endpoint for consumers AND service providers to view a single booking by ID.
   * GET /bookings/:id
   */
  @Get(':id')
  @Roles(UserRole.CONSUMER, UserRole.SERVICE_PROVIDER)
  async findOne(@Param('id') id: string, @Req() req: Request & { user: User }) { // Type the request
    const userId = req.user.id;
    const userRole = req.user.role;
    // Corrected method name: from findOneBookingForUser to findOneBookingByIdAndUser
    const booking = await this.bookingService.findOneBookingByIdAndUser(id, userId, userRole as UserRole);
    if (!booking) {
      throw new NotFoundException('Booking not found or you do not have permission.');
    }
    return {
      message: 'Booking fetched successfully!',
      booking,
    };
  }

  /**
   * Endpoint for consumers to update their own booking (e.g., change time/notes).
   * PATCH /bookings/:id
   */
  @Patch(':id')
  @Roles(UserRole.CONSUMER)
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Req() req: Request & { user: User },
  ) {
    const consumerId = req.user.id;
    const updatedBooking = await this.bookingService.updateBooking(id, updateBookingDto, consumerId);
    return {
      message: 'Booking updated successfully!',
      booking: updatedBooking,
    };
  }

  /**
   * Endpoint for consumers OR service providers to cancel a booking.
   * PATCH /bookings/:id/cancel
   */
  @Patch(':id/cancel')
  @Roles(UserRole.CONSUMER, UserRole.SERVICE_PROVIDER)
  async cancel(@Param('id') id: string, @Req() req: Request & { user: User }) { // Type the request
    const userId = req.user.id;
    const userRole = req.user.role;
    const cancelledBooking = await this.bookingService.cancelBooking(id, userId, userRole as UserRole);
    return {
      message: 'Booking cancelled successfully!',
      booking: cancelledBooking,
    };
  }

  /**
   * Endpoint for a service provider to reject a PENDING booking.
   * PATCH /bookings/:id/reject
   */
  @Patch(':id/reject')
  @Roles(UserRole.SERVICE_PROVIDER)
  async reject(@Param('id') id: string, @Req() req: Request & { user: User }) { // Type the request
    const providerId = req.user.id;
    const rejectedBooking = await this.bookingService.rejectBooking(id, providerId);
    return {
      message: 'Booking rejected successfully!',
      booking: rejectedBooking,
    };
  }

  /**
   * Endpoint for a service provider to mark a CONFIRMED booking as COMPLETED.
   * PATCH /bookings/:id/complete
   */
  @Patch(':id/complete')
  @Roles(UserRole.SERVICE_PROVIDER)
  async complete(@Param('id') id: string, @Req() req: Request & { user: User }) { // Type the request
    const providerId = req.user.id;
    const completedBooking = await this.bookingService.completeBooking(id, providerId);
    return {
      message: 'Booking completed successfully!',
      booking: completedBooking,
    };
  }
}
