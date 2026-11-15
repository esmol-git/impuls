export const THEME_COOKIE = 'impuls_theme'
export const THEME_RESOLVED_COOKIE = 'impuls_theme_resolved'

export function resolvedFromMode(
  mode: string,
  prefersDark: boolean,
): 'light' | 'dark' {
  if (mode === 'dark') return 'dark'
  if (mode === 'light') return 'light'
  return prefersDark ? 'dark' : 'light'
}
