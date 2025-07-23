// src/service/service.service.ts
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import * as admin from 'firebase-admin';
import { Express } from 'express';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  private async uploadImage(file: Express.Multer.File | undefined): Promise<string | null> {
    if (!file) {
      return null;
    }

    const bucket = admin.storage().bucket();
    const fileName = `services/${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (error) => {
        console.error('Error uploading to Firebase Storage:', error);
        reject(new InternalServerErrorException('Failed to upload image to storage.'));
      });

      blobStream.on('finish', async () => {
        await fileUpload.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        resolve(publicUrl);
      });

      blobStream.end(file.buffer);
    });
  }

  async createService(
    createServiceDto: CreateServiceDto,
    providerId: string,
    file?: Express.Multer.File,
  ): Promise<Service> {
    const imageUrl = await this.uploadImage(file);
    const service = this.servicesRepository.create({
      ...createServiceDto,
      providerId,
      imageUrl,
      baseFare: parseFloat(createServiceDto.baseFare as any), // Ensure baseFare is a number
    });

    try {
      return await this.servicesRepository.save(service);
    } catch (error) {
      console.error('Error creating service:', error);
      throw new InternalServerErrorException('Failed to create service.');
    }
  }

  // New method to fetch services for a provider with relations
async findServicesByProviderId(providerId: string): Promise<Service[]> {
  return this.servicesRepository.find({
    where: { providerId },
    relations: [
      'serviceType',
      'serviceType.category',
      'serviceProvider',
      'serviceProvider.localities', // Add this line
    ],
    order: { createdAt: 'DESC' },
  });
}


async findServicesByLocality(localityId: string): Promise<Service[]> {
  return this.servicesRepository
    .createQueryBuilder('service')
    .leftJoinAndSelect('service.serviceType', 'serviceType')
    .leftJoinAndSelect('serviceType.category', 'category')
    .innerJoin('service_provider_localities', 'spl', 'spl.service_provider_id = service.service_provider_id')
    .leftJoinAndSelect('service.serviceProvider', 'serviceProvider')
    .leftJoinAndSelect('serviceProvider.user', 'user') // ✅ This is what was missing
    .where('spl.locality_id = :localityId', { localityId })
    .andWhere('service.is_active = :isActive', { isActive: true })
    .orderBy('service.created_at', 'DESC')
    .getMany();
}


async findAll(): Promise<Service[]> {
  return this.servicesRepository.find({
    where: { isActive: true }, 
    relations: {
      serviceProvider: {
        user: true,
      },
      serviceType: {
        category: true,
      },
    },
    order: {
      createdAt: 'DESC',
    },
  });
}


  // FIX: Changed return type from Promise<Service | undefined> to Promise<Service | null>
  async findOne(id: string): Promise<Service | null> {
    // Also include relations when fetching a single service
    return this.servicesRepository.findOne({
      where: { id },
      relations: ['serviceType', 'serviceType.category'],
    });
  }

  async updateService(
    id: string,
    updateServiceDto: UpdateServiceDto,
    providerId: string,
    file?: Express.Multer.File,
  ): Promise<Service> {
    // FIX: Use 'Service | null' for the service constant
    const service: Service | null = await this.servicesRepository.findOne({ where: { id } });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found.`);
    }

    // Ensure the service belongs to the authenticated provider
    if (service.providerId !== providerId) {
      throw new NotFoundException(`Service with ID ${id} not found or you don't have permission to update it.`);
    }

    let newImageUrl: string | null = service.imageUrl;

    if (file) {
      newImageUrl = await this.uploadImage(file);
    } else if (updateServiceDto.imageUrl !== undefined) {
      newImageUrl = updateServiceDto.imageUrl;
    }

    // FIX: Remove 'baseFare' from destructuring if it's now part of 'restOfDto' after DTO fix
    // If UpdateServiceDto now properly includes baseFare, this line might need adjustment
    // depending on how you want to handle imageUrl vs. other DTO properties.
    // For now, assuming imageUrl is handled separately as before.
    const { imageUrl: dtoImageUrl, ...restOfDto } = updateServiceDto; // Renamed to avoid conflict

    // Apply other updates from DTO using Object.assign
    // This will now include baseFare if it's in restOfDto
    Object.assign(service, restOfDto);

    service.imageUrl = newImageUrl;

    // FIX: This check is still needed, but 'baseFare' must exist on UpdateServiceDto
    // The 'as any' cast is a workaround if baseFare is still a string in DTO,
    // but ideally, it should be `number | string` or just `number` in DTO.
    if (updateServiceDto.baseFare !== undefined) {
      service.baseFare = parseFloat(updateServiceDto.baseFare as any); // Ensure baseFare is updated as a number
    }


    try {
      return await this.servicesRepository.save(service);
    } catch (error) {
      console.error('Error updating service:', error);
      throw new InternalServerErrorException('Failed to update service.');
    }
  }

async updateStatus(id: string, isActive: boolean, providerId: string): Promise<Service> {
  const service = await this.servicesRepository.findOne({ where: { id } });

  if (!service || service.providerId !== providerId) {
    throw new NotFoundException(`Service with ID ${id} not found or you don't have permission to update it.`);
  }

  service.isActive = isActive;
  return this.servicesRepository.save(service);
}


  async deleteService(id: string, providerId: string): Promise<void> {
    const result = await this.servicesRepository.delete({ id, providerId });

    if (result.affected === 0) {
      throw new NotFoundException(`Service with ID ${id} not found or you don't have permission to delete it.`);
    }
  }
}
