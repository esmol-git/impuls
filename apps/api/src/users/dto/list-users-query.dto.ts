import { Transform } from 'class-transformer'
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'
import { SortOrderQueryDto } from '../../common/dto/pagination-query.dto'
import { trimString } from '../../common/transforms'

export const USER_SORT_FIELDS = ['email', 'role', 'createdAt'] as const
export type UserSortField = (typeof USER_SORT_FIELDS)[number]

export class ListUsersQueryDto extends SortOrderQueryDto {
  @IsOptional()
  @IsIn(USER_SORT_FIELDS)
  sort?: UserSortField = 'createdAt'

  /** Поиск по email, имени, фамилии */
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  q?: string
}
