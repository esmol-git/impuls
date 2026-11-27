import { LeadStatus } from '@prisma/client'
import { Transform } from 'class-transformer'
import { IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator'
import { SortOrderQueryDto } from '../../common/dto/pagination-query.dto'
import { trimString } from '../../common/transforms'

export const LEAD_SORT_FIELDS = [
  'createdAt',
  'name',
  'phone',
  'source',
  'status',
  'nextContactAt',
] as const
export type LeadSortField = (typeof LEAD_SORT_FIELDS)[number]

export const LEAD_CALLBACK_FILTERS = ['today', 'overdue', 'upcoming'] as const
export type LeadCallbackFilter = (typeof LEAD_CALLBACK_FILTERS)[number]

export class ListLeadsQueryDto extends SortOrderQueryDto {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus

  /** Фильтр по менеджеру; значение `me` — текущий пользователь */
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(64)
  assigneeId?: string

  @IsOptional()
  @IsIn(LEAD_CALLBACK_FILTERS)
  callback?: LeadCallbackFilter

  @IsOptional()
  @IsIn(LEAD_SORT_FIELDS)
  sort?: LeadSortField = 'createdAt'

  /** Поиск по имени, телефону, источнику, программе, комментарию */
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  q?: string
}
