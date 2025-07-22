// backend/src/country/country.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './country.entity';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private countryRepository: Repository<Country>,
  ) {}

  async create(createCountryDto: CreateCountryDto): Promise<Country> {
    try {
      const country = this.countryRepository.create(createCountryDto);
      return await this.countryRepository.save(country);
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation for iso2, iso3, numericCode
        throw new BadRequestException('A country with this unique identifier (ISO2, ISO3, or Numeric Code) already exists.');
      }
      throw error;
    }
  }

  async findAll(): Promise<Country[]> {
    return this.countryRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Country> {
    const country = await this.countryRepository.findOne({
      where: { id },
    });

    if (!country) {
      throw new NotFoundException(`Country with ID "${id}" not found.`);
    }

    return country;
  }

  async update(id: string, updateCountryDto: UpdateCountryDto): Promise<Country> {
    const country = await this.findOne(id);
    Object.assign(country, updateCountryDto);
    try {
      return await this.countryRepository.save(country);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('A country with this unique identifier (ISO2, ISO3, or Numeric Code) already exists.');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.countryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Country with ID "${id}" not found.`);
    }
  }
}
