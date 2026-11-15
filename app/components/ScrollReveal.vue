<script setup lang="ts">
/**
 * Один reveal на блок/сетку. Не оборачивайте каждую карточку —
 * иначе при скролле они всплывают по одной и кажется, что «тормозит».
 */
const el = ref<HTMLElement>()

let observer: IntersectionObserver | null = null

onMounted(() => {
  const node = el.value
  if (!node) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || typeof IntersectionObserver === 'undefined') {
    node.classList.add('is-revealed')
    return
  }

  // Уже в кадре или чуть ниже фолда — показать сразу
  const rect = node.getBoundingClientRect()
  if (rect.top < window.innerHeight + 80 && rect.bottom > 0) {
    node.classList.add('is-revealed')
    return
  }

  node.classList.add('is-pending')

  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      node.classList.add('is-revealed')
      node.classList.remove('is-pending')
      observer?.disconnect()
      observer = null
    },
    {
      // Срабатывает до входа во вьюпорт — к моменту просмотра уже видно
      rootMargin: '0px 0px 20% 0px',
      threshold: 0,
    },
  )

  observer.observe(node)
})

onUnmounted(() => {
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
.scroll-reveal.is-pending {
  opacity: 0;
  transform: translate3d(0, 0.5rem, 0);
}

.scroll-reveal.is-revealed {
  opacity: 1;
  transform: none;
  transition:
    opacity 0.25s ease-out,
    transform 0.25s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .scroll-reveal.is-pending,
  .scroll-reveal.is-revealed {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
