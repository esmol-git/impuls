import { Type } from 'class-transformer'
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

/** Позиция желаемой покупки в заявке (гостевая корзина). */
export class LeadPurchaseItemDto {
  @IsString()
  @MaxLength(64)
  mediaId!: string

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string

  @IsOptional()
  @IsString()
  @MaxLength(64)
  sku?: string

  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  unitPrice!: number

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99)
  qty!: number
}
