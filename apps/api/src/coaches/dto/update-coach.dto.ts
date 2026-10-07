import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator'

export class UpdateCoachDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  role?: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  experience?: string

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  bio?: string

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  specialties?: string[]

  @IsOptional()
  @ValidateIf((_o, value) => value !== null)
  @IsString()
  @MaxLength(500)
  imageUrl?: string | null

  @IsOptional()
  @ValidateIf((_o, value) => value !== null)
  @IsString()
  @MaxLength(200)
  imageAlt?: string | null

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number

  @IsOptional()
  @IsBoolean()
  published?: boolean
}
