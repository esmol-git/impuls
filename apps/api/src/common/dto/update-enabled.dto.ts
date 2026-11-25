import { IsBoolean } from 'class-validator'

/** Generic `{ enabled }` body for toggles (home blocks, features, maintenance). */
export class UpdateEnabledDto {
  @IsBoolean()
  enabled!: boolean
}
