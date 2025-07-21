// src/booking/booking.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Service } from '../service/service.entity';
import { User } from '../user/user.entity';
import { UserRole } from '../auth/roles/roles.enum';

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

    // 2. Optional: Check for time slot availability (more complex, depends on business logic)
    // For simplicity, we'll skip complex availability checks here for now.

    // 3. Create the booking
    const newBooking = this.bookingRepository.create({
      consumerId, // Link to the authenticated consumer
      serviceId,  // Link to the service
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      agreedPrice: agreedPrice.toString(), // Store price as string to avoid float issues
      status: BookingStatus.PENDING, // Default status
    });

    try {
      return await this.bookingRepository.save(newBooking);
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new InternalServerErrorException('Failed to create booking.');
    }
  }

  /**
   * Finds bookings for a specific user based on their role.
   * Consumers see their own bookings. Service Providers see bookings for their services.
   * @param userId The ID of the authenticated user.
   * @param userRole The role of the authenticated user.
   * @returns A list of bookings.
   */
  async findBookingsForUser(userId: string, userRole: UserRole): Promise<Booking[]> {
    if (userRole === UserRole.CONSUMER) {
      return this.bookingRepository.find({
        where: { consumerId: userId },
        relations: ['service', 'service.provider', 'consumer'], // Fetch service and its provider, and the consumer
        order: { createdAt: 'DESC' },
      });
    } else if (userRole === UserRole.SERVICE_PROVIDER) {
      return this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.service', 'service')
        .leftJoinAndSelect('booking.consumer', 'consumer')
        .where('service.providerId = :providerId', { providerId: userId })
        .orderBy('booking.createdAt', 'DESC')
        .getMany();
    }
    return [];
  }

  /**
   * Finds a single booking by its ID, ensuring the requesting user has access.
   * Consumers can view their own bookings. Service Providers can view bookings for their services.
   * @param bookingId The ID of the booking to find.
   * @param userId The ID of the authenticated user.
   * @param userRole The role of the authenticated user.
   * @returns The booking if found and accessible, otherwise null.
   */
  async findOneBookingByIdAndUser(bookingId: string, userId: string, userRole: UserRole): Promise<Booking | null> {
    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.consumer', 'consumer')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('service.provider', 'provider') // Join to get provider details for service
      .where('booking.id = :bookingId', { bookingId });

    if (userRole === UserRole.CONSUMER) {
      query.andWhere('booking.consumerId = :userId', { userId });
    } else if (userRole === UserRole.SERVICE_PROVIDER) {
      query.andWhere('service.providerId = :userId', { userId });
    } else {
      // For other roles, or if no specific role-based access, return null
      return null;
    }

    return await query.getOne();
  }

  /**
   * Updates a booking. Only the consumer who made the booking can update it.
   * @param bookingId The ID of the booking to update.
   * @param updateBookingDto The data to update.
   * @param consumerId The ID of the authenticated consumer (to ensure ownership).
   * @returns The updated booking.
   */
  async updateBooking(bookingId: string, updateBookingDto: UpdateBookingDto, consumerId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, consumerId: consumerId },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${bookingId}" not found or you do not have permission to update it.`);
    }

    // Only allow updating if the booking is PENDING or CONFIRMED (e.g., cannot update a completed/cancelled booking)
    if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(`Cannot update a booking with status "${booking.status}".`);
    }

    // Apply updates
    Object.assign(booking, updateBookingDto);
    if (updateBookingDto.agreedPrice !== undefined) {
      booking.agreedPrice = updateBookingDto.agreedPrice.toString();
    }

    try {
      return await this.bookingRepository.save(booking);
    } catch (error) {
      console.error('Error updating booking:', error);
      throw new InternalServerErrorException('Failed to update booking.');
    }
  }

  /**
   * Allows a consumer or service provider to cancel a booking.
   * @param bookingId The ID of the booking to cancel.
   * @param userId The ID of the user performing the cancellation.
   * @param userRole The role of the user.
   * @returns The cancelled booking.
   */
  async cancelBooking(bookingId: string, userId: string, userRole: UserRole): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['service'], // Load service to check providerId
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${bookingId}" not found.`);
    }

    // Check if the user is either the consumer or the service provider of the service
    const isConsumer = booking.consumerId === userId && userRole === UserRole.CONSUMER;
    const isProvider = booking.service?.providerId === userId && userRole === UserRole.SERVICE_PROVIDER;

    if (!isConsumer && !isProvider) {
      throw new ForbiddenException('You are not authorized to cancel this booking.');
    }

    // Only allow cancellation if the booking is PENDING or CONFIRMED
    if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(`Booking with status "${booking.status}" cannot be cancelled.`);
    }

    booking.status = BookingStatus.CANCELLED;
    return this.bookingRepository.save(booking);
  }

  /**
   * Allows a service provider to reject a PENDING booking.
   * @param bookingId The ID of the booking to reject.
   * @param providerId The ID of the service provider.
   * @returns The rejected booking.
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
   * Allows a service provider to mark a CONFIRMED booking as COMPLETED.
   * @param bookingId The ID of the booking to complete.
   * @param providerId The ID of the service provider.
   * @returns The completed booking.
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
}
