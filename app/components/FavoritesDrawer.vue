<script setup lang="ts">
import { formatRub } from '~/utils/catalog'
import { orderProgramLabel } from '~/utils/commerce'
import type { FavoriteItem } from '~/composables/useGuestFavorites'

const { open, hide, onAfterLeave } = useFavoritesDrawer()
const { items, isEmpty, remove } = useGuestFavorites()
const { enabled: features } = useSiteFeatures()
const { addLine } = useGuestCart()
const { show: showCart } = useCartDrawer()
const { open: openModal } = useModal()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) hide()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

function toLine(item: FavoriteItem) {
  return {
    mediaId: item.mediaId,
    title: item.title,
    sku: item.sku,
    category: item.category,
    description: item.description,
    imageUrl: item.imageUrl,
    unitPrice: item.unitPrice,
    qty: 1,
  }
}

function addToCart(item: FavoriteItem) {
  addLine(toLine(item))
  hide()
  showCart()
}

function checkoutAll() {
  if (isEmpty.value) return
  const lines = items.value.map(toLine)
  hide()
  openModal('checkout', {
    source: 'favorites',
    program: orderProgramLabel(lines),
    items: lines,
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition
      name="drawer"
      :duration="{ enter: 350, leave: 350 }"
      @after-leave="onAfterLeave"
    >
      <div v-if="open" class="fixed inset-0 z-[70]">
        <div class="drawer-backdrop absolute inset-0 bg-brand-900/50" @click="hide" />

        <aside
          class="drawer-panel absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl safe-top safe-bottom"
          role="dialog"
          aria-modal="true"
          aria-label="Избранное"
        >
          <div class="flex items-center justify-between border-b border-brand-100 px-5 py-4">
            <div>
              <h2 class="text-lg font-bold text-brand-600">Избранное</h2>
              <p class="text-xs text-brand-400">Сохранено в этом браузере</p>
            </div>
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-lg text-brand-400 transition hover:bg-brand-50 hover:text-brand-600"
              aria-label="Закрыть избранное"
              @click="hide"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="isEmpty" class="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-400">
              <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p class="font-semibold text-brand-600">Пока пусто</p>
            <p class="text-sm text-brand-600/60">Добавляйте товары сердечком в каталоге</p>
            <NuxtLink to="/catalog" class="btn-primary mt-2 !px-5 !py-2.5 text-sm" @click="hide">
              В каталог
            </NuxtLink>
          </div>

          <div v-else class="flex min-h-0 flex-1 flex-col">
            <ul class="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              <li
                v-for="item in items"
                :key="item.mediaId"
                class="flex gap-3 rounded-xl border border-brand-100 bg-brand-50/40 p-3"
              >
                <div class="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-100">
                  <img
                    v-if="item.imageUrl"
                    :src="item.imageUrl"
                    :alt="item.title"
                    class="h-full w-full object-cover"
                  >
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-brand-700">{{ item.title }}</p>
                  <p class="mt-0.5 text-sm font-bold text-brand-600">
                    {{ item.unitPrice > 0 ? formatRub(item.unitPrice) : 'Цена по запросу' }}
                  </p>
                  <div class="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      v-if="features.cart"
                      type="button"
                      class="rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-xs font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
                      @click="addToCart(item)"
                    >
                      В корзину
                    </button>
                    <button
                      type="button"
                      class="ml-auto text-xs text-brand-400 transition hover:text-accent-500"
                      @click="remove(item.mediaId)"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </li>
            </ul>

            <div class="space-y-3 border-t border-brand-100 px-5 py-5">
              <button type="button" class="btn-primary w-full py-3" @click="checkoutAll">
                Оформить заявку
              </button>
              <p class="text-center text-xs text-brand-400">
                Отправим состав избранного как заявку
              </p>
            </div>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>
