import { MediaType } from '@prisma/client'
import { Transform } from 'class-transformer'
import { IsBoolean, IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator'
import { SortOrderQueryDto } from '../../common/dto/pagination-query.dto'
import { transformToBool, trimString } from '../../common/transforms'

export const MEDIA_SORT_FIELDS = [
  'title',
  'category',
  'topic',
  'price',
  'salePrice',
  'published',
  'createdAt',
  'sortOrder',
] as const
export type MediaSortField = (typeof MEDIA_SORT_FIELDS)[number]

export class ListMediaQueryDto extends SortOrderQueryDto {
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType

  @IsOptional()
  @IsIn(MEDIA_SORT_FIELDS)
  sort?: MediaSortField = 'createdAt'

  /** Поиск по названию, описанию, категории, артикулу, теме */
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  q?: string

  /** Фильтр по публикации: true — на сайте, false — скрытые */
  @IsOptional()
  @Transform(transformToBool)
  @IsBoolean()
  published?: boolean
}
