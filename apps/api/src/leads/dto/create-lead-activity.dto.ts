import { LeadActivityType } from '@prisma/client'
import { Transform, Type } from 'class-transformer'
import {
  IsDate,
  IsEnum,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator'

export const CALL_RESULTS = ['answered', 'no_answer', 'busy', 'callback'] as const
export type CallResult = (typeof CALL_RESULTS)[number]

export class CreateLeadActivityDto {
  @IsEnum(LeadActivityType)
  type!: LeadActivityType

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const trimmed = value.trim()
      return trimmed.length ? trimmed : undefined
    }
    return value
  })
  @IsString()
  @MaxLength(2000)
  body?: string

  @IsOptional()
  @IsIn(CALL_RESULTS)
  callResult?: CallResult

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
  @IsObject()
  meta?: Record<string, unknown>
}
