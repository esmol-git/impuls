import { Transform } from 'class-transformer'
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator'
import { SortOrderQueryDto } from '../../common/dto/pagination-query.dto'
import { transformToBool, trimString } from '../../common/transforms'

export const COACH_SORT_FIELDS = ['name', 'role', 'published', 'createdAt', 'sortOrder'] as const
export type CoachSortField = (typeof COACH_SORT_FIELDS)[number]

export class ListCoachesQueryDto extends SortOrderQueryDto {
  @IsOptional()
  @IsIn(COACH_SORT_FIELDS)
  sort?: CoachSortField = 'sortOrder'

  /** Поиск по имени, роли, опыту, био */
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
