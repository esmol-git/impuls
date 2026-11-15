export const THEME_MODES = ['light', 'dark', 'system'] as const

export type ThemeMode = (typeof THEME_MODES)[number]

export function isThemeMode(value: string): value is ThemeMode {
  return (THEME_MODES as readonly string[]).includes(value)
}

export function resolveThemeMode(
  mode: ThemeMode,
  prefersDark: boolean,
): 'light' | 'dark' {
  if (mode === 'system') return prefersDark ? 'dark' : 'light'
  return mode
}
