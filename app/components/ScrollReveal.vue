<script setup lang="ts">
/**
 * Один reveal на блок/сетку. Не оборачивайте каждую карточку —
 * иначе при скролле они всплывают по одной и кажется, что «тормозит».
 */
const el = ref<HTMLElement>()

let observer: IntersectionObserver | null = null
let cancelled = false

onMounted(() => {
  const node = el.value
  if (!node) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || typeof IntersectionObserver === 'undefined') {
    node.classList.add('is-revealed')
    return
  }

  // Клиент: сначала прячем — SSR остаётся видимым без JS
  node.classList.add('is-pending')

  const reveal = () => {
    if (cancelled) return
    node.classList.add('is-revealed')
    node.classList.remove('is-pending')
    observer?.disconnect()
    observer = null
  }

  // Двойной rAF: браузер обязан отрисовать opacity:0 до старта transition
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (cancelled) return

      const rect = node.getBoundingClientRect()
      const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0
      if (inView) {
        reveal()
        return
      }

      // threshold 0: у высоких блоков (сетка тренеров) 0.12 никогда не набирается
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return
          reveal()
        },
        {
          rootMargin: '0px 0px -6% 0px',
          threshold: 0,
        },
      )
      observer.observe(node)
    })
  })
})

onUnmounted(() => {
  cancelled = true
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div ref="el" class="scroll-reveal">
    <slot />
  </div>
</template>

<style scoped>
.scroll-reveal {
  transition:
    opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.scroll-reveal.is-pending {
  opacity: 0;
  transform: translate3d(0, 1.25rem, 0);
  will-change: opacity, transform;
}

.scroll-reveal.is-revealed {
  opacity: 1;
  transform: none;
  will-change: auto;
}

@media (prefers-reduced-motion: reduce) {
  .scroll-reveal,
  .scroll-reveal.is-pending,
  .scroll-reveal.is-revealed {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
