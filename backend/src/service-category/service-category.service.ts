// backend/src/service-category/service-category.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceCategory } from './service-category.entity';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';

@Injectable()
export class ServiceCategoryService {
  constructor(
    @InjectRepository(ServiceCategory)
    private serviceCategoryRepository: Repository<ServiceCategory>,
  ) {}

  async create(createServiceCategoryDto: CreateServiceCategoryDto): Promise<ServiceCategory> {
    try {
      const category = this.serviceCategoryRepository.create(createServiceCategoryDto);
      return await this.serviceCategoryRepository.save(category);
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new BadRequestException('A service category with this name already exists.');
      }
      throw error;
    }
  }

  async findAll(): Promise<ServiceCategory[]> {
    return this.serviceCategoryRepository.find({
      where: { isActive: true },
      relations: ['serviceTypes'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ServiceCategory> {
    const category = await this.serviceCategoryRepository.findOne({
      where: { id, isActive: true },
      relations: ['serviceTypes'],
    });

    if (!category) {
      throw new NotFoundException(`Service category with ID "${id}" not found.`);
    }

    return category;
  }

  async update(id: string, updateServiceCategoryDto: UpdateServiceCategoryDto): Promise<ServiceCategory> {
    const category = await this.findOne(id);
    Object.assign(category, updateServiceCategoryDto);
    return this.serviceCategoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    category.isActive = false;
    await this.serviceCategoryRepository.save(category);
  }

  async findByName(name: string): Promise<ServiceCategory[]> {
    return this.serviceCategoryRepository
      .createQueryBuilder('category')
      .where('category.name ILIKE :name', { name: `%${name}%` })
      .andWhere('category.isActive = :isActive', { isActive: true })
      .orderBy('category.sortOrder', 'ASC')
      .addOrderBy('category.name', 'ASC')
      .getMany();
  }
}