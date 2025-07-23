// src/service-provider/service-provider.controller.ts
import {
  Controller,
  UseGuards,
  Put,
  Body,
  Request,
  Get,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { UserRole } from '../auth/roles/roles.enum';
import { ServiceProviderService } from './service-provider.service';
import { Request as ExpressRequest } from 'express';

@Controller('service-providers')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class ServiceProviderController {
  constructor(private readonly serviceProviderService: ServiceProviderService) {}

@Put('localities')
@Roles(UserRole.SERVICE_PROVIDER)
async updateLocalities(
  @Request() req: ExpressRequest & { user: { id: string } },
  @Body() body: { localityIds: string[] }
) {
  return this.serviceProviderService.assignLocalities(req.user.id, body.localityIds);
}

@Get('localities')
@Roles(UserRole.SERVICE_PROVIDER)
async getLocalities(
  @Request() req: ExpressRequest & { user: { id: string } }
) {
  return this.serviceProviderService.getAssignedLocalities(req.user.id);
}
}

