export const THEME_MODES = ['light', 'dark', 'system'] as const

export type ThemeMode = (typeof THEME_MODES)[number]

export const THEME_SETTING_KEY = 'THEME_MODE'
export const THEME_DEFAULT: ThemeMode = 'system'

export function isThemeMode(value: string): value is ThemeMode {
  return (THEME_MODES as readonly string[]).includes(value)
}
