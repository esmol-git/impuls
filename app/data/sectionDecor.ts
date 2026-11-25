/**
 * Декор секций: либо wash+мячи, либо крупный герб-watermark — не вместе.
 */
import washCorner from '~/assets/img/wash-triangle-corner.webp'
import washWave from '~/assets/img/wash-triangle-wave.webp'
import washFade from '~/assets/img/wash-triangle-fade.webp'
import ball01 from '~/assets/img/ball/ball-01.svg'
import ball02 from '~/assets/img/ball/ball-02.svg'
import ball03 from '~/assets/img/ball/ball-03.svg'
import ball04 from '~/assets/img/ball/ball-04.svg'
import ball05 from '~/assets/img/ball/ball-05.svg'
import ball06 from '~/assets/img/ball/ball-06.svg'
import ball07 from '~/assets/img/ball/ball-07.svg'
import logoCrest from '~/assets/img/logo.webp'

export type DecoSide = 'left' | 'right'
export type DecoCorner = 'top' | 'bottom'
export type WashSide = 'left' | 'right' | 'center' | 'full'
export type DecoTone = 'brand' | 'accent' | 'muted' | 'white' | 'soft'

export interface AmbientGlow {
  tone?: 'red' | 'blue' | 'brand'
  top?: string
  left?: string
  right?: string
  bottom?: string
  size?: string
  opacity?: number
}

export interface SectionDecoConfig {
  src: string
  side?: DecoSide
  corner?: DecoCorner
  top?: string
  left?: string
  right?: string
  bottom?: string
  width?: string
  opacity?: number
  rotate?: number
  shiftX?: string
  shiftY?: string
  motion?: number
  glow?: boolean
  tone?: DecoTone
  /** Маска по альфе (SVG) */
  masked?: boolean
  /** Водяной знак герба с деталями */
  mark?: boolean
}

/** Крупный полупрозрачный герб — без wash и без роя мячей рядом */
function crestMark(partial: Omit<SectionDecoConfig, 'src' | 'mark'> = {}): SectionDecoConfig {
  return {
    src: logoCrest,
    mark: true,
    glow: false,
    opacity: 0.07,
    width: 'clamp(220px, 44vw, 460px)',
    motion: 0,
    rotate: -12,
    ...partial,
  }
}

export interface SectionWashConfig {
  src: string
  opacity?: number
  side?: WashSide
  repeat?: boolean
  size?: string
}

export interface SectionDecorConfig {
  decos?: SectionDecoConfig[]
  wash?: SectionWashConfig
  glows?: AmbientGlow[]
}

const WASH = { opacity: 0.18 } as const

function pairGlow(a: AmbientGlow, b: AmbientGlow): AmbientGlow[] {
  return [a, b]
}

