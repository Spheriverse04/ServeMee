// src/service-provider/service-provider.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceProvider } from './service-provider.entity';
import { Repository } from 'typeorm';
import { Locality } from '../locality/locality.entity';

@Injectable()
export class ServiceProviderService {
  constructor(
    @InjectRepository(ServiceProvider)
    private readonly serviceProviderRepo: Repository<ServiceProvider>,

    @InjectRepository(Locality)
    private readonly localityRepo: Repository<Locality>,
  ) {}

  async assignLocalities(userId: string, localityIds: string[]): Promise<ServiceProvider> {
    const provider = await this.serviceProviderRepo.findOne({
      where: { userId },
      relations: ['localities'],
    });

    if (!provider) throw new Error('Service provider not found.');

    const localities = await this.localityRepo.findByIds(localityIds);

    provider.localities = localities;
    return this.serviceProviderRepo.save(provider);
  }

  async getAssignedLocalities(userId: string): Promise<Locality[]> {
    const provider = await this.serviceProviderRepo.findOne({
      where: { userId },
      relations: ['localities'],
    });

    return provider?.localities || [];
  }
}

