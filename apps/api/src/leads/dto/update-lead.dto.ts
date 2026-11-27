import { LeadStatus } from '@prisma/client'
import { Transform, Type } from 'class-transformer'
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator'

export class UpdateLeadDto {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus

  /** null — снять назначенного менеджера */
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(64)
  assigneeId?: string | null

  @IsOptional()
  @Transform(({ value }) => {
    if (value === null) return null
    if (typeof value === 'string') {
      const trimmed = value.trim()
      return trimmed.length ? trimmed : null
    }
    return value
  })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  @MaxLength(2000)
  note?: string | null

  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === '') return null
    return value
  })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @Type(() => Date)
  @IsDate()
  nextContactAt?: Date | null

  @IsOptional()
  @Transform(({ value }) => {
    if (value === null) return null
    if (typeof value === 'string') {
      const trimmed = value.trim()
      return trimmed.length ? trimmed : null
    }
    return value
  })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  @MaxLength(200)
  lostReason?: string | null

  @IsOptional()
  @Transform(({ value }) => {
    if (value === null) return null
    if (typeof value === 'string') {
      const trimmed = value.trim()
      return trimmed.length ? trimmed : null
    }
    return value
  })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  @MaxLength(120)
  childName?: string | null
}
