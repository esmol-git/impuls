import { IsIn, IsOptional } from 'class-validator'
import { SortOrderQueryDto } from '../../common/dto/pagination-query.dto'

export const USER_SORT_FIELDS = ['email', 'role', 'createdAt'] as const
export type UserSortField = (typeof USER_SORT_FIELDS)[number]

export class ListUsersQueryDto extends SortOrderQueryDto {
  @IsOptional()
  @IsIn(USER_SORT_FIELDS)
  sort?: UserSortField = 'createdAt'
}
