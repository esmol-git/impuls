import { IsIn, IsOptional } from 'class-validator'
import { SortOrderQueryDto } from '../../common/dto/pagination-query.dto'

export const COACH_SORT_FIELDS = ['name', 'role', 'published', 'createdAt', 'sortOrder'] as const
export type CoachSortField = (typeof COACH_SORT_FIELDS)[number]

export class ListCoachesQueryDto extends SortOrderQueryDto {
  @IsOptional()
  @IsIn(COACH_SORT_FIELDS)
  sort?: CoachSortField = 'sortOrder'
}
