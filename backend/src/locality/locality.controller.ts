// backend/src/locality/locality.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { LocalityService } from './locality.service';
import { CreateLocalityDto } from './dto/create-locality.dto';
import { UpdateLocalityDto } from './dto/update-locality.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { UserRole } from '../auth/roles/roles.enum';
import { Public } from '../auth/public.decorator';

@Controller('localities')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class LocalityController {
  constructor(private readonly localityService: LocalityService) {}

@Post(':districtId')
@Roles(UserRole.ADMIN)
create(
  @Param('districtId') districtId: string,
  @Body() createLocalityDto: CreateLocalityDto
) {
  return this.localityService.create(createLocalityDto, districtId);
}


@Get()
@Public()
findAll(@Query('districtId') districtId?: string) {
  return this.localityService.findAll(districtId);
}

  @Get('search')
  @Public()
  searchByName(@Query('name') name: string) {
    return this.localityService.findByName(name);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.localityService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateLocalityDto: UpdateLocalityDto) {
    return this.localityService.update(id, updateLocalityDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.localityService.remove(id);
  }
}
