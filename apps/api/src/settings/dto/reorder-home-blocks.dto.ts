import { ArrayMinSize, IsArray, IsString } from 'class-validator'

export class ReorderHomeBlocksDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  keys!: string[]
}