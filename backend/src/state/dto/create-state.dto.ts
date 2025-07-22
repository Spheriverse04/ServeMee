// backend/src/state/dto/create-state.dto.ts
import { IsString, IsNotEmpty, MaxLength, IsUUID } from 'class-validator';

export class CreateStateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsUUID()
  @IsNotEmpty()
  countryId: string; // Foreign key to the Country entity
}
