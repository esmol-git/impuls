<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

defineProps<{
  title: string
  description?: string
  size?: 'md' | 'lg'
}>()

const emit = defineEmits<{ close: [] }>()
const { visible, close, onAfterLeave } = useModal()

const panelRef = ref<HTMLElement>()

function onClose() {
  close()
  emit('close')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') onClose()
}

function handleAfterLeave() {
  onAfterLeave()
}

watch(visible, (val) => {
  if (val) {
    nextTick(() => panelRef.value?.focus())
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      name="modal"
      appear
      :duration="{ enter: 550, leave: 380 }"
      @after-leave="handleAfterLeave"
    >
      <div
        v-if="visible"
        class="modal-overlay fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        @keydown="onKeydown"
      >
        <div class="modal-backdrop absolute inset-0 bg-brand-900/40" @click="onClose" />

        <div
          ref="panelRef"
          tabindex="-1"
          class="modal-panel relative w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
          :class="size === 'lg' ? 'max-w-lg' : 'max-w-md'"
        >
          <div class="border-b border-brand-100 px-4 py-4 pr-12 sm:px-6 sm:py-5 sm:pr-14">
            <h2 class="text-lg font-bold text-brand-600 sm:text-xl">{{ title }}</h2>
            <p v-if="description" class="mt-1 text-sm text-brand-600/70">
              {{ description }}
            </p>
          </div>

          <button
            type="button"
            class="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-brand-400 transition hover:bg-brand-50 hover:text-brand-600"
            aria-label="Закрыть"
            @click="onClose"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="max-h-[75dvh] overflow-y-auto overscroll-contain px-4 py-4 sm:max-h-[70vh] sm:px-6 sm:py-5">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
