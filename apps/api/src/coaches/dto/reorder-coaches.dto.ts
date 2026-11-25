import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class ReorderCoachesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ids!: string[]

  /** Смещение для текущей страницы: sortOrder = offset + index */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number
}