export const SECTION_DECOR: Record<string, SectionDecorConfig> = {
  programs: {
    glows: pairGlow(
      { tone: 'blue', top: '-8%', left: '-6%', size: '52%' },
      { tone: 'brand', bottom: '-10%', right: '-4%', size: '46%' },
    ),
    wash: { src: washFade, side: 'right', opacity: 0.14 },
    decos: [
      { src: ball01, left: '1%', top: '4%', width: 'clamp(96px, 18vw, 190px)', opacity: 0.28, rotate: -18, motion: 1, tone: 'brand' },
      { src: ball04, right: '6%', top: '38%', width: 'clamp(56px, 10vw, 100px)', opacity: 0.22, rotate: 22, motion: 4, tone: 'accent' },
      { src: ball06, left: '12%', bottom: '6%', width: 'clamp(72px, 13vw, 130px)', opacity: 0.2, rotate: 8, motion: 2, tone: 'muted' },
    ],
  },

  'pain-points': {
    glows: pairGlow(
      { tone: 'red', top: '0%', right: '-8%', size: '40%', opacity: 0.4 },
      { tone: 'blue', bottom: '-6%', left: '-10%', size: '52%' },
    ),
    wash: { src: washFade, side: 'left', ...WASH },
    decos: [
      { src: ball02, right: '2%', top: '6%', width: 'clamp(88px, 16vw, 170px)', opacity: 0.26, rotate: -12, motion: 2, tone: 'accent' },
      { src: ball05, left: '4%', bottom: '10%', width: 'clamp(64px, 11vw, 110px)', opacity: 0.2, rotate: 16, motion: 5, tone: 'brand' },
    ],
  },

  audience: {
    glows: [
      { tone: 'blue', top: '-12%', left: '18%', size: '50%', opacity: 0.35 },
    ],
    decos: [
      crestMark({ right: '-2%', top: '8%', rotate: -14, width: 'clamp(220px, 46vw, 480px)' }),
    ],
  },

  'child-benefits': {
    glows: pairGlow(
      { tone: 'brand', top: '8%', left: '-14%', size: '56%' },
      { tone: 'blue', bottom: '-4%', right: '-8%', size: '48%' },
    ),
    wash: { src: washCorner, side: 'center', opacity: 0.14 },
    decos: [
      { src: ball01, right: '1%', top: '5%', width: 'clamp(95px, 16vw, 170px)', opacity: 0.26, rotate: 14, motion: 4, tone: 'brand' },
      { src: ball04, left: '0%', top: '10%', width: 'clamp(64px, 11vw, 110px)', opacity: 0.2, rotate: -16, motion: 1, tone: 'muted' },
      { src: ball02, left: '2%', bottom: '6%', width: 'clamp(72px, 12vw, 125px)', opacity: 0.22, rotate: -12, motion: 2, tone: 'brand' },
    ],
  },

  steps: {
    glows: [
      { tone: 'blue', top: '-4%', right: '-10%', size: '48%' },
    ],
    decos: [
      { src: ball05, right: '0%', top: '5%', width: 'clamp(80px, 14vw, 150px)', opacity: 0.26, rotate: 10, motion: 5, tone: 'brand' },
      { src: ball07, left: '2%', top: '55%', width: 'clamp(58px, 10vw, 95px)', opacity: 0.2, rotate: -16, motion: 1, tone: 'accent' },
    ],
  },

  progression: {
    glows: pairGlow(
      { tone: 'brand', top: '-6%', left: '-4%', size: '46%' },
      { tone: 'blue', bottom: '-12%', right: '15%', size: '50%' },
    ),
    wash: { src: washWave, side: 'center', opacity: 0.15 },
    decos: [
      { src: ball03, left: '3%', top: '6%', width: 'clamp(70px, 12vw, 125px)', opacity: 0.24, rotate: -20, motion: 2, tone: 'muted' },
      { src: ball01, right: '4%', bottom: '8%', width: 'clamp(95px, 16vw, 175px)', opacity: 0.26, rotate: 12, motion: 4, tone: 'accent' },
    ],
  },

  training: {
    glows: pairGlow(
      { tone: 'blue', top: '-10%', left: '-6%', size: '54%' },
      { tone: 'red', bottom: '-8%', right: '-8%', size: '40%', opacity: 0.35 },
    ),
    decos: [
      crestMark({ right: '-2%', top: '6%', rotate: 11, width: 'clamp(200px, 40vw, 420px)' }),
    ],
  },

  conditions: {
    glows: [
      { tone: 'blue', bottom: '-10%', left: '-6%', size: '48%' },
    ],
    wash: { src: washFade, side: 'left', ...WASH },
    decos: [
      { src: ball07, left: '0%', top: '8%', width: 'clamp(92px, 16vw, 170px)', opacity: 0.24, rotate: -14, motion: 4, tone: 'brand' },
      { src: ball05, right: '5%', bottom: '6%', width: 'clamp(60px, 10vw, 100px)', opacity: 0.2, rotate: 18, motion: 2, tone: 'accent' },
    ],
  },

  ecosystem: {
    glows: pairGlow(
      { tone: 'blue', top: '-8%', left: '-6%', size: '52%' },
      { tone: 'red', bottom: '-10%', right: '-8%', size: '48%', opacity: 0.4 },
    ),
    wash: { src: washFade, side: 'center', opacity: 0.1 },
    decos: [
      { src: ball01, right: '1%', top: '6%', width: 'clamp(90px, 15vw, 165px)', opacity: 0.24, rotate: 12, motion: 2, tone: 'brand' },
      { src: ball03, left: '0%', top: '12%', width: 'clamp(64px, 11vw, 110px)', opacity: 0.2, rotate: -18, motion: 4, tone: 'accent' },
      { src: ball06, left: '2%', bottom: '8%', width: 'clamp(72px, 12vw, 125px)', opacity: 0.22, rotate: -10, motion: 5, tone: 'muted' },
      { src: ball04, right: '4%', bottom: '4%', width: 'clamp(58px, 10vw, 98px)', opacity: 0.18, rotate: 8, motion: 3, tone: 'brand' },
    ],
  },

  advantages: {
    glows: [
      { tone: 'brand', top: '-8%', right: '8%', size: '50%' },
    ],
    decos: [
      { src: ball05, left: '2%', top: '4%', width: 'clamp(78px, 13vw, 140px)', opacity: 0.24, rotate: -10, motion: 1, tone: 'brand' },
      { src: ball02, right: '1%', top: '48%', width: 'clamp(100px, 17vw, 180px)', opacity: 0.22, rotate: 15, motion: 3, tone: 'accent' },
    ],
  },

  video: {
    glows: pairGlow(
      { tone: 'blue', top: '-8%', left: '-10%', size: '56%' },
      { tone: 'red', bottom: '-6%', right: '-6%', size: '44%', opacity: 0.45 },
    ),
    wash: { src: washCorner, side: 'left', opacity: 0.12 },
    decos: [
      { src: ball03, right: '1%', top: '4%', width: 'clamp(95px, 16vw, 170px)', opacity: 0.26, rotate: 12, motion: 2, tone: 'accent' },
      { src: ball07, left: '0%', top: '18%', width: 'clamp(70px, 12vw, 120px)', opacity: 0.2, rotate: -14, motion: 5, tone: 'brand' },
      { src: ball01, right: '6%', bottom: '4%', width: 'clamp(78px, 13vw, 135px)', opacity: 0.22, rotate: 8, motion: 1, tone: 'muted' },
    ],
  },

  locations: {
    glows: [
      { tone: 'blue', top: '-6%', right: '-8%', size: '50%' },
    ],
    wash: { src: washFade, side: 'right', opacity: 0.14 },
    decos: [
      { src: ball06, left: '1%', top: '5%', width: 'clamp(90px, 15vw, 160px)', opacity: 0.24, rotate: -12, motion: 3, tone: 'brand' },
      { src: ball04, right: '4%', top: '40%', width: 'clamp(55px, 9vw, 88px)', opacity: 0.18, rotate: 24, motion: 5, tone: 'accent' },
      { src: ball02, left: '10%', bottom: '4%', width: 'clamp(72px, 12vw, 125px)', opacity: 0.2, rotate: 6, motion: 2, tone: 'muted' },
    ],
  },

  gallery: {
    glows: pairGlow(
      { tone: 'brand', top: '-10%', left: '-8%', size: '52%' },
      { tone: 'blue', bottom: '-12%', right: '-4%', size: '54%' },
    ),
    wash: { src: washWave, side: 'left', opacity: 0.14 },
    decos: [
      { src: ball05, right: '0%', top: '6%', width: 'clamp(95px, 16vw, 175px)', opacity: 0.24, rotate: 14, motion: 2, tone: 'brand' },
      { src: ball01, left: '2%', top: '10%', width: 'clamp(58px, 10vw, 95px)', opacity: 0.18, rotate: -20, motion: 4, tone: 'accent' },
      { src: ball07, right: '12%', bottom: '2%', width: 'clamp(70px, 12vw, 120px)', opacity: 0.2, rotate: 8, motion: 1, tone: 'muted' },
    ],
  },

  catalog: {
    glows: pairGlow(
      { tone: 'blue', top: '0%', left: '-10%', size: '52%' },
      { tone: 'brand', bottom: '-8%', right: '-6%', size: '46%' },
    ),
    wash: { src: washWave, side: 'left', opacity: 0.14 },
    decos: [
      { src: ball02, right: '1%', top: '6%', width: 'clamp(88px, 15vw, 160px)', opacity: 0.24, rotate: 10, motion: 5, tone: 'accent' },
      { src: ball06, left: '1%', top: '16%', width: 'clamp(58px, 10vw, 98px)', opacity: 0.18, rotate: -16, motion: 3, tone: 'brand' },
      { src: ball03, left: '2%', bottom: '8%', width: 'clamp(72px, 12vw, 125px)', opacity: 0.2, rotate: -14, motion: 2, tone: 'muted' },
    ],
  },

  news: {
    glows: pairGlow(
      { tone: 'blue', top: '-6%', left: '-8%', size: '50%' },
      { tone: 'brand', bottom: '-8%', right: '-4%', size: '46%' },
    ),
    wash: { src: washFade, side: 'right', opacity: 0.12 },
    decos: [
      { src: ball04, left: '1%', top: '8%', width: 'clamp(88px, 15vw, 160px)', opacity: 0.24, rotate: -16, motion: 3, tone: 'brand' },
      { src: ball07, right: '3%', top: '14%', width: 'clamp(72px, 12vw, 130px)', opacity: 0.2, rotate: 12, motion: 1, tone: 'accent' },
      { src: ball01, left: '6%', bottom: '8%', width: 'clamp(64px, 11vw, 110px)', opacity: 0.2, rotate: 14, motion: 2, tone: 'muted' },
    ],
  },

  reviews: {
    glows: pairGlow(
      { tone: 'blue', top: '-8%', left: '-6%', size: '50%' },
      { tone: 'brand', bottom: '-10%', right: '-8%', size: '52%' },
    ),
    wash: { src: washCorner, side: 'right', opacity: 0.1 },
    decos: [
      { src: ball05, left: '0%', top: '5%', width: 'clamp(90px, 15vw, 165px)', opacity: 0.24, rotate: -10, motion: 1, tone: 'brand' },
      { src: ball03, right: '1%', top: '8%', width: 'clamp(72px, 12vw, 125px)', opacity: 0.2, rotate: 14, motion: 3, tone: 'accent' },
      { src: ball06, right: '2%', bottom: '6%', width: 'clamp(70px, 12vw, 120px)', opacity: 0.2, rotate: 12, motion: 4, tone: 'muted' },
    ],
  },

  faq: {
    glows: pairGlow(
      { tone: 'blue', top: '-4%', left: '-8%', size: '50%' },
      { tone: 'brand', bottom: '-8%', right: '-6%', size: '46%' },
    ),
    decos: [
      crestMark({ right: '-2%', bottom: '8%', rotate: -9, width: 'clamp(190px, 38vw, 400px)' }),
    ],
  },

  coaches: {
    glows: pairGlow(
      { tone: 'brand', top: '-10%', left: '-4%', size: '54%' },
      { tone: 'blue', bottom: '-8%', right: '-6%', size: '48%' },
    ),
    wash: { src: washFade, side: 'right', opacity: 0.1 },
    decos: [
      { src: ball02, right: '1%', top: '5%', width: 'clamp(90px, 15vw, 165px)', opacity: 0.24, rotate: 8, motion: 3, tone: 'brand' },
      { src: ball05, left: '1%', top: '10%', width: 'clamp(64px, 11vw, 110px)', opacity: 0.2, rotate: -16, motion: 5, tone: 'accent' },
      { src: ball03, left: '2%', bottom: '8%', width: 'clamp(70px, 12vw, 120px)', opacity: 0.2, rotate: -12, motion: 1, tone: 'muted' },
    ],
  },
}

export function decorFor(key: string): SectionDecorConfig | undefined {
  return SECTION_DECOR[key]
}

export function decosOf(config?: SectionDecorConfig | null): SectionDecoConfig[] {
  return config?.decos ?? []
}

export function glowsOf(config?: SectionDecorConfig | null): AmbientGlow[] {
  return config?.glows ?? []
}
