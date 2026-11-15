import { IsIn } from 'class-validator'
import { THEME_MODES, type ThemeMode } from '../theme'

export class UpdateThemeDto {
  @IsIn(THEME_MODES)
  mode!: ThemeMode
}
