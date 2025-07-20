// src/booking/booking.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Service } from '../service/service.entity';
import { User } from '../user/user.entity';
import { UserRole } from '../auth/roles/roles.enum'; // Import UserRole

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Creates a new service booking.
   * Only consumers can create bookings.
   * Checks if the service exists and if the booking time slot is valid/available.
   * @param createBookingDto Data for creating the booking.
   * @param consumerId The ID of the authenticated consumer.
   * @returns The created booking.
   */
  async createBooking(createBookingDto: CreateBookingDto, consumerId: string): Promise<Booking> {
    const { serviceId, startTime, endTime, agreedPrice } = createBookingDto;

    // 1. Verify Service Exists
    const service = await this.serviceRepository.findOne({ where: { id: serviceId } });
    if (!service) {
      throw new NotFoundException(`Service with ID "${serviceId}" not found.`);
    }

    // 2. Validate Time Slot
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      throw new BadRequestException('Start time must be before end time.');
    }
    if (start < new Date()) {
      throw new BadRequestException('Booking start time cannot be in the past.');
    }

    // Check for overlapping bookings for the same service
    const overlappingBookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.serviceId = :serviceId', { serviceId })
      .andWhere(
        '(:start < booking.endTime AND :end > booking.startTime)',
        { start, end },
      )
      .andWhere('booking.status IN (:...activeStatuses)', {
        activeStatuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      })
      .getMany();

    if (overlappingBookings.length > 0) {
      throw new BadRequestException('The selected time slot conflicts with an existing booking for this service.');
    }

    // 3. Create Booking
    const newBooking = this.bookingRepository.create({
      startTime: start,
      endTime: end,
      agreedPrice: String(agreedPrice), // FIX: Convert number to string
      consumerId: consumerId,
      serviceId: service.id, // FIX: Assign serviceId directly
      status: BookingStatus.PENDING, // Default status for new bookings
    });

    try {
      return await this.bookingRepository.save(newBooking);
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new InternalServerErrorException('Failed to create booking.');
    }
  }

  /**
   * Finds all bookings for a given user (consumer or service provider).
   * @param userId The ID of the authenticated user.
   * @param userRole The role of the authenticated user.
   * @returns An array of bookings.
   * @throws ForbiddenException if the userRole is not recognized or not authorized.
   */
  async findAllBookingsForUser(userId: string, userRole: UserRole): Promise<Booking[]> {
    console.log('[BookingService] Entering findAllBookingsForUser.');
    console.log('[BookingService] User ID parameter:', userId);
    console.log('[BookingService] Raw User Role parameter:', userRole);
    console.log('[BookingService] Type of raw userRole parameter:', typeof userRole);
    console.log('[BookingService] Value of UserRole.CONSUMER:', UserRole.CONSUMER);
    console.log('[BookingService] Value of UserRole.SERVICE_PROVIDER:', UserRole.SERVICE_PROVIDER);
    console.log('[BookingService] Comparison 1: userRole === UserRole.CONSUMER:', userRole === UserRole.CONSUMER);
    console.log('[BookingService] Comparison 2: userRole === UserRole.SERVICE_PROVIDER:', userRole === UserRole.SERVICE_PROVIDER);

    let bookings: Booking[];

    if (userRole === UserRole.CONSUMER) {
      console.log('[BookingService] --- Entered CONSUMER IF block ---');
      bookings = await this.bookingRepository.find({
        where: { consumerId: userId },
        relations: ['service', 'service.provider'], // Include service and its provider
      });
    } else if (userRole === UserRole.SERVICE_PROVIDER) {
      console.log('[BookingService] --- Entered SERVICE_PROVIDER ELSE IF block ---');
      // Find bookings where the authenticated user is the provider of the service
      bookings = await this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.service', 'service')
        .leftJoinAndSelect('service.provider', 'provider') // Explicitly join provider
        .where('service.providerId = :userId', { userId })
        .getMany();
    } else {
      console.log('[BookingService] --- Entered ELSE block (Forbidden) ---');
      throw new ForbiddenException('You do not have permission to view bookings with this role.');
    }

    console.log(`[BookingService] Found ${bookings.length} bookings for user ${userId}.`);
    return bookings;
  }

  /**
   * Finds a single booking for a given user (consumer or service provider).
   * @param bookingId The ID of the booking to find.
   * @param userId The ID of the authenticated user.
   * @param userRole The role of the authenticated user.
   * @returns The booking, or null if not found/authorized.
   * @throws NotFoundException if booking not found, ForbiddenException if not authorized.
   */
  async findOneBookingForUser(bookingId: string, userId: string, userRole: UserRole): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['service', 'service.provider'], // Load service and provider for authorization check
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${bookingId}" not found.`);
    }

    // Authorization check
    if (userRole === UserRole.CONSUMER && booking.consumerId !== userId) {
      throw new ForbiddenException('You are not authorized to view this booking as a consumer.');
    }

    if (userRole === UserRole.SERVICE_PROVIDER && booking.service.providerId !== userId) {
      throw new ForbiddenException('You are not authorized to view this booking as a service provider.');
    }

    // If neither of the above, then the role is not recognized or not linked to the booking
    if (userRole !== UserRole.CONSUMER && userRole !== UserRole.SERVICE_PROVIDER) {
        throw new ForbiddenException('You do not have permission to view bookings with this role.');
    }

    return booking;
  }

  /**
   * Updates a booking.
   * Consumers can update their own PENDING bookings (e.g., reschedule).
   * Service Providers can update bookings related to their services (e.g., add notes).
   * @param bookingId The ID of the booking to update.
   * @param updateBookingDto The data to update.
   * @param userId The ID of the authenticated user (consumer or provider).
   * @param userRole The role of the authenticated user.
   * @returns The updated booking.
   * @throws NotFoundException if booking not found, ForbiddenException if not authorized, BadRequestException if status doesn't allow update.
   */
  async updateBooking(
    bookingId: string,
    updateBookingDto: UpdateBookingDto,
    userId: string,
    userRole: UserRole
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['service'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${bookingId}" not found.`);
    }

    // Authorization check
    if (userRole === UserRole.CONSUMER) {
      if (booking.consumerId !== userId) {
        throw new ForbiddenException('You are not authorized to update this booking as a consumer.');
      }
      // Consumer can only update PENDING bookings (e.g., reschedule)
      if (booking.status !== BookingStatus.PENDING) {
        throw new BadRequestException(`Only PENDING bookings can be updated by a consumer. Current status: ${booking.status}`);
      }
      // Consumer can only update time or agreedPrice
      if (updateBookingDto.notes !== undefined) {
          throw new BadRequestException('Consumers cannot update notes via this endpoint.');
      }
    } else if (userRole === UserRole.SERVICE_PROVIDER) {
      if (booking.service.providerId !== userId) {
        throw new ForbiddenException('You are not authorized to update this booking as a service provider.');
      }
      // Service provider can update notes for any status except COMPLETED/REJECTED/CANCELLED
      if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.REJECTED || booking.status === BookingStatus.CANCELLED) {
          throw new BadRequestException(`Booking cannot be updated as its current status is ${booking.status}.`);
      }
      // Service provider cannot update agreedPrice or time via this general update endpoint
      if (updateBookingDto.startTime || updateBookingDto.endTime || updateBookingDto.agreedPrice !== undefined) {
          throw new BadRequestException('Service providers can only update notes via this endpoint. For other changes, use specific actions like confirm/reject.');
      }
    } else {
      throw new ForbiddenException('You do not have permission to update bookings with this role.');
    }

    // Apply updates
    if (updateBookingDto.startTime) {
      const newStartTime = new Date(updateBookingDto.startTime);
      if (newStartTime >= booking.endTime) {
        throw new BadRequestException('New start time must be before current end time.');
      }
      if (newStartTime < new Date() && userRole === UserRole.CONSUMER) { // Past time check only for consumer rescheduling
        throw new BadRequestException('New start time cannot be in the past.');
      }
      booking.startTime = newStartTime;
    }
    if (updateBookingDto.endTime) {
      const newEndTime = new Date(updateBookingDto.endTime);
      if (newEndTime <= booking.startTime) {
        throw new BadRequestException('New end time must be after current start time.');
      }
      booking.endTime = newEndTime;
    }
    if (updateBookingDto.agreedPrice !== undefined) {
      booking.agreedPrice = String(updateBookingDto.agreedPrice); // FIX: Convert number to string
    }
    if (updateBookingDto.notes !== undefined) {
      booking.notes = updateBookingDto.notes;
    }

    // Re-check for overlaps only if time was updated by consumer
    if ((updateBookingDto.startTime || updateBookingDto.endTime) && userRole === UserRole.CONSUMER) {
        const overlappingBookings = await this.bookingRepository
            .createQueryBuilder('booking')
            .where('booking.serviceId = :serviceId', { serviceId: booking.service.id })
            .andWhere('booking.id != :bookingId', { bookingId }) // Exclude current booking
            .andWhere(
                '(:startTime < booking.endTime AND :endTime > booking.startTime)',
                { startTime: booking.startTime, endTime: booking.endTime },
            )
            .andWhere('booking.status IN (:...activeStatuses)', {
                activeStatuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
            })
            .getMany();

        if (overlappingBookings.length > 0) {
            throw new BadRequestException('The new time slot conflicts with an existing booking for this service.');
        }
    }

    try {
      return await this.bookingRepository.save(booking);
    } catch (error) {
      console.error('Error updating booking:', error);
      throw new InternalServerErrorException('Failed to update booking.');
    }
  }

  /**
   * Confirms a PENDING booking.
   * Only the service provider associated with the service can confirm.
   * @param bookingId The ID of the booking to confirm.
   * @param providerId The ID of the authenticated service provider.
   * @returns The confirmed booking.
   * @throws NotFoundException if booking not found, ForbiddenException if not authorized, BadRequestException if status not PENDING.
   */
  async confirmBooking(bookingId: string, providerId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['service'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${bookingId}" not found.`);
    }
    if (booking.service.providerId !== providerId) {
      throw new ForbiddenException('You are not authorized to confirm this booking.');
    }
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(`Only PENDING bookings can be CONFIRMED. Current status: ${booking.status}`);
    }

    booking.status = BookingStatus.CONFIRMED;
    return this.bookingRepository.save(booking);
  }

  /**
   * Cancels a booking.
   * Consumers can cancel their own PENDING or CONFIRMED bookings.
   * Service providers can cancel PENDING or CONFIRMED bookings for their services.
   * @param bookingId The ID of the booking to cancel.
   * @param userId The ID of the authenticated user.
   * @param userRole The role of the authenticated user.
   * @returns The cancelled booking.
   * @throws NotFoundException if booking not found, ForbiddenException if not authorized, BadRequestException if status doesn't allow cancellation.
   */
  async cancelBooking(bookingId: string, userId: string, userRole: UserRole): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['service'], // Load service for provider check
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${bookingId}" not found.`);
    }

    // Authorization: Consumer can cancel their own, Provider can cancel for their service
    if (userRole === UserRole.CONSUMER && booking.consumerId !== userId) {
      throw new ForbiddenException('You are not authorized to cancel this booking as a consumer.');
    }
    if (userRole === UserRole.SERVICE_PROVIDER && booking.service.providerId !== userId) {
      throw new ForbiddenException('You are not authorized to cancel this booking as a service provider.');
    }
    if (userRole !== UserRole.CONSUMER && userRole !== UserRole.SERVICE_PROVIDER) {
      throw new ForbiddenException('You do not have permission to cancel bookings with this role.');
    }

    // Check if booking can be cancelled (e.g., not already completed/cancelled/rejected)
    if (
      booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.REJECTED
    ) {
      throw new BadRequestException(`Booking cannot be cancelled as its current status is ${booking.status}.`);
    }

    booking.status = BookingStatus.CANCELLED;
    return this.bookingRepository.save(booking);
  }

  /**
   * Rejects a PENDING booking.
   * Only the service provider associated with the service can reject.
   * @param bookingId The ID of the booking to reject.
   * @param providerId The ID of the authenticated service provider.
   * @returns The rejected booking.
   * @throws NotFoundException if booking not found, ForbiddenException if not authorized, BadRequestException if status not PENDING.
   */
  async rejectBooking(bookingId: string, providerId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['service'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${bookingId}" not found.`);
    }
    if (booking.service.providerId !== providerId) {
      throw new ForbiddenException('You are not authorized to reject this booking.');
    }
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(`Only PENDING bookings can be REJECTED. Current status: ${booking.status}`);
    }

    booking.status = BookingStatus.REJECTED;
    return this.bookingRepository.save(booking);
  }

  /**
   * Marks a CONFIRMED booking as COMPLETED.
   * Only the service provider associated with the service can complete.
   * @param bookingId The ID of the booking to complete.
   * @param providerId The ID of the authenticated service provider.
   * @returns The completed booking.
   * @throws NotFoundException if booking not found, ForbiddenException if not authorized, BadRequestException if status not CONFIRMED.
   */
  async completeBooking(bookingId: string, providerId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['service'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${bookingId}" not found.`);
    }
    if (booking.service.providerId !== providerId) {
      throw new ForbiddenException('You are not authorized to complete this booking.');
    }
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(`Only CONFIRMED bookings can be COMPLETED. Current status: ${booking.status}`);
    }

    booking.status = BookingStatus.COMPLETED;
    return this.bookingRepository.save(booking);
  }

  // Note: Direct deletion of bookings is generally not recommended in a real system
  // as it would lose historical data. Instead, set status to CANCELLED or REJECTED.
  // If forced to delete, it would look similar to other ownership checks.
  // async deleteBooking(bookingId: string, userId: string, role: string): Promise<void> {
  //   const booking = await this.bookingRepository.findOne({
  //     where: { id: bookingId },
  //     relations: ['service', 'service.provider'],
  //   });
  //   if (!booking) {
  //     throw new NotFoundException(`Booking with ID "${bookingId}" not found.`);
  //   }\
  //   if (booking.consumerId !== userId && booking.service.providerId !== userId && role !== 'ADMIN') {
  //     throw new ForbiddenException('You do not have permission to delete this booking.');
  //   }
  //   await this.bookingRepository.remove(booking);
  // }
}
