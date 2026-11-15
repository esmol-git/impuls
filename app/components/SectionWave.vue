<script setup lang="ts">
/**
 * Стык секций (только desktop+).
 * fill обязан совпадать с backgroundColor секции (тот же токен surface).
 */
const props = withDefaults(defineProps<{
  fill?: string
  flip?: boolean
  variant?: 'wave' | 'slant'
}>(), {
  fill: 'var(--section-surface, var(--surface-paper))',
  flip: false,
  variant: 'wave',
})

const fillStyle = computed(() => ({
  fill: props.fill || 'var(--section-surface, var(--surface-paper))',
}))
</script>

<template>
  <div
    class="section-edge"
    :class="[
      `section-edge--${variant}`,
      { 'is-flip': flip },
    ]"
    aria-hidden="true"
  >
    <svg
      v-if="variant === 'wave'"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        :style="fillStyle"
        d="M0,120
           L0,72
           C 240,72 320,22 520,30
           C 720,38 800,90 1000,80
           C 1180,72 1280,38 1440,50
           L1440,120
           Z"
      />
    </svg>

    <svg
      v-else
      viewBox="0 0 1440 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        :style="fillStyle"
        d="M0,100
           L0,60
           C 360,60 720,14 1080,30
           L1440,10
           L1440,100
           Z"
      />
    </svg>
  </div>
</template>

<style scoped>
.section-edge {
  display: none;
}

@media (min-width: 768px) {
  .section-edge {
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: var(--section-edge-h);
    /* -100% без зазора; +1px перекрывает субпиксельный шов */
    transform: translateY(calc(-100% + 1px));
    z-index: 0;
    pointer-events: none;
    line-height: 0;
  }

  .section-edge.is-flip {
    transform: translateY(calc(-100% + 1px)) scaleX(-1);
  }

  .section-edge svg {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>
