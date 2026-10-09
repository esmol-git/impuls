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
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/png', href: '/favicon-32.png', sizes: '32x32' },
        { rel: 'icon', type: 'image/png', href: '/favicon-192.png', sizes: '192x192' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Onest:wght@400;500;600;700&display=swap',
        },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  css: ['~/assets/css/main.css'],

  vite: {
    optimizeDeps: {
      include: ['gsap', 'gsap/ScrollTrigger', '@vuepic/vue-datepicker', 'date-fns', 'date-fns/locale'],
    },
  },

  runtimeConfig: {
    telegramBotToken: '',
    telegramChatId: '',
    apiUrl: process.env.NUXT_API_URL || 'http://localhost:3001',
    public: {
      yandexMapEmbedUrl: '',
    },
  },


  routeRules: {
    // Сайт крутится как Nuxt Node; данные из Nest. Prerender при CI-сборке
    // ходит на 127.0.0.1:3001 без API и запекает пустые каталог/новости/отзывы.
    '/**': { prerender: false },
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
      crawlLinks: false,
      routes: [],
    },
    devProxy: {
      '/uploads': {
        target: 'http://localhost:3001/uploads',
        changeOrigin: true,
      },
    },
  },
})

