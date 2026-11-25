import { Transform, Type } from 'class-transformer'
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator'
import { trimString } from '../../common/transforms'
import { LeadPurchaseItemDto } from './lead-purchase-item.dto'

export class CreateLeadDto {
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string

  /** Телефон: цифры, пробелы, +, -, скобки */
  @Transform(trimString)
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  @Matches(/^[+\d][\d\s()\-]{5,31}$/, {
    message: 'Некорректный телефон',
  })
  phone!: string

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(32)
  age?: string

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(2000)
  message?: string

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  source?: string

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  location?: string

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  program?: string

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(64)
  variant?: string

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(64)
  guestToken?: string

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => LeadPurchaseItemDto)
  items?: LeadPurchaseItemDto[]
}
