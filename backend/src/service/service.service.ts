// src/service/service.service.ts
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { User } from '../user/user.entity';
import * as admin from 'firebase-admin';
// import { File } from 'multer'; // REMOVE THIS LINE
// No direct import needed for Multer.File if @types/multer augments Express global namespace

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  private async uploadImage(file: Express.Multer.File | undefined): Promise<string | null> { // Use Express.Multer.File
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
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
        resolve(publicUrl);
      });

      blobStream.end(file.buffer);
    });
  }

  async createService(
    createServiceDto: CreateServiceDto,
    providerId: string,
    file?: Express.Multer.File, // Use Express.Multer.File
  ): Promise<Service> {
    try {
      let imageUrl: string | null = null;
      if (file) {
        imageUrl = await this.uploadImage(file);
      }

      const newService = this.servicesRepository.create({
        ...createServiceDto,
        providerId: providerId,
        imageUrl: imageUrl,
      });
      return await this.servicesRepository.save(newService);
    } catch (error) {
      console.error('Error creating service:', error);
      throw new InternalServerErrorException('Failed to create service.');
    }
  }

  async findOne(id: string): Promise<Service | null> {
    return this.servicesRepository.findOne({ where: { id } });
  }

  async findAllServices(): Promise<Service[]> {
    return this.servicesRepository.find();
  }

  async findServicesByProvider(providerId: string): Promise<Service[]> {
    return this.servicesRepository.find({ where: { providerId } });
  }

  async updateService(
    id: string,
    updateServiceDto: UpdateServiceDto,
    providerId: string,
    file?: Express.Multer.File, // Use Express.Multer.File
  ): Promise<Service> {
    const service = await this.servicesRepository.findOne({ where: { id, providerId } });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found or you don't have permission to update it.`);
    }

    let newImageUrl: string | null | undefined = service.imageUrl;

    if (file) {
      newImageUrl = await this.uploadImage(file);
    } else if (updateServiceDto.hasOwnProperty('imageUrl') && updateServiceDto.imageUrl === null) {
      newImageUrl = null;
    }

    Object.assign(service, updateServiceDto);
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
