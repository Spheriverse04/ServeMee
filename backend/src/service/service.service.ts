// src/service/service.service.ts
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import * as admin from 'firebase-admin';
import { Express } from 'express'; // FIX 1: Import Express for Express.Multer.File type

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  // FIX 1: Use Express.Multer.File
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
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileUpload.name)}?alt=media`;
        resolve(publicUrl);
      });

      blobStream.end(file.buffer);
    });
  }

  async createService(
    createServiceDto: CreateServiceDto,
    providerId: string,
    file?: Express.Multer.File, // FIX 1: Use Express.Multer.File
  ): Promise<Service> {
    const imageUrl = await this.uploadImage(file);

    const service = this.servicesRepository.create({
      ...createServiceDto,
      providerId: providerId,
      imageUrl: imageUrl,
    });

    try {
      return await this.servicesRepository.save(service);
    } catch (error) {
      console.error('Error creating service:', error);
      throw new InternalServerErrorException('Failed to create service.');
    }
  }

  async findOne(id: string): Promise<Service | null> {
    return this.servicesRepository.findOne({
      where: { id },
      relations: ['serviceProvider', 'serviceType'],
    });
  }

  async findAll(): Promise<Service[]> {
    return this.servicesRepository.find({
      relations: ['serviceProvider', 'serviceType'],
    });
  }

  async findServicesByProvider(providerId: string): Promise<Service[]> {
    return this.servicesRepository.find({
      where: { providerId },
      relations: ['serviceType'],
    });
  }

  async updateService(
    id: string,
    updateServiceDto: UpdateServiceDto,
    providerId: string,
    file?: Express.Multer.File, // FIX 1: Use Express.Multer.File
  ): Promise<Service> {
    const service = await this.servicesRepository.findOne({ where: { id, providerId } });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found or you don't have permission to update it.`);
    }

    let newImageUrl: string | null = service.imageUrl;

    if (file) {
      newImageUrl = await this.uploadImage(file);
    } else if (updateServiceDto.imageUrl !== undefined) { // FIX 2: Check if imageUrl is explicitly provided and not undefined
      newImageUrl = updateServiceDto.imageUrl; // This will now be string | null
    }
    // If no file and updateServiceDto.imageUrl is undefined (meaning property not sent),
    // then newImageUrl retains its initial value (service.imageUrl).

    // Separate imageUrl from other DTO properties to handle it explicitly.
    // This prevents Object.assign from potentially overwriting newImageUrl with undefined from DTO.
    const { imageUrl, ...restOfDto } = updateServiceDto;

    // Apply other updates from DTO using Object.assign
    Object.assign(service, restOfDto);

    // Assign the determined imageUrl to the service entity
    service.imageUrl = newImageUrl;

    try {
      return await this.servicesRepository.save(service);
    } catch (error) {
      console.error('Error updating service:', error);
      throw new InternalServerErrorException('Failed to update service.');
    }
  }

  async deleteService(id: string, providerId: string): Promise<void> {
    const result = await this.servicesRepository.delete({ id, providerId });

    if (result.affected === 0) {
      throw new NotFoundException(`Service with ID ${id} not found or you don't have permission to delete it.`);
    }
  }
}
