import { LeadStatus } from '@prisma/client'
import { Transform } from 'class-transformer'
import { IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator'
import { SortOrderQueryDto } from '../../common/dto/pagination-query.dto'

export const LEAD_SORT_FIELDS = ['createdAt', 'name', 'phone', 'source', 'status'] as const
export type LeadSortField = (typeof LEAD_SORT_FIELDS)[number]

function trimString({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim() : value
}

export class ListLeadsQueryDto extends SortOrderQueryDto {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus

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
