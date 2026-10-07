<script setup lang="ts">
import { socialLinks } from '~/data/site'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md'
}>(), {
  variant: 'dark',
  size: 'md',
})

const icons = {
  vk: 'M13.5 16.5c-4.5 0-7.1-3-8.2-6.6-.5-1.5-.8-3.2-.8-4.9C4.5 5 5 4.5 5.6 4.5h2.1c.5 0 .7.2.8.7.6 2.2 1.6 4.1 1.6 4.1s.1.3.4.3c.3 0 .5-.2.5-.2s3.9-3.6 4.3-4.1c.3-.4.5-.3.8-.2l2.1.1c.6 0 .7.3.6.7-.2 1.1-2.2 4.4-2.2 4.4s-.2.3 0 .5c.2.2.7.6 1.1 1 1 .9 1.7 1.6 1.9 2.1.2.5-.1.8-.6.8h-2.1c-.5 0-.7-.2-1.1-.6-.8-.8-1.6-1.5-1.8-1.5-.1 0-.2.1-.2.5v1.4c0 .4-.1.7-.7.7z',
  telegram: 'M20.5 4.5L4 11.2c-.8.3-.8.8-.1 1l4 1.5 1.5 4.6c.2.5.6.6 1 .3l2.1-2 4.5 3.3c.5.4 1 .2 1.1-.6l2.6-12.2c.2-.7-.3-1-.8-.8zm-9.7 8.4l7.6-4.8c.4-.2.7-.1.4.2l-6.4 5.8-.2 2.6-1-3.8 6.4-5.8c.3-.3.6-.2.3.1l-7.6 4.8z',
  youtube: 'M21.5 7.8a2.5 2.5 0 00-1.7-1.7C18.1 5.5 12 5.5 12 5.5s-6.1 0-7.8.6a2.5 2.5 0 00-1.7 1.7C2 9.5 2 12 2 12s0 2.5.5 4.2a2.5 2.5 0 001.7 1.7c1.7.6 7.8.6 7.8.6s6.1 0 7.8-.6a2.5 2.5 0 001.7-1.7c.5-1.7.5-4.2.5-4.2s0-2.5-.5-4.2zM10 15.3V8.7L15.5 12 10 15.3z',
} as const
</script>

<template>
  <ul class="flex flex-wrap gap-2 sm:gap-3" v-bind="$attrs">
    <li v-for="link in socialLinks" :key="link.href">
      <a
        :href="link.href"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center justify-center rounded-full transition"
        :class="[
          size === 'sm' ? 'h-9 w-9' : 'h-10 w-10 sm:h-11 sm:w-11',
          variant === 'light'
            ? 'bg-white/10 text-white hover:bg-white/20'
            : 'bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white',
        ]"
        :aria-label="link.label"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path :d="icons[link.icon]" />
        </svg>
      </a>
    </li>
  </ul>
</template>
