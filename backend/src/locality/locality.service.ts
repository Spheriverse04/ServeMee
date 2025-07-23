// backend/src/locality/locality.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Locality } from './locality.entity';
import { CreateLocalityDto } from './dto/create-locality.dto';
import { UpdateLocalityDto } from './dto/update-locality.dto';
import { District } from '../district/district.entity';

@Injectable()
export class LocalityService {
  constructor(
    @InjectRepository(Locality)
    private localityRepository: Repository<Locality>,
  ) {}

async create(createLocalityDto: CreateLocalityDto, districtId: string): Promise<Locality> {
  try {
    const district = await this.localityRepository.manager.findOne(District, { where: { id: districtId } });
    if (!district) {
      throw new NotFoundException(`District with ID "${districtId}" not found.`);
    }

    const locality = this.localityRepository.create({
      ...createLocalityDto,
      district,
    });

    return await this.localityRepository.save(locality);
  } catch (error) {
    if (error.code === '23505') {
      throw new BadRequestException('A locality with this name already exists.');
    }
    throw error;
  }
}

async findAll(districtId?: string): Promise<Locality[]> {
  const where: any = { isActive: true };

  if (districtId) {
    where.district = { id: districtId };
  }

  return this.localityRepository.find({
    where,
    relations: ['district'], // Ensure relation is joined
    order: { name: 'ASC' },
  });
}


  async findOne(id: string): Promise<Locality> {
    const locality = await this.localityRepository.findOne({
      where: { id, isActive: true },
    });

    if (!locality) {
      throw new NotFoundException(`Locality with ID "${id}" not found.`);
    }

    return locality;
  }

  async update(id: string, updateLocalityDto: UpdateLocalityDto): Promise<Locality> {
    const locality = await this.findOne(id);
    Object.assign(locality, updateLocalityDto);
    return this.localityRepository.save(locality);
  }

  async remove(id: string): Promise<void> {
    const locality = await this.findOne(id);
    locality.isActive = false;
    await this.localityRepository.save(locality);
  }

  async findByName(name: string): Promise<Locality[]> {
    return this.localityRepository
      .createQueryBuilder('locality')
      .where('locality.name ILIKE :name', { name: `%${name}%` })
      .andWhere('locality.isActive = :isActive', { isActive: true })
      .orderBy('locality.name', 'ASC')
      .getMany();
  }
}
