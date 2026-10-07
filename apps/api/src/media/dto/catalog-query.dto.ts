import { Transform, Type } from 'class-transformer'
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'
import { DEFAULT_PAGE } from '../../common/pagination'

export const CATALOG_SORTS = ['default', 'price-asc', 'price-desc', 'title'] as const
export type CatalogSort = (typeof CATALOG_SORTS)[number]

function toBool(value: unknown) {
  if (value === true || value === 'true' || value === '1') return true
  if (value === false || value === 'false' || value === '0' || value === '') return false
  return undefined
}

export class CatalogQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = DEFAULT_PAGE

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(48)
  limit?: number = 9

  @IsOptional()
  @IsString()
  q?: string

  /** Категории через запятую */
  @IsOptional()
  @IsString()
  categories?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceMin?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceMax?: number

  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  onlySale?: boolean

  @IsOptional()
  @IsIn(CATALOG_SORTS)
  sort?: CatalogSort
}
