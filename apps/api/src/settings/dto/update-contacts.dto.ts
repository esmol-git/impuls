import { Type } from 'class-transformer'
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator'

const CLOCK = /^([01]\d|2[0-3]):[0-5]\d$/

class ContactsSocialsDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  vk?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  telegram?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  youtube?: string
}

export class UpdateContactsDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  phone?: string

  @IsOptional()
  @IsString()
  @MaxLength(120)
  phoneHours?: string

  @IsOptional()
  @ValidateIf((_, value) => value !== '' && value != null)
  @Matches(CLOCK, { message: 'Укажите время в формате ЧЧ:ММ' })
  phoneHoursFrom?: string

  @IsOptional()
  @ValidateIf((_, value) => value !== '' && value != null)
  @Matches(CLOCK, { message: 'Укажите время в формате ЧЧ:ММ' })
  phoneHoursTo?: string

  @IsOptional()
  @ValidateIf((_, value) => value !== '' && value != null)
  @IsEmail({}, { message: 'Некорректный email' })
  @MaxLength(200)
  email?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => ContactsSocialsDto)
  socials?: ContactsSocialsDto
}
