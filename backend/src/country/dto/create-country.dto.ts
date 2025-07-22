// backend/src/country/dto/create-country.dto.ts
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

// Define a DTO for timezone objects if you plan to validate their structure
class TimezoneDto {
  @IsString() @IsNotEmpty() zoneName: string;
  @IsNumber() @IsNotEmpty() gmtOffset: number;
  @IsString() @IsNotEmpty() gmtOffsetName: string;
  @IsString() @IsNotEmpty() abbreviation: string;
  @IsString() @IsNotEmpty() tzName: string;
}

export class CreateCountryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  iso2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  iso3?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  numericCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  phoneCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  capital?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  currencyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  currencySymbol?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  tld?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  native?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  region?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  subregion?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimezoneDto)
  timezones?: TimezoneDto[];

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  emoji?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  emojiU?: string;

  @IsOptional()
  @IsBoolean()
  flag?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  wikiDataId?: string;
}
