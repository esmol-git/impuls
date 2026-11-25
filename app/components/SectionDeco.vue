<script setup lang="ts">
/**
 * Мяч-декор. SVG через mask — цвет из tone (brand / accent / muted).
 * WebP остаётся как img (legacy).
 */
const props = withDefaults(defineProps<{
  src: string
  side?: 'left' | 'right'
  corner?: 'top' | 'bottom'
  top?: string
  left?: string
  right?: string
  bottom?: string
  width?: string
  opacity?: number
  rotate?: number
  shiftX?: string
  shiftY?: string
  glow?: boolean
  motion?: number
  /** Цвет SVG-маски */
  tone?: 'brand' | 'accent' | 'muted' | 'white' | 'soft'
  /** Маска по альфе (SVG-мячи) */
  masked?: boolean
  /** Водяной знак-герб: img с деталями, не solid-mask */
  mark?: boolean
}>(), {
  side: 'right',
  corner: 'top',
  opacity: 0.5,
  rotate: 0,
  glow: true,
  motion: 1,
  tone: 'brand',
  masked: false,
  mark: false,
})

const freePos = computed(() =>
  Boolean(props.top || props.left || props.right || props.bottom),
)

const isSvg = computed(() => /\.svg(\?|$)/i.test(props.src))
const useMask = computed(() => (isSvg.value || props.masked) && !props.mark)

const toneColor = computed(() => {
  switch (props.tone) {
    case 'accent':
      return 'var(--deco-tone-accent, #ff2a2a)'
    case 'muted':
      return 'var(--deco-tone-muted, #3d5d91)'
    case 'white':
      return 'var(--deco-tone-white, #ffffff)'
    case 'soft':
      return 'var(--deco-tone-soft, #c2cad6)'
    case 'brand':
    default:
      return 'var(--deco-tone-brand, #253863)'
  }
})

const style = computed(() => {
  const base: Record<string, string> = {
    opacity: String(props.opacity),
    '--deco-rot': `${props.rotate || 0}deg`,
    '--deco-tx': props.shiftX || '0px',
    '--deco-ty': props.shiftY || '0px',
  }
  if (props.width) base.width = props.width
  if (props.top) base.top = props.top
  if (props.left) base.left = props.left
  if (props.right) base.right = props.right
  if (props.bottom) {
    base.bottom = `calc(${props.bottom} + var(--section-edge-h, 5rem) * 0.35)`
  }
  if (useMask.value) {
    base['--deco-color'] = toneColor.value
    base['--deco-mask'] = `url(${props.src})`
  }
  return base
})

const motionClass = computed(() => {
  if (!props.motion) return ''
  return `section-deco--drift-${((props.motion || 1) - 1) % 5 + 1}`
})
</script>

<template>
  <span
    v-if="useMask"
    class="section-deco section-deco--mask"
    :class="[
      motionClass,
      { 'section-deco--glow': glow },
      { 'section-deco--free': freePos },
      { [`section-deco--${side}`]: !freePos },
      { [`section-deco--${corner}`]: !freePos },
    ]"
    :style="style"
    aria-hidden="true"
  />
  <img
    v-else
    class="section-deco"
    :class="[
      motionClass,
      { 'section-deco--glow': glow && !mark },
      { 'section-deco--free': freePos },
      { 'section-deco--mark': mark },
      { [`section-deco--${side}`]: !freePos },
      { [`section-deco--${corner}`]: !freePos },
    ]"
    :style="style"
    :src="src"
    alt=""
    aria-hidden="true"
    loading="lazy"
    decoding="async"
  >
</template>

<style scoped>
.section-deco {
  position: absolute;
  z-index: 1;
  width: min(28%, 160px);
  max-width: 220px;
  height: auto;
  aspect-ratio: 1;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
  transform-origin: center center;
  transform: translate(var(--deco-tx, 0), var(--deco-ty, 0)) rotate(var(--deco-rot, 0deg));
}

.section-deco:not(.section-deco--mask):not(.section-deco--mark) {
  filter: brightness(0.42) contrast(1.15);
}

