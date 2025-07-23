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
  NotFoundException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { UserRole } from '../auth/roles/roles.enum';
import { User } from '../user/user.entity';
import { Public } from '../auth/public.decorator';
import { Express } from 'express';

@Controller('services')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @Roles(UserRole.SERVICE_PROVIDER)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createServiceDto: CreateServiceDto,
    @Req() req: Request & { user: User },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const providerId = req.user.id;
    const newService = await this.serviceService.createService(createServiceDto, providerId, file);
    return {
      message: 'Service created successfully!',
      service: newService,
    };
  }

  @Get('my-services/list')
  @Roles(UserRole.SERVICE_PROVIDER)
  async getMyServices(@Req() req: Request & { user: User }) {
    const providerId = req.user.id;
    const services = await this.serviceService.findServicesByProviderId(providerId);
    return {
      message: 'My services fetched successfully!',
      services: services, // Return services in an object for consistency with frontend
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const service = await this.serviceService.findOne(id);
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return {
      message: 'Service fetched successfully!',
      service,
    };
  }

@Patch(':id/status')
@Roles(UserRole.SERVICE_PROVIDER)
async updateStatus(
  @Param('id') id: string,
  @Body('isActive') isActive: boolean,
  @Req() req: Request & { user: User },
) {
  const providerId = req.user.id;
  const updatedService = await this.serviceService.updateStatus(id, isActive, providerId);
  return {
    message: `Service ${isActive ? 'activated' : 'deactivated'} successfully!`,
    service: updatedService,
  };
}

@Get()
@Public()
async findAllServices() {
  return this.serviceService.findAll();
}


@Get('by-locality/:localityId')
@Public()
//@Roles(UserRole.CONSUMER) // or remove if public
async getServicesByLocality(@Param('localityId') localityId: string) {
  const services = await this.serviceService.findServicesByLocality(localityId);
  return {
    message: 'Services available in this locality fetched successfully!',
    services,
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
}
