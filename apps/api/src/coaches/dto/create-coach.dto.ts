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
} from 'class-validator'

export class CreateCoachDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  role!: string

  @IsString()
  @MinLength(1)
  @MaxLength(60)
  experience!: string

  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  bio!: string

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  specialties?: string[]

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string | null

  @IsOptional()
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
