import { Gender, Role } from '@prisma/client'
import { Transform, Type } from 'class-transformer'
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator'

export class UpdateUserDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(254)
  email?: string

  @IsOptional()
  @ValidateIf((_o, value) => value !== '' && value != null)
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password?: string

  @IsOptional()
  @IsEnum(Role)
  role?: Role

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @ValidateIf((_o, value) => value !== null)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName?: string | null

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @ValidateIf((_o, value) => value !== null)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName?: string | null

  @IsOptional()
  @ValidateIf((_o, value) => value !== null)
  @IsEnum(Gender)
  gender?: Gender | null

  @IsOptional()
  @ValidateIf((_o, value) => value !== null)
  @Type(() => Date)
  @IsDate()
  birthDate?: Date | null
}
