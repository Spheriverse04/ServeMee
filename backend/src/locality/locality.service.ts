// backend/src/locality/locality.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Locality } from './locality.entity';
import { CreateLocalityDto } from './dto/create-locality.dto';
import { UpdateLocalityDto } from './dto/update-locality.dto';

@Injectable()
export class LocalityService {
  constructor(
    @InjectRepository(Locality)
    private localityRepository: Repository<Locality>,
  ) {}

  async create(createLocalityDto: CreateLocalityDto): Promise<Locality> {
    try {
      const locality = this.localityRepository.create(createLocalityDto);
      return await this.localityRepository.save(locality);
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new BadRequestException('A locality with this name already exists.');
      }
      throw error;
    }
  }

  async findAll(): Promise<Locality[]> {
    return this.localityRepository.find({
      where: { isActive: true },
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

  async findByPoint(latitude: number, longitude: number): Promise<Locality[]> {
    return this.localityRepository
      .createQueryBuilder('locality')
      .where('ST_Contains(locality.polygonGeometry, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326))', {
        longitude,
        latitude,
      })
      .andWhere('locality.isActive = :isActive', { isActive: true })
      .getMany();
  }
}