<script setup lang="ts">
import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'cookie-consent'
const visible = ref(false)

onMounted(() => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    visible.value = true
  }
})

function accept() {
  localStorage.setItem(STORAGE_KEY, '1')
  visible.value = false
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div
      v-if="visible"
      class="scroll-lock-pad fixed inset-x-0 bottom-0 z-[90] border-t border-brand-100 bg-white p-4 shadow-lg safe-bottom md:bottom-4 md:mx-4 md:rounded-2xl md:border lg:mx-auto lg:max-w-site"
    >
      <div class="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p class="text-xs text-brand-600/70 sm:text-sm">
          Мы используем cookies для работы сайта.
          <NuxtLink to="/privacy" class="font-medium text-brand-600 underline-offset-2 hover:text-accent-500 hover:underline">
            Политика конфиденциальности
          </NuxtLink>
        </p>
        <button type="button" class="btn-primary shrink-0 !py-2.5 text-xs sm:!w-auto" @click="accept">
          Принять
        </button>
      </div>
    </div>
  </Transition>
</template>
