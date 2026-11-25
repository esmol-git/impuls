import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'
import { SortOrderQueryDto } from '../../common/dto/pagination-query.dto'

export class ListAuditQueryDto extends SortOrderQueryDto {
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
}
