import { MediaType } from '@prisma/client'
import { Type } from 'class-transformer'
import { ArrayMinSize, IsArray, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'

export class ReorderMediaDto {
  @IsEnum(MediaType)
  type!: MediaType

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ids!: string[]

  /** Смещение sortOrder для постраничного reorder (страница 2 при limit=24 → offset=24) */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0
}
