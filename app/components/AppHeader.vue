<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { navigation, site } from '~/data/site'
import { lockBodyScroll, unlockBodyScroll } from '~/utils/scrollLock'
import logoUrl from '~/assets/img/logo.png'

const route = useRoute()
const mobileOpen = ref(false)
const { visible } = await useManagedSections()
const { enabled: features } = useSiteFeatures()
const { count: cartCount } = useGuestCart()
const { count: favoritesCount } = useGuestFavorites()
const { show: showCart } = useCartDrawer()
const { show: showFavorites } = useFavoritesDrawer()

const navItems = computed(() =>
  navigation.filter((item) => {
    if (!('section' in item) || !item.section) return true
    return visible.value[item.section]
  }),
)

watch(() => route.path, () => {
  mobileOpen.value = false
})

watch(mobileOpen, (open) => {
  if (open) lockBodyScroll()
})

function closeMenu() {
  mobileOpen.value = false
}

function onDrawerAfterLeave() {
  if (!mobileOpen.value) unlockBodyScroll()
}

function toggleMenu() {
  mobileOpen.value = !mobileOpen.value
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeMenu()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  if (mobileOpen.value) unlockBodyScroll()
})
</script>

<template>
  <header class="app-header scroll-lock-pad fixed inset-x-0 top-0 z-50 safe-top">
    <!-- Top tier: brand + contacts + actions -->
    <div class="app-header__top">
      <div class="container-site flex h-14 items-center justify-between gap-3 sm:h-16">
        <NuxtLink
          to="/"
          class="group flex min-w-0 shrink items-center gap-2.5 sm:gap-3"
          @click="closeMenu"
        >
          <img
            :src="logoUrl"
            alt="ФК Импульс"
            class="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
            width="56"
            height="56"
          >
          <span class="font-brand min-w-0">
            <span class="block truncate text-[13px] font-medium leading-snug tracking-tight text-brand-700 sm:text-sm">
              {{ site.tagline }}
            </span>
            <span class="mt-0.5 block truncate text-[13px] font-medium leading-snug tracking-tight text-brand-700 sm:text-sm">
              {{ site.brandLine }}
            </span>
          </span>
        </NuxtLink>

        <!-- Desktop top actions -->
        <div class="hidden min-w-0 items-center gap-2.5 lg:flex xl:gap-3">
          <SocialLinks size="sm" class="hidden shrink-0 xl:flex" />
          <div class="hidden h-8 w-px shrink-0 bg-brand-100 xl:block" aria-hidden="true" />
          <HeaderPhone variant="bar" />
          <button
            v-if="features.favorites"
            type="button"
            class="header-icon-btn relative shrink-0"
            aria-label="Избранное"
            @click="showFavorites"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span
              v-if="favoritesCount > 0"
              class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white"
            >
              {{ favoritesCount > 99 ? '99+' : favoritesCount }}
            </span>
          </button>
          <button
            v-if="features.cart"
            type="button"
            class="header-icon-btn relative shrink-0"
            aria-label="Корзина"
            @click="showCart"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-2.3 2.3c-.6.6-.2 1.7.7 1.7H17M17 17a1 1 0 100 2 1 1 0 000-2zm-8 0a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
            <span
              v-if="cartCount > 0"
              class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white"
            >
              {{ cartCount > 99 ? '99+' : cartCount }}
            </span>
          </button>
          <ModalTrigger
            type="lead"
            :payload="{ source: 'header' }"
            class="btn-primary shrink-0 !min-h-[42px] !px-5 !py-2.5 text-xs"
          >
            Записаться
          </ModalTrigger>
        </div>

        <!-- Mobile / tablet actions -->
        <div class="flex shrink-0 items-center gap-2 lg:hidden">
          <a
            :href="`tel:${site.phone.replace(/[\s()-]/g, '')}`"
            class="header-icon-btn"
            aria-label="Позвонить"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>
          <button
            v-if="features.favorites"
            type="button"
            class="header-icon-btn relative"
            aria-label="Избранное"
            @click="showFavorites"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span
              v-if="favoritesCount > 0"
              class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white"
            >
              {{ favoritesCount > 99 ? '99+' : favoritesCount }}
            </span>
          </button>
          <button
            v-if="features.cart"
            type="button"
            class="header-icon-btn relative"
            aria-label="Корзина"
            @click="showCart"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-2.3 2.3c-.6.6-.2 1.7.7 1.7H17M17 17a1 1 0 100 2 1 1 0 000-2zm-8 0a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
            <span
              v-if="cartCount > 0"
              class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white"
            >
              {{ cartCount > 99 ? '99+' : cartCount }}
            </span>
          </button>
          <button
            type="button"
            class="header-icon-btn"
            :aria-expanded="mobileOpen"
            aria-label="Меню"
            @click="toggleMenu"
          >
            <svg v-if="!mobileOpen" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom tier: primary navigation (desktop) -->
    <div class="app-header__nav hidden lg:block">
      <div class="container-site">
        <nav class="app-header__nav-list" aria-label="Основное меню">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="app-header__nav-link"
            active-class="is-active"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </div>
    </div>
  </header>

  <!-- Mobile drawer -->
  <Teleport to="body">
    <Transition
      name="drawer"
      :duration="{ enter: 350, leave: 350 }"
      @after-leave="onDrawerAfterLeave"
    >
      <div v-if="mobileOpen" class="fixed inset-0 z-[60] lg:hidden">
        <div class="drawer-backdrop absolute inset-0 bg-brand-900/50" @click="closeMenu" />

        <nav class="drawer-panel absolute right-0 top-0 flex h-full w-full max-w-xs flex-col bg-white shadow-2xl safe-top safe-bottom sm:max-w-sm">
          <div class="flex items-center justify-between border-b border-brand-100 px-5 py-4">
            <span class="font-bold text-brand-600">Меню</span>
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-lg text-brand-400 hover:bg-brand-50 hover:text-brand-600"
              aria-label="Закрыть меню"
              @click="closeMenu"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-3 py-4">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="block rounded-xl px-4 py-3.5 text-base font-medium text-brand-600 transition active:bg-brand-50"
              active-class="!text-accent-500 bg-accent-50 font-semibold"
              @click="closeMenu"
            >
              {{ item.label }}
            </NuxtLink>
          </div>

          <div class="space-y-3 border-t border-brand-100 px-5 py-5">
            <SocialLinks size="sm" class="justify-center" />
            <HeaderPhone variant="card" />
            <ModalTrigger
              type="lead"
              :payload="{ source: 'header-mobile' }"
              class="btn-primary w-full py-3"
              @click="closeMenu"
            >
              Записаться
            </ModalTrigger>
          </div>
        </nav>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.app-header {
  border-bottom: 1px solid rgb(226 232 240 / 0.9);
  background: rgb(255 255 255 / 0.96);
  box-shadow: 0 1px 0 rgb(15 23 42 / 0.03), 0 8px 24px rgb(15 23 42 / 0.04);
  backdrop-filter: blur(12px);
}

.app-header__top {
  background: linear-gradient(180deg, #fff 0%, rgb(248 250 252 / 0.55) 100%);
}

.app-header__nav {
  border-top: 1px solid rgb(226 232 240 / 0.85);
  background: rgb(248 250 252 / 0.72);
}

.app-header__nav-list {
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 0.25rem;
}

.app-header__nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0.65rem 1.15rem;
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: rgb(30 58 95 / 0.78);
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.app-header__nav-link::after {
  content: '';
  position: absolute;
  right: 1rem;
  bottom: 0;
  left: 1rem;
  height: 2px;
  border-radius: 999px;
  background: transparent;
  transition: background 0.15s ease;
}

.app-header__nav-link:hover {
  color: rgb(30 58 95);
  background: rgb(255 255 255 / 0.7);
}

.app-header__nav-link.is-active {
  color: #b0191b;
}

.app-header__nav-link.is-active::after {
  background: #b0191b;
}

.header-icon-btn {
  display: inline-flex;
  height: 2.5rem;
  width: 2.5rem;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(226 232 240);
  border-radius: 0.5rem;
  background: #fff;
  color: rgb(30 58 95);
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.header-icon-btn:hover {
  border-color: rgb(203 213 225);
  background: rgb(248 250 252);
}
</style>
