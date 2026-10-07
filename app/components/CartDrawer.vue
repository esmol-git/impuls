<script setup lang="ts">
import { formatRub } from '~/utils/catalog'
import { cartLineTotal, orderProgramLabel } from '~/utils/commerce'

const { open, hide, onAfterLeave } = useCartDrawer()
const { lines, totalLabel, isEmpty, setQty, remove } = useGuestCart()
const { open: openModal } = useModal()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) hide()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

function checkout() {
  if (isEmpty.value) return
  const items = lines.value.map((line) => ({ ...line }))
  hide()
  openModal('checkout', {
    source: 'cart',
    program: orderProgramLabel(items),
    items,
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
          aria-label="Корзина"
        >
          <div class="flex items-center justify-between border-b border-brand-100 px-5 py-4">
            <div>
              <h2 class="text-lg font-bold text-brand-600">Корзина</h2>
              <p class="text-xs text-brand-400">Без регистрации — оформите заявку</p>
            </div>
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-lg text-brand-400 transition hover:bg-brand-50 hover:text-brand-600"
              aria-label="Закрыть корзину"
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-2.3 2.3c-.6.6-.2 1.7.7 1.7H17M17 17a1 1 0 100 2 1 1 0 000-2zm-8 0a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
            </div>
            <p class="font-semibold text-brand-600">Корзина пуста</p>
            <p class="text-sm text-brand-600/60">Добавьте товары из каталога</p>
            <NuxtLink to="/catalog" class="btn-primary mt-2 !px-5 !py-2.5 text-sm" @click="hide">
              В каталог
            </NuxtLink>
          </div>

          <div v-else class="flex min-h-0 flex-1 flex-col">
            <ul class="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              <li
                v-for="line in lines"
                :key="line.mediaId"
                class="flex gap-3 rounded-xl border border-brand-100 bg-brand-50/40 p-3"
              >
                <div class="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-100">
                  <img
                    v-if="line.imageUrl"
                    :src="line.imageUrl"
                    :alt="line.title"
                    class="h-full w-full object-cover"
                  >
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-brand-700">{{ line.title }}</p>
                  <p v-if="line.sku" class="mt-0.5 text-xs text-brand-400">арт. {{ line.sku }}</p>
                  <p class="mt-0.5 text-sm font-bold text-brand-600">
                    {{ formatRub(cartLineTotal(line)) }}
                  </p>
                  <div class="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      class="cart-qty-btn"
                      aria-label="Уменьшить"
                      @click="setQty(line.mediaId, line.qty - 1)"
                    >
                      −
                    </button>
                    <span class="w-6 text-center text-sm font-semibold text-brand-700">{{ line.qty }}</span>
                    <button
                      type="button"
                      class="cart-qty-btn"
                      aria-label="Увеличить"
                      @click="setQty(line.mediaId, line.qty + 1)"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      class="ml-auto text-xs text-brand-400 transition hover:text-accent-500"
                      @click="remove(line.mediaId)"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </li>
            </ul>

            <div class="space-y-3 border-t border-brand-100 px-5 py-5">
              <div class="flex items-baseline justify-between">
                <span class="text-sm text-brand-600/70">Итого</span>
                <span class="text-xl font-extrabold text-brand-700">{{ totalLabel }}</span>
              </div>
              <button type="button" class="btn-primary w-full py-3" @click="checkout">
                Оформить заявку
              </button>
              <p class="text-center text-xs text-brand-400">
                Пока заявкой — позже полноценный заказ без регистрации
              </p>
            </div>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cart-qty-btn {
  @apply flex h-8 w-8 items-center justify-center rounded-lg border border-brand-200 bg-white text-base font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50;
}
</style>
