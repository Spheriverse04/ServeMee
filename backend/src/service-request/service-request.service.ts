// backend/src/service-request/service-request.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequest, ServiceRequestStatus } from './service-request.entity';
import { User } from '../user/user.entity';
import { ServiceType } from '../service-type/service-type.entity';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import { AcceptServiceRequestDto } from './dto/accept-service-request.dto';
import { UserRole } from '../auth/roles/roles.enum';

@Injectable()
export class ServiceRequestService {
  constructor(
    @InjectRepository(ServiceRequest)
    private serviceRequestRepository: Repository<ServiceRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ServiceType)
    private serviceTypeRepository: Repository<ServiceType>,
  ) {}

  async create(createServiceRequestDto: CreateServiceRequestDto, consumerId: string): Promise<ServiceRequest> {
    // Verify service type exists
    const serviceType = await this.serviceTypeRepository.findOne({
      where: { id: createServiceRequestDto.serviceTypeId, isActive: true },
    });

    if (!serviceType) {
      throw new NotFoundException(`Service type with ID "${createServiceRequestDto.serviceTypeId}" not found.`);
    }

    // Generate OTP
    const otpCode = this.generateOTP();

    const serviceRequest = this.serviceRequestRepository.create({
      ...createServiceRequestDto,
      consumerId,
      otpCode,
      status: ServiceRequestStatus.PENDING,
    });

    return this.serviceRequestRepository.save(serviceRequest);
  }

  async findAll(): Promise<ServiceRequest[]> {
    return this.serviceRequestRepository.find({
      relations: ['consumer', 'serviceProvider', 'serviceType'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByConsumer(consumerId: string): Promise<ServiceRequest[]> {
    return this.serviceRequestRepository.find({
      where: { consumerId },
      relations: ['serviceProvider', 'serviceType'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByServiceProvider(serviceProviderId: string): Promise<ServiceRequest[]> {
    return this.serviceRequestRepository.find({
      where: { serviceProviderId },
      relations: ['consumer', 'serviceType'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPendingRequests(): Promise<ServiceRequest[]> {
    return this.serviceRequestRepository.find({
      where: { status: ServiceRequestStatus.PENDING },
      relations: ['consumer', 'serviceType'],
      order: { createdAt: 'DESC' },
    });
  }

  async findNearbyRequests(latitude: number, longitude: number, radiusKm: number = 10): Promise<ServiceRequest[]> {
    return this.serviceRequestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.consumer', 'consumer')
      .leftJoinAndSelect('request.serviceType', 'serviceType')
      .where('request.status = :status', { status: ServiceRequestStatus.PENDING })
      .andWhere(
        'ST_DWithin(request.requestedAtLocation, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326), :radius)',
        {
          longitude,
          latitude,
          radius: radiusKm * 1000, // Convert km to meters
        }
      )
      .orderBy('request.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<ServiceRequest> {
    const serviceRequest = await this.serviceRequestRepository.findOne({
      where: { id },
      relations: ['consumer', 'serviceProvider', 'serviceType'],
    });

    if (!serviceRequest) {
      throw new NotFoundException(`Service request with ID "${id}" not found.`);
    }

    return serviceRequest;
  }

  async update(id: string, updateServiceRequestDto: UpdateServiceRequestDto, userId: string, userRole: UserRole): Promise<ServiceRequest> {
    const serviceRequest = await this.findOne(id);

    // Check permissions
    const canUpdate = 
      (userRole === UserRole.CONSUMER && serviceRequest.consumerId === userId) ||
      (userRole === UserRole.SERVICE_PROVIDER && serviceRequest.serviceProviderId === userId) ||
      userRole === UserRole.ADMIN;

    if (!canUpdate) {
      throw new ForbiddenException('You do not have permission to update this service request.');
    }

    Object.assign(serviceRequest, updateServiceRequestDto);
    return this.serviceRequestRepository.save(serviceRequest);
  }

  async acceptRequest(id: string, acceptDto: AcceptServiceRequestDto, serviceProviderId: string): Promise<ServiceRequest> {
    const serviceRequest = await this.findOne(id);

    if (serviceRequest.status !== ServiceRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be accepted.');
    }

    // Verify OTP
    if (serviceRequest.otpCode !== acceptDto.otpCode) {
      throw new BadRequestException('Invalid OTP code.');
    }

    serviceRequest.serviceProviderId = serviceProviderId;
    serviceRequest.status = ServiceRequestStatus.ACCEPTED;
    serviceRequest.acceptedAt = new Date();

    return this.serviceRequestRepository.save(serviceRequest);
  }

  async startService(id: string, serviceProviderId: string): Promise<ServiceRequest> {
    const serviceRequest = await this.findOne(id);

    if (serviceRequest.serviceProviderId !== serviceProviderId) {
      throw new ForbiddenException('You can only start services you have accepted.');
    }

    if (serviceRequest.status !== ServiceRequestStatus.ACCEPTED) {
      throw new BadRequestException('Only accepted requests can be started.');
    }

    serviceRequest.status = ServiceRequestStatus.IN_PROGRESS;
    return this.serviceRequestRepository.save(serviceRequest);
  }

  async completeService(id: string, serviceProviderId: string, totalCost?: number): Promise<ServiceRequest> {
    const serviceRequest = await this.findOne(id);

    if (serviceRequest.serviceProviderId !== serviceProviderId) {
      throw new ForbiddenException('You can only complete services you are providing.');
    }

    if (serviceRequest.status !== ServiceRequestStatus.IN_PROGRESS) {
      throw new BadRequestException('Only in-progress requests can be completed.');
    }

    serviceRequest.status = ServiceRequestStatus.COMPLETED;
    serviceRequest.completedAt = new Date();
    if (totalCost !== undefined) {
      serviceRequest.totalCost = totalCost;
    }

    return this.serviceRequestRepository.save(serviceRequest);
  }

  async cancelRequest(id: string, userId: string, userRole: UserRole): Promise<ServiceRequest> {
    const serviceRequest = await this.findOne(id);

    // Check permissions
    const canCancel = 
      (userRole === UserRole.CONSUMER && serviceRequest.consumerId === userId) ||
      (userRole === UserRole.SERVICE_PROVIDER && serviceRequest.serviceProviderId === userId) ||
      userRole === UserRole.ADMIN;

    if (!canCancel) {
      throw new ForbiddenException('You do not have permission to cancel this service request.');
    }

    if ([ServiceRequestStatus.COMPLETED, ServiceRequestStatus.CANCELLED].includes(serviceRequest.status)) {
      throw new BadRequestException('Cannot cancel a completed or already cancelled request.');
    }

    serviceRequest.status = ServiceRequestStatus.CANCELLED;
    serviceRequest.cancelledAt = new Date();

    return this.serviceRequestRepository.save(serviceRequest);
  }

  async rejectRequest(id: string, serviceProviderId: string): Promise<ServiceRequest> {
    const serviceRequest = await this.findOne(id);

    if (serviceRequest.serviceProviderId !== serviceProviderId) {
      throw new ForbiddenException('You can only reject requests assigned to you.');
    }

    if (serviceRequest.status !== ServiceRequestStatus.ACCEPTED) {
      throw new BadRequestException('Only accepted requests can be rejected.');
    }

    serviceRequest.status = ServiceRequestStatus.REJECTED;
    serviceRequest.serviceProviderId = null; // Remove assignment

    return this.serviceRequestRepository.save(serviceRequest);
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}