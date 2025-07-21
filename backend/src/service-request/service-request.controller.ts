// backend/src/service-request/service-request.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ServiceRequestService } from './service-request.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import { AcceptServiceRequestDto } from './dto/accept-service-request.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { UserRole } from '../auth/roles/roles.enum';
import { Request } from 'express';
import { User } from '../user/user.entity';

@Controller('service-requests')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class ServiceRequestController {
  constructor(private readonly serviceRequestService: ServiceRequestService) {}

  @Post()
  @Roles(UserRole.CONSUMER)
  create(
    @Body() createServiceRequestDto: CreateServiceRequestDto,
    @Req() req: Request & { user: User },
  ) {
    return this.serviceRequestService.create(createServiceRequestDto, req.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.serviceRequestService.findAll();
  }

  @Get('my-requests')
  @Roles(UserRole.CONSUMER)
  findMyRequests(@Req() req: Request & { user: User }) {
    return this.serviceRequestService.findByConsumer(req.user.id);
  }

  @Get('my-services')
  @Roles(UserRole.SERVICE_PROVIDER)
  findMyServices(@Req() req: Request & { user: User }) {
    return this.serviceRequestService.findByServiceProvider(req.user.id);
  }

  @Get('pending')
  @Roles(UserRole.SERVICE_PROVIDER, UserRole.ADMIN)
  findPending() {
    return this.serviceRequestService.findPendingRequests();
  }

  @Get('nearby')
  @Roles(UserRole.SERVICE_PROVIDER)
  findNearby(
    @Query('lat') latitude: number,
    @Query('lng') longitude: number,
    @Query('radius') radius?: number,
  ) {
    return this.serviceRequestService.findNearbyRequests(latitude, longitude, radius);
  }

  @Get(':id')
  @Roles(UserRole.CONSUMER, UserRole.SERVICE_PROVIDER, UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.serviceRequestService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.CONSUMER, UserRole.SERVICE_PROVIDER, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateServiceRequestDto: UpdateServiceRequestDto,
    @Req() req: Request & { user: User },
  ) {
    return this.serviceRequestService.update(id, updateServiceRequestDto, req.user.id, req.user.role as UserRole);
  }

  @Post(':id/accept')
  @Roles(UserRole.SERVICE_PROVIDER)
  acceptRequest(
    @Param('id') id: string,
    @Body() acceptDto: AcceptServiceRequestDto,
    @Req() req: Request & { user: User },
  ) {
    return this.serviceRequestService.acceptRequest(id, acceptDto, req.user.id);
  }

  @Post(':id/start')
  @Roles(UserRole.SERVICE_PROVIDER)
  startService(
    @Param('id') id: string,
    @Req() req: Request & { user: User },
  ) {
    return this.serviceRequestService.startService(id, req.user.id);
  }

  @Post(':id/complete')
  @Roles(UserRole.SERVICE_PROVIDER)
  completeService(
    @Param('id') id: string,
    @Body('totalCost') totalCost: number,
    @Req() req: Request & { user: User },
  ) {
    return this.serviceRequestService.completeService(id, req.user.id, totalCost);
  }

  @Post(':id/cancel')
  @Roles(UserRole.CONSUMER, UserRole.SERVICE_PROVIDER, UserRole.ADMIN)
  cancelRequest(
    @Param('id') id: string,
    @Req() req: Request & { user: User },
  ) {
    return this.serviceRequestService.cancelRequest(id, req.user.id, req.user.role as UserRole);
  }

  @Post(':id/reject')
  @Roles(UserRole.SERVICE_PROVIDER)
  rejectRequest(
    @Param('id') id: string,
    @Req() req: Request & { user: User },
  ) {
    return this.serviceRequestService.rejectRequest(id, req.user.id);
  }
}