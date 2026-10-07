<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const { visible, current, activeIndex, items, close, onAfterLeave, next, prev } = useLightbox()

function onKeydown(e: KeyboardEvent) {
  if (!visible.value) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowRight') next()
  if (e.key === 'ArrowLeft') prev()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition
      name="modal"
      appear
      :duration="{ enter: 550, leave: 380 }"
      @after-leave="onAfterLeave"
    >
      <div
        v-if="visible"
        class="modal-overlay fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Просмотр фото"
      >
        <div class="modal-backdrop absolute inset-0 bg-brand-900/80" @click="close" />

        <div class="modal-panel relative z-10 w-full max-w-4xl">
          <button
            type="button"
            class="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-900/50 text-white/90 transition hover:bg-brand-900/70 hover:text-white sm:-top-12 sm:right-0 sm:bg-transparent"
            aria-label="Закрыть"
            @click="close"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div v-if="current?.src" class="relative">
              <img :src="current.src" :alt="current.alt" class="max-h-[70dvh] w-full object-contain sm:max-h-[80vh]">
            </div>
            <UiSkeletonImage v-else aspect="video" class="min-h-[50vh]">
              <div class="absolute inset-0 flex items-center justify-center">
                <p class="text-sm text-brand-400">{{ current?.alt }}</p>
              </div>
            </UiSkeletonImage>
            <div class="border-t border-brand-100 px-4 py-3 text-center text-xs text-brand-600/60 sm:px-6 sm:text-sm">
              {{ (activeIndex ?? 0) + 1 }} / {{ items.length }}
            </div>
          </div>

          <button
            v-if="items.length > 1"
            type="button"
            class="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 pr-2 text-white/80 transition hover:text-white max-sm:-translate-x-0 max-sm:left-2 max-sm:rounded-full max-sm:bg-brand-900/50 max-sm:p-2"
            aria-label="Предыдущее"
            @click="prev"
          >
            <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            v-if="items.length > 1"
            type="button"
            class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pl-2 text-white/80 transition hover:text-white max-sm:translate-x-0 max-sm:right-2 max-sm:rounded-full max-sm:bg-brand-900/50 max-sm:p-2"
            aria-label="Следующее"
            @click="next"
          >
            <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
