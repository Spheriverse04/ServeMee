// backend/src/service/dto/update-service.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceDto } from './create-service.dto';
import { IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';
import { Type } from 'class-transformer'; // Needed if you use @Type in CreateServiceDto

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  // If you need to make imageUrl explicitly optional and nullable,
  // or add specific validation for updates that isn't covered by PartialType
  @IsOptional()
  @IsUrl() // Use @IsUrl() for URL validation
  imageUrl?: string | null; // Allow null if you want to explicitly remove an image

  // If serviceTypeId can be updated
  @IsOptional()
  @IsUUID()
  serviceTypeId?: string;

  // baseFare will be automatically made optional by PartialType from CreateServiceDto.
  // No need to explicitly add it here unless you want to override its validation or type.
  // The `parseFloat(updateServiceDto.baseFare as any)` in service.service.ts
  // indicates that it might come as a string from the frontend and is parsed.
  // If so, you might want to consider making it `baseFare?: string;` here
  // or using a validation pipe for transformation.
  // For now, it inherits `number` from CreateServiceDto, which is generally preferred
  // if you expect a number from the client or use a pipe to transform it.
}
