// backend/src/district/dto/update-district.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateDistrictDto } from './create-district.dto';

export class UpdateDistrictDto extends PartialType(CreateDistrictDto) {}
