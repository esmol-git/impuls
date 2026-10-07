<script setup lang="ts">
import { site } from '~/data/site'

const { enabled: features } = useSiteFeatures()

useSeoMeta({
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  ogTitle: `${site.name} — ${site.tagline}`,
  ogDescription: site.description,
  ogLocale: 'ru_RU',
})
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
    >
      Перейти к содержимому
    </a>
    <ScrollProgress />
    <AppHeader />
    <main id="main-content" class="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
      <slot />
    </main>
    <AppFooter />
    <ModalRoot />
    <CartDrawer v-if="features.cart" />
    <FavoritesDrawer v-if="features.favorites" />
    <GalleryLightbox />
    <ScrollToTop />
    <StickyMobileCta />
    <CookieBanner />
  </div>
</template>
