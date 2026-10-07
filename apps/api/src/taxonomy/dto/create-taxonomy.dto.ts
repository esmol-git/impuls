import { TaxonomyKind } from '@prisma/client'
import { IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateTaxonomyDto {
  @IsEnum(TaxonomyKind)
  kind!: TaxonomyKind

  @IsString()
  @MinLength(1)
  name!: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number
}
