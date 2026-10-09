<script setup lang="ts">
import type { GalleryItem } from '~/types'

const props = withDefaults(
  defineProps<{
    items: GalleryItem[]
    /** Сколько карточек показать сразу; остальное — по приближению к низу */
    initialCount?: number
    batchSize?: number
  }>(),
  {
    initialCount: undefined,
    batchSize: 12,
  },
)

const { open } = useLightbox()

const visibleCount = ref(
  props.initialCount != null
    ? Math.min(props.initialCount, props.items.length)
    : props.items.length,
)

const visibleItems = computed(() => props.items.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < props.items.length)

const sentinel = ref<HTMLElement | null>(null)

watch(
  () => props.items.length,
  (len) => {
    if (props.initialCount == null) {
      visibleCount.value = len
      return
    }
    visibleCount.value = Math.min(Math.max(visibleCount.value, props.initialCount), len)
  },
)

function openAt(index: number) {
  open(index, props.items)
}

function revealMore() {
  if (!hasMore.value) return
  visibleCount.value = Math.min(visibleCount.value + props.batchSize, props.items.length)
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  if (props.initialCount == null || !import.meta.client) return
  const el = sentinel.value
  if (!el || typeof IntersectionObserver === 'undefined') return

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) revealMore()
    },
    { rootMargin: '240px 0px' },
  )
  observer.observe(el)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div>
    <ul class="mt-8 grid list-none grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">
      <li v-for="(item, index) in visibleItems" :key="item.id">
        <button
          type="button"
          class="group relative w-full overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2"
          :aria-label="`Открыть ${item.alt}`"
          @click="openAt(index)"
        >
          <UiSkeletonImage aspect="square">
            <!-- Обычный img: /uploads проксируется на Nest; NuxtImg/IPX файлы там не находит -->
            <img
              v-if="item.src"
              :src="item.src"
              :alt="item.alt"
              class="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
              loading="lazy"
              decoding="async"
            >
            <div v-else class="absolute inset-0 flex items-center justify-center">
              <svg
                class="h-8 w-8 text-brand-300 transition group-hover:text-brand-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </UiSkeletonImage>
          <div
            class="absolute inset-0 bg-brand-900/0 transition group-hover:bg-brand-900/10"
            aria-hidden="true"
          />
        </button>
      </li>
    </ul>

    <div
      v-if="initialCount != null && hasMore"
      ref="sentinel"
      class="mt-6 flex justify-center"
      aria-hidden="true"
    >
      <span class="h-1 w-1 opacity-0" />
    </div>
  </div>
</template>
