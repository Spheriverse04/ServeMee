// src/service/service.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  Patch,
  Delete,
  HttpStatus,
  HttpCode,
  NotFoundException, // <--- IMPORT NotFoundException HERE
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { UserRole } from '../auth/roles/roles.enum';
import { Request } from 'express';
import { User } from '../user/user.entity';

@Controller('services')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @Roles(UserRole.SERVICE_PROVIDER)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createServiceDto: CreateServiceDto,
    @Req() req: Request & { user: User },
  ) {
    const providerId = req.user.id;
    const service = await this.serviceService.createService(createServiceDto, providerId);
    return {
      message: 'Service created successfully!',
      service,
    };
  }

  @Get()
  async findAll(@Req() req: Request & { user: User }) {
    const services = await this.serviceService.findAllServices();
    return {
      message: 'Services fetched successfully!',
      services,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const service = await this.serviceService.findOne(id);
    if (!service) {
      throw new NotFoundException('Service not found'); // <--- CORRECTED LINE
    }
    return {
      message: 'Service fetched successfully!',
      service,
    };
  }

  @Patch(':id')
  @Roles(UserRole.SERVICE_PROVIDER)
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @Req() req: Request & { user: User },
  ) {
    const providerId = req.user.id;
    const updatedService = await this.serviceService.updateService(id, updateServiceDto, providerId);
    return {
      message: 'Service updated successfully!',
      service: updatedService,
    };
  }

  @Delete(':id')
  @Roles(UserRole.SERVICE_PROVIDER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Req() req: Request & { user: User },
  ) {
    const providerId = req.user.id;
    await this.serviceService.deleteService(id, providerId);
  }

  @Get('my-services/list')
  @Roles(UserRole.SERVICE_PROVIDER)
  async getMyServices(@Req() req: Request & { user: User }) {
    const providerId = req.user.id;
    const services = await this.serviceService.findAllServices(providerId);
    return {
      message: 'Your services fetched successfully!',
      services,
    };
  }
}
