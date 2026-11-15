<script setup lang="ts">
withDefaults(defineProps<{
  /** Основная подпись (что будет на месте) */
  label?: string
  /** Вторичная строка — статус наполнения */
  hint?: string
  aspect?: 'square' | 'video' | 'auto'
  rounded?: boolean
  dark?: boolean
  /** Показать шиммер (идёт наполнение) */
  pulse?: boolean
  /** Только шиммер + бейдж — для карточек с оверлей-текстом */
  compact?: boolean
}>(), {
  label: 'Медиа',
  hint: 'Скоро добавим',
  aspect: 'video',
  rounded: true,
  dark: false,
  pulse: true,
  compact: false,
})
</script>

<template>
  <div
    class="media-ph relative h-full w-full overflow-hidden"
    :class="[
      rounded ? 'rounded-xl' : '',
      aspect === 'square' ? 'aspect-square' : '',
      aspect === 'video' ? 'aspect-video' : '',
      dark ? 'media-ph--dark' : 'media-ph--light',
    ]"
    role="img"
    :aria-label="`${label}. ${hint}`"
  >
    <div
      v-if="pulse"
      class="media-ph__pulse absolute inset-0"
      aria-hidden="true"
    />
    <div
      v-if="compact"
      class="absolute left-3 top-3 z-[1]"
    >
      <span class="media-ph__badge">Наполнение</span>
    </div>
    <div
      v-else
      class="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center"
    >
      <span class="media-ph__badge">Наполнение</span>
      <svg
        class="media-ph__icon h-8 w-8 sm:h-9 sm:w-9"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.25"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <p class="media-ph__label text-xs font-semibold sm:text-sm">{{ label }}</p>
      <p class="media-ph__hint text-[11px] sm:text-xs">{{ hint }}</p>
    </div>
  </div>
</template>

<style scoped>
.media-ph--light {
  border: 1px dashed var(--card-border, #e2e8f0);
  background-color: var(--skeleton-bg, #dce4f0);
  color: var(--page-fg, #17233d);
}

.media-ph--dark {
  border: 1px dashed rgb(148 163 184 / 0.35);
  background-color: rgb(23 35 61 / 0.55);
  color: #e2e9f3;
}

.media-ph__pulse {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgb(255 255 255 / 0.18) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: media-ph-shimmer 2s ease-in-out infinite;
}

.media-ph--dark .media-ph__pulse {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgb(255 255 255 / 0.06) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
}

.media-ph__badge {
  display: inline-flex;
  align-items: center;
  border-radius: 0.375rem;
  padding: 0.15rem 0.55rem;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: rgb(176 25 27 / 0.12);
  color: #b0191b;
}

.media-ph--dark .media-ph__badge {
  background: rgb(248 113 113 / 0.18);
  color: #fb7185;
}

.media-ph__icon {
  opacity: 0.55;
}

.media-ph__label {
  opacity: 0.9;
}

.media-ph__hint {
  opacity: 0.55;
}

@keyframes media-ph-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .media-ph__pulse {
    animation: none;
    opacity: 0;
  }
}
</style>
