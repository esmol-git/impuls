import { MediaType } from '@prisma/client'
import { IsEnum, IsIn, IsOptional } from 'class-validator'
import { SortOrderQueryDto } from '../../common/dto/pagination-query.dto'

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
}
