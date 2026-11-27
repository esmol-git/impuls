import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'
import { DEFAULT_PAGE } from '../../common/pagination'
import { NEWS_PAGE_SIZE } from '../media.shared'

export class NewsQueryDto {
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
  /** Дефолт из NEWS_PAGE_SIZE */
  limit?: number = NEWS_PAGE_SIZE

  /** Фильтр по теме новости */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  topic?: string
}
