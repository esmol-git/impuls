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
    description: 'Детская футбольная школа. Бесплатное пробное занятие для каждого ребёнка.',
    defaultLocale: 'ru',
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      ],
      // Синхронно до CSS — иначе system+OS dark даёт тёмный фон без html.dark.
      script: [
        {
          src: '/theme-boot.js',
          key: 'impuls-theme-boot',
          tagPriority: 'critical',
          tagPosition: 'head',
        },
        {
          src: '/boot-overlay.js',
          key: 'impuls-boot-overlay',
          tagPriority: 'critical',
          tagPosition: 'bodyOpen',
        },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/png', href: '/favicon-32.png', sizes: '32x32' },
        { rel: 'icon', type: 'image/png', href: '/favicon-192.png', sizes: '192x192' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        {
          rel: 'stylesheet',
          href: '/boot-overlay.css',
          key: 'impuls-boot-css',
          tagPriority: 'critical',
        },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Onest:wght@400;500;600;700&display=swap',
        },
      ],
    },
    // Короткий fade без out-in — внутренние переходы не «тормозят»
    pageTransition: { name: 'page' },
  },

  css: ['~/assets/css/main.css'],

  vite: {
    optimizeDeps: {
      include: ['@vuepic/vue-datepicker', 'date-fns', 'date-fns/locale'],
    },
  },

  image: {
    // /uploads проксируется на Nest — IPX их не ресайзит; NuxtImg ок для локальных assets
    domains: [],
    alias: {
      uploads: '/uploads',
    },
  },

  runtimeConfig: {
    telegramBotToken: '',
    telegramChatId: '',
    apiUrl: process.env.NUXT_API_URL || 'http://localhost:3001',
    public: {
      /** Ключ JS API: https://developer.tech.yandex.ru/ */
      yandexMapsApiKey: process.env.NUXT_PUBLIC_YANDEX_MAPS_API_KEY || '',
    },
  },


  routeRules: {
    // Сайт крутится как Nuxt Node; данные из Nest. Prerender при CI-сборке
    // ходит на 127.0.0.1:3001 без API и запекает пустые каталог/новости/отзывы.
    '/**': {
      prerender: false,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
    },
    '/api/**': { prerender: false },
  },

  // Runtime OG/schemaOrg-модули тянут лишние peer-deps; meta + JSON-LD вручную
  ogImage: {
    enabled: false,
  },

  schemaOrg: {
    enabled: false,
  },

  seo: {
    // charset / og:type уже ставят Nuxt и nuxt-seo-utils — не дублируем в app.head
    validateAppHead: false,
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

