// backend/src/district/district.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { District } from './district.entity';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';

@Injectable()
export class DistrictService {
  constructor(
    @InjectRepository(District)
    private districtRepository: Repository<District>,
  ) {}

  async create(createDistrictDto: CreateDistrictDto): Promise<District> {
    try {
      const district = this.districtRepository.create(createDistrictDto);
      return await this.districtRepository.save(district);
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation (e.g., name + stateId already exists)
        throw new BadRequestException('A district with this name already exists in this state.');
      }
      throw error;
    }
  }

  async findAll(): Promise<District[]> {
    return this.districtRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findByState(stateId: string): Promise<District[]> {
    return this.districtRepository.find({
      where: { stateId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<District> {
    const district = await this.districtRepository.findOne({
      where: { id },
    });

    if (!district) {
      throw new NotFoundException(`District with ID "${id}" not found.`);
    }

    return district;
  }

  async update(id: string, updateDistrictDto: UpdateDistrictDto): Promise<District> {
    const district = await this.findOne(id);
    Object.assign(district, updateDistrictDto);
    try {
      return await this.districtRepository.save(district);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('A district with this name already exists in this state.');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.districtRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`District with ID "${id}" not found.`);
    }
  }
}
