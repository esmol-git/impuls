import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'

export class ListAuditQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number

  @IsOptional()
  @IsString()
  @MaxLength(80)
  action?: string

  @IsOptional()
  @IsString()
  @MaxLength(80)
  entity?: string

  @IsOptional()
  @IsString()
  @MaxLength(254)
  actorEmail?: string

  @IsOptional()
  @IsIn(['createdAt'])
  sort?: 'createdAt'

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc'
}
