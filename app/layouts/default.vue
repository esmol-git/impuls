<script setup lang="ts">
import { site } from '~/data/site'

const { enabled: features } = await useSiteFeatures()
const { phone, email, hasPhone, hasEmail } = await useSiteContacts()
const siteConfig = useSiteConfig()
const siteUrl = computed(() => String(siteConfig.url || '').replace(/\/$/, ''))

usePageSeo(`${site.name} — ${site.tagline}`, site.description)

useHead(() => ({
  script: [
    {
      key: 'ld-org',
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            name: site.name,
            url: siteUrl.value || undefined,
            logo: siteUrl.value ? `${siteUrl.value}/img/logo.png` : '/img/logo.png',
          },
          {
            '@type': 'SportsActivityLocation',
            name: `${site.name} — ${site.tagline}`,
            description: site.description,
            url: siteUrl.value || undefined,
            ...(hasPhone.value ? { telephone: phone.value } : {}),
            ...(hasEmail.value ? { email: email.value } : {}),
            image: siteUrl.value ? `${siteUrl.value}/img/logo.png` : '/img/logo.png',
            address: {
              '@type': 'PostalAddress',
              addressLocality: site.city,
              addressCountry: 'RU',
            },
          },
        ],
      }),
    },
  ],
}))
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
