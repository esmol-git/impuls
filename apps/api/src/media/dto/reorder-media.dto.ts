import { MediaType } from '@prisma/client'
import { ArrayMinSize, IsArray, IsEnum, IsString } from 'class-validator'

export class ReorderMediaDto {
  @IsEnum(MediaType)
  type!: MediaType

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ids!: string[]
}
