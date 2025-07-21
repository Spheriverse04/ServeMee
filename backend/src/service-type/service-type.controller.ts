// backend/src/service-type/service-type.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ServiceTypeService } from './service-type.service';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { UserRole } from '../auth/roles/roles.enum';
import { Public } from '../auth/public.decorator';

@Controller('service-types')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class ServiceTypeController {
  constructor(private readonly serviceTypeService: ServiceTypeService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createServiceTypeDto: CreateServiceTypeDto) {
    return this.serviceTypeService.create(createServiceTypeDto);
  }

  @Get()
  @Public()
  findAll() {
    return this.serviceTypeService.findAll();
  }

  @Get('by-category/:categoryId')
  @Public()
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.serviceTypeService.findByCategory(categoryId);
  }

  @Get('search')
  @Public()
  searchByName(@Query('name') name: string) {
    return this.serviceTypeService.findByName(name);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.serviceTypeService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateServiceTypeDto: UpdateServiceTypeDto) {
    return this.serviceTypeService.update(id, updateServiceTypeDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.serviceTypeService.remove(id);
  }
}

