<script setup lang="ts">
const { visible, syncFromStorage, accept } = useCookieConsent()

onMounted(() => {
  syncFromStorage()
})
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
      class="cookie-banner scroll-lock-pad fixed inset-x-0 bottom-0 z-[90] p-4 shadow-lg safe-bottom md:bottom-4 md:mx-4 md:rounded-2xl md:border lg:mx-auto lg:max-w-site"
      role="dialog"
      aria-label="Согласие на cookies"
    >
      <div class="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p class="cookie-banner__text text-xs sm:text-sm">
          Мы используем cookies для работы сайта.
          <NuxtLink to="/legal#policy" class="cookie-banner__link font-medium underline-offset-2 hover:underline">
            Политика обработки персональных данных
          </NuxtLink>
        </p>
        <button type="button" class="btn-primary shrink-0 !py-2.5 text-xs sm:!w-auto" @click="accept">
          Принять
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.cookie-banner {
  border-top: 1px solid var(--card-border);
  background: color-mix(in srgb, var(--card-bg) 96%, transparent);
  backdrop-filter: blur(12px);
}

@media (min-width: 768px) {
  .cookie-banner {
    border: 1px solid var(--card-border);
  }
}

.cookie-banner__text {
  color: var(--header-fg-muted);
}

.cookie-banner__link {
  color: var(--header-fg);
}

.cookie-banner__link:hover {
  color: #b0191b;
}

:global(html.dark .cookie-banner__link:hover) {
  color: #ff4242;
}
</style>
