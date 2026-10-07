import { MediaType } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator'

export class PublicMediaQueryDto {
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType

  /** Жёсткий потолок для публичных списков (новости / отзывы) */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 100
}
