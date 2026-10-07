import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator'
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT, type SortOrder } from '../pagination'

/** Базовые page/limit для всех list-эндпоинтов */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = DEFAULT_PAGE

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit?: number = DEFAULT_LIMIT
}

export class SortOrderQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: SortOrder = 'desc'
}
