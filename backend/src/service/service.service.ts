// src/service/service.service.ts
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { User } from '../user/user.entity'; // Import User for type hinting and potential user-related logic

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  /**
   * Creates a new service for a given provider.
   * @param createServiceDto The data for the new service.
   * @param providerId The ID of the service provider (from authenticated user).
   * @returns The newly created Service entity.
   */
  async createService(createServiceDto: CreateServiceDto, providerId: string): Promise<Service> {
    try {
      const newService = this.servicesRepository.create({
        ...createServiceDto,
        providerId: providerId, // Link the service to the authenticated provider
      });
      return await this.servicesRepository.save(newService);
    } catch (error) {
      console.error('Error creating service:', error);
      throw new InternalServerErrorException('Failed to create service.');
    }
  }

  /**
   * Finds a service by its ID.
   * @param id The ID of the service.
   * @returns The Service entity or null if not found.
   */
  async findOne(id: string): Promise<Service | null> {
    return this.servicesRepository.findOne({ where: { id } });
  }

  /**
   * Finds all services, optionally filtered by a provider ID.
   * @param providerId Optional. The ID of the provider to filter services by.
   * @returns An array of Service entities.
   */
  async findAllServices(providerId?: string): Promise<Service[]> {
    const where: any = {};
    if (providerId) {
      where.providerId = providerId;
    }
    return this.servicesRepository.find({ where });
  }

  /**
   * Updates an existing service.
   * @param id The ID of the service to update.
   * @param updateServiceDto The data to update.
   * @param providerId The ID of the service provider (to ensure they own the service).
   * @returns The updated Service entity.
   */
  async updateService(
    id: string,
    updateServiceDto: UpdateServiceDto,
    providerId: string, // Ensure only the owner can update
  ): Promise<Service> {
    const service = await this.servicesRepository.findOne({ where: { id, providerId } }); // Find by ID and providerId

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found or you don't have permission to update it.`);
    }

    Object.assign(service, updateServiceDto);

    try {
      return await this.servicesRepository.save(service);
    } catch (error) {
      console.error('Error updating service:', error);
      throw new InternalServerErrorException('Failed to update service.');
    }
  }

  /**
   * Deletes a service.
   * @param id The ID of the service to delete.
   * @param providerId The ID of the service provider (to ensure they own the service).
   */
  async deleteService(id: string, providerId: string): Promise<void> {
    const result = await this.servicesRepository.delete({ id, providerId }); // Delete by ID and providerId

    if (result.affected === 0) {
      throw new NotFoundException(`Service with ID ${id} not found or you don't have permission to delete it.`);
    }
  }
}
