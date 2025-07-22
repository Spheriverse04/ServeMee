// backend/src/district/dto/create-district.dto.ts
import { IsString, IsNotEmpty, MaxLength, IsUUID } from 'class-validator';

export class CreateDistrictDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsUUID()
  @IsNotEmpty()
  stateId: string; // Foreign key to the State entity
}
