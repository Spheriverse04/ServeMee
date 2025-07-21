// backend/src/service-type/service-type.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceType } from './service-type.entity';
import { ServiceCategory } from '../service-category/service-category.entity';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';

@Injectable()
export class ServiceTypeService {
  constructor(
    @InjectRepository(ServiceType)
    private serviceTypeRepository: Repository<ServiceType>,
    @InjectRepository(ServiceCategory)
    private serviceCategoryRepository: Repository<ServiceCategory>,
  ) {}

  async create(createServiceTypeDto: CreateServiceTypeDto): Promise<ServiceType> {
    // Verify that the category exists
    const category = await this.serviceCategoryRepository.findOne({
      where: { id: createServiceTypeDto.categoryId, isActive: true },
    });

    if (!category) {
      throw new NotFoundException(`Service category with ID "${createServiceTypeDto.categoryId}" not found.`);
    }

    try {
      const serviceType = this.serviceTypeRepository.create(createServiceTypeDto);
      return await this.serviceTypeRepository.save(serviceType);
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new BadRequestException('A service type with this name already exists in this category.');
      }
      throw error;
    }
  }

  async findAll(): Promise<ServiceType[]> {
    return this.serviceTypeRepository.find({
      where: { isActive: true },
      relations: ['category'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findByCategory(categoryId: string): Promise<ServiceType[]> {
    return this.serviceTypeRepository.find({
      where: { categoryId, isActive: true },
      relations: ['category'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ServiceType> {
    const serviceType = await this.serviceTypeRepository.findOne({
      where: { id, isActive: true },
      relations: ['category'],
    });

    if (!serviceType) {
      throw new NotFoundException(`Service type with ID "${id}" not found.`);
    }

    return serviceType;
  }

  async update(id: string, updateServiceTypeDto: UpdateServiceTypeDto): Promise<ServiceType> {
    const serviceType = await this.findOne(id);
    
    // If categoryId is being updated, verify the new category exists
    if (updateServiceTypeDto.categoryId && updateServiceTypeDto.categoryId !== serviceType.categoryId) {
      const category = await this.serviceCategoryRepository.findOne({
        where: { id: updateServiceTypeDto.categoryId, isActive: true },
      });

      if (!category) {
        throw new NotFoundException(`Service category with ID "${updateServiceTypeDto.categoryId}" not found.`);
      }
    }

    Object.assign(serviceType, updateServiceTypeDto);
    return this.serviceTypeRepository.save(serviceType);
  }

  async remove(id: string): Promise<void> {
    const serviceType = await this.findOne(id);
    serviceType.isActive = false;
    await this.serviceTypeRepository.save(serviceType);
  }

  async findByName(name: string): Promise<ServiceType[]> {
    return this.serviceTypeRepository
      .createQueryBuilder('serviceType')
      .leftJoinAndSelect('serviceType.category', 'category')
      .where('serviceType.name ILIKE :name', { name: `%${name}%` })
      .andWhere('serviceType.isActive = :isActive', { isActive: true })
      .orderBy('serviceType.sortOrder', 'ASC')
      .addOrderBy('serviceType.name', 'ASC')
      .getMany();
  }
}
