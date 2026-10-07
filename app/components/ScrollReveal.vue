<script setup lang="ts">
import { ref, onMounted } from 'vue'

const el = ref<HTMLElement>()

onMounted(async () => {
  if (!el.value) return

  const { gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)

  gsap.from(el.value, {
    y: 32,
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: el.value,
      start: 'top 88%',
      once: true,
    },
  })
})
</script>

<template>
  <div ref="el">
    <slot />
  </div>
</template>
