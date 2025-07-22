// backend/src/state/state.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from './state.entity';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';

@Injectable()
export class StateService {
  constructor(
    @InjectRepository(State)
    private stateRepository: Repository<State>,
  ) {}

  async create(createStateDto: CreateStateDto): Promise<State> {
    try {
      const state = this.stateRepository.create(createStateDto);
      return await this.stateRepository.save(state);
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new BadRequestException('A state with this name already exists in this country.');
      }
      throw error;
    }
  }

  async findAll(): Promise<State[]> {
    return this.stateRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findByCountry(countryId: string): Promise<State[]> {
    return this.stateRepository.find({
      where: { countryId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<State> {
    const state = await this.stateRepository.findOne({
      where: { id },
    });

    if (!state) {
      throw new NotFoundException(`State with ID "${id}" not found.`);
    }

    return state;
  }

  async update(id: string, updateStateDto: UpdateStateDto): Promise<State> {
    const state = await this.findOne(id);
    Object.assign(state, updateStateDto);
    try {
      return await this.stateRepository.save(state);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('A state with this name already exists in this country.');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.stateRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`State with ID "${id}" not found.`);
    }
  }
}