.section-deco--mask {
  --deco-tone-brand: #253863;
  --deco-tone-accent: #ff2a2a;
  --deco-tone-muted: #3d5d91;
  --deco-tone-white: #ffffff;
  --deco-tone-soft: #c2cad6;
  background-color: var(--deco-color, #253863);
  -webkit-mask-image: var(--deco-mask);
  mask-image: var(--deco-mask);
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}


.section-deco--glow:not(.section-deco--mask):not(.section-deco--mark) {
  filter:
    brightness(0.42) contrast(1.15)
    drop-shadow(0 0 10px rgb(255 59 59 / 0.18))
    drop-shadow(0 0 24px rgb(61 93 145 / 0.12));
}

.section-deco--mark {
  aspect-ratio: 1;
  width: clamp(200px, 42vw, 440px);
  max-width: min(52vw, 460px);
  filter: grayscale(1) contrast(0.88) brightness(1.45);
}

:global(html.dark .section-deco--mark) {
  filter: grayscale(1) brightness(2.4) contrast(0.8);
  opacity: 0.08 !important;
}

.section-deco--mask.section-deco--glow {
  /* один shadow — дешевле, чем dual drop-shadow на десятках мячей */
  filter: drop-shadow(0 0 14px rgb(255 59 59 / 0.16));
}

:global(html.dark .section-deco:not(.section-deco--mask):not(.section-deco--mark)) {
  filter: brightness(0) invert(1);
  opacity: 0.28 !important;
}

:global(html.dark .section-deco--glow:not(.section-deco--mask):not(.section-deco--mark)) {
  filter:
    brightness(0) invert(1)
    drop-shadow(0 0 8px rgb(239 68 68 / 0.45))
    drop-shadow(0 0 20px rgb(220 38 38 / 0.28));
}

:global(html.dark .section-deco--mask) {
  --deco-tone-brand: #c8d6eb;
  --deco-tone-accent: #ff5c5c;
  --deco-tone-muted: #8aa4c8;
  --deco-tone-white: #ffffff;
  --deco-tone-soft: #4a5a72;
}

:global(html.dark .section-deco--mask.section-deco--glow) {
  filter: drop-shadow(0 0 12px rgb(239 68 68 / 0.35));
}
.section-deco--left {
  left: 2%;
}

.section-deco--right {
  right: 2%;
}

.section-deco--top {
  top: 12%;
}

.section-deco--bottom {
  top: auto;
  bottom: calc(var(--section-edge-h, 5rem) + 8%);
}

@media (min-width: 640px) {
  .section-deco {
    width: min(22%, 200px);
  }
}

@media (min-width: 1024px) {
  .section-deco {
    width: min(16%, 240px);
  }
}

@media (prefers-reduced-motion: no-preference) {
  .section-deco--drift-1 {
    animation: deco-drift-1 11s ease-in-out infinite;
  }

  .section-deco--drift-2 {
    animation: deco-drift-2 14s ease-in-out infinite;
  }

  .section-deco--drift-3 {
    animation: deco-drift-3 12.5s ease-in-out infinite;
  }

  .section-deco--drift-4 {
    animation: deco-drift-4 16s ease-in-out infinite;
  }

  .section-deco--drift-5 {
    animation: deco-drift-5 13s ease-in-out infinite;
  }
}

@keyframes deco-drift-1 {
  0%,
  100% {
    transform: translate(var(--deco-tx, 0), var(--deco-ty, 0)) rotate(var(--deco-rot, 0deg));
  }

  50% {
    transform: translate(calc(var(--deco-tx, 0px) + 12px), calc(var(--deco-ty, 0px) - 18px))
      rotate(calc(var(--deco-rot, 0deg) + 6deg));
  }
}

@keyframes deco-drift-2 {
  0%,
  100% {
    transform: translate(var(--deco-tx, 0), var(--deco-ty, 0)) rotate(var(--deco-rot, 0deg));
  }

  50% {
    transform: translate(calc(var(--deco-tx, 0px) - 16px), calc(var(--deco-ty, 0px) + 10px))
      rotate(calc(var(--deco-rot, 0deg) - 5deg));
  }
}

@keyframes deco-drift-3 {
  0%,
  100% {
    transform: translate(var(--deco-tx, 0), var(--deco-ty, 0)) rotate(var(--deco-rot, 0deg));
  }

  33% {
    transform: translate(calc(var(--deco-tx, 0px) + 8px), calc(var(--deco-ty, 0px) + 14px))
      rotate(calc(var(--deco-rot, 0deg) + 4deg));
  }

  66% {
    transform: translate(calc(var(--deco-tx, 0px) - 10px), calc(var(--deco-ty, 0px) - 8px))
      rotate(calc(var(--deco-rot, 0deg) - 3deg));
  }
}

@keyframes deco-drift-4 {
  0%,
  100% {
    transform: translate(var(--deco-tx, 0), var(--deco-ty, 0)) rotate(var(--deco-rot, 0deg));
  }

  50% {
    transform: translate(calc(var(--deco-tx, 0px) + 6px), calc(var(--deco-ty, 0px) - 22px))
      rotate(calc(var(--deco-rot, 0deg) + 8deg));
  }
}

@keyframes deco-drift-5 {
  0%,
  100% {
    transform: translate(var(--deco-tx, 0), var(--deco-ty, 0)) rotate(var(--deco-rot, 0deg));
  }

  40% {
    transform: translate(calc(var(--deco-tx, 0px) - 14px), calc(var(--deco-ty, 0px) - 6px))
      rotate(calc(var(--deco-rot, 0deg) - 7deg));
  }

  70% {
    transform: translate(calc(var(--deco-tx, 0px) + 10px), calc(var(--deco-ty, 0px) + 12px))
      rotate(calc(var(--deco-rot, 0deg) + 3deg));
  }
}

@media (prefers-reduced-motion: reduce) {
  .section-deco--drift-1,
  .section-deco--drift-2,
  .section-deco--drift-3,
  .section-deco--drift-4,
  .section-deco--drift-5 {
    animation: none;
  }
}
</style>
