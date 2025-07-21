// backend/src/service-category/dto/update-service-category.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceCategoryDto } from './create-service-category.dto';

export class UpdateServiceCategoryDto extends PartialType(CreateServiceCategoryDto) {}