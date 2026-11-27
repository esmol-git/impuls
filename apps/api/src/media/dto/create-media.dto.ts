import { MediaType } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator'

export class CreateMediaDto {
  @IsEnum(MediaType)
  type!: MediaType

  @ValidateIf(
    (o: CreateMediaDto) => o.type !== MediaType.REVIEW && o.type !== MediaType.GALLERY,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  imageUrl!: string

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  imageUrls?: string[]

  @IsOptional()
  @IsString()
  @MaxLength(200_000)
  body?: string

  @ValidateIf((o: CreateMediaDto) => o.type === MediaType.NEWS)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  topic?: string

  @ValidateIf((o: CreateMediaDto) => o.type === MediaType.CATALOG)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  category?: string

  /** Если не передан — сгенерируется на сервере */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  sku?: string

  /** Остаток (пока не используем в логике) */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  quantity?: number

  @IsOptional()
  @IsString()
  @MaxLength(160)
  slug?: string

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== '')
  @IsString()
  @MaxLength(4000)
  description?: string | null

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  discount?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salePrice?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number

  @IsOptional()
  @IsBoolean()
  published?: boolean

  /** Новости: дата/время публикации (ISO). Пусто = сразу при published */
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== '')
  @IsDateString()
  publishAt?: string | null

  /** Новости: снять с публикации после (ISO). Пусто = не снимать */
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== '')
  @IsDateString()
  unpublishAt?: string | null
}
