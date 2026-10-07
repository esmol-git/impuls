// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  typescript: {
    shim: false,
  },

  experimental: {
    typescriptPlugin: true,
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/seo',
    '@nuxt/image',
  ],

  site: {
    url: process.env.NUXT_SITE_URL || 'https://impuls.esmolakov.ru',
    name: 'ФК «Импульс» — детская футбольная школа',
    description: 'Детская футбольная школа. Текст описания будет добавлен позже.',
    defaultLocale: 'ru',
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap',
        },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    telegramBotToken: '',
    telegramChatId: '',
    apiUrl: process.env.NUXT_API_URL || 'http://localhost:3001',
    public: {
      yandexMapEmbedUrl: '',
    },
  },


  routeRules: {
    '/api/**': { prerender: false },
  },

  ogImage: {
    enabled: false,
  },

  schemaOrg: {
    enabled: false,
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: false,
      routes: ['/', '/news', '/catalog', '/about', '/coaches', '/programs'],
    },
    devProxy: {
      '/uploads': {
        target: 'http://localhost:3001/uploads',
        changeOrigin: true,
      },
    },
  },
})

