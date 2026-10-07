import { IsBoolean } from 'class-validator'

export class UpdateHomeBlockDto {
  @IsBoolean()
  enabled!: boolean
}
