import { TaxonomyKind } from '@prisma/client'
import { IsEnum, IsOptional } from 'class-validator'

export class ListTaxonomyQueryDto {
  @IsOptional()
  @IsEnum(TaxonomyKind)
  kind?: TaxonomyKind
}