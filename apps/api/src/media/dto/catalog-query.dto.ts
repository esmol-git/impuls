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
import { transformToBool } from '../../common/transforms'

export const CATALOG_SORTS = ['default', 'price-asc', 'price-desc', 'title'] as const
export type CatalogSort = (typeof CATALOG_SORTS)[number]

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
  @Transform(transformToBool)
  @IsBoolean()
  onlySale?: boolean

  @IsOptional()
  @IsIn(CATALOG_SORTS)
  sort?: CatalogSort
}
