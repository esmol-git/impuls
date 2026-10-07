import { MediaType } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

export class UpdateMediaDto {
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  imageUrl?: string

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  imageUrls?: string[]

  @IsOptional()
  @IsString()
  @MaxLength(200_000)
  body?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(120)
  topic?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(64)
  sku?: string | null

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  quantity?: number | null

  @IsOptional()
  @IsString()
  @MaxLength(160)
  slug?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string | null

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price?: number | null

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  discount?: number | null

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salePrice?: number | null

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number

  @IsOptional()
  @IsBoolean()
  published?: boolean
}
