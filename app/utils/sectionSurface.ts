export type SectionTone = 'paper' | 'mist'
export type SectionEdge = 'wave' | 'slant'

/** CSS-переменные — светлая/тёмная тема через html.dark */
export const SECTION_SURFACE: Record<SectionTone, string> = {
  paper: 'var(--surface-paper)',
  mist: 'var(--surface-mist)',
}

/** Секции без волн/скосов (идут сразу после hero). */
export const SECTION_NO_EDGE = new Set(['hero', 'stats'])

export interface SectionSurfaceProps {
  wave: boolean
  tone?: SectionTone
  edge?: SectionEdge
  flipWave?: boolean
}

/** Чередование по порядку только среди видимых секций со стыком. */
export function surfaceForVisibleIndex(index: number): SectionSurfaceProps {
  const even = index % 2 === 0
  return {
    wave: true,
    tone: even ? 'mist' : 'paper',
    edge: even ? 'wave' : 'slant',
    flipWave: even,
  }
}
