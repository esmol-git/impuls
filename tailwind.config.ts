import type { Config } from 'tailwindcss'

/**
 * Цвета через CSS-переменные (каналы R G B).
 * html.dark переопределяет переменные → все text-brand-* / bg-accent-*
 * сразу становятся читаемыми без сотен оверрайдов.
 */
export default {
  content: [],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      colors: {
        brand: {
          50: 'rgb(var(--c-brand-50) / <alpha-value>)',
          100: 'rgb(var(--c-brand-100) / <alpha-value>)',
          200: 'rgb(var(--c-brand-200) / <alpha-value>)',
          300: 'rgb(var(--c-brand-300) / <alpha-value>)',
          400: 'rgb(var(--c-brand-400) / <alpha-value>)',
          500: 'rgb(var(--c-brand-500) / <alpha-value>)',
          600: 'rgb(var(--c-brand-600) / <alpha-value>)',
          700: 'rgb(var(--c-brand-700) / <alpha-value>)',
          800: 'rgb(var(--c-brand-800) / <alpha-value>)',
          900: 'rgb(var(--c-brand-900) / <alpha-value>)',
        },
        accent: {
          50: 'rgb(var(--c-accent-50) / <alpha-value>)',
          100: 'rgb(var(--c-accent-100) / <alpha-value>)',
          200: 'rgb(var(--c-accent-200) / <alpha-value>)',
          300: 'rgb(var(--c-accent-300) / <alpha-value>)',
          400: 'rgb(var(--c-accent-400) / <alpha-value>)',
          500: 'rgb(var(--c-accent-500) / <alpha-value>)',
          600: 'rgb(var(--c-accent-600) / <alpha-value>)',
          700: 'rgb(var(--c-accent-700) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        brand: ['Onest', 'Manrope', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        site: '1280px',
      },
      spacing: {
        header: '3.5rem',
        'header-sm': '4rem',
        'header-lg': '6.75rem',
      },
      backgroundImage: {
        'hero-light': 'linear-gradient(135deg, #eef2f8 0%, #ffffff 50%, #fdf2f2 100%)',
        'hero-blue': 'radial-gradient(ellipse at 70% 20%, rgba(37, 56, 99, 0.06) 0%, transparent 60%)',
        'hero-polygons': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='140' viewBox='0 0 160 140'%3E%3Cg fill='%23dce4f0' fill-opacity='0.55'%3E%3Cpath d='M0 70 L40 0 L80 70 Z'/%3E%3Cpath d='M80 70 L120 0 L160 70 Z'/%3E%3Cpath d='M0 140 L40 70 L80 140 Z'/%3E%3Cpath d='M80 140 L120 70 L160 140 Z'/%3E%3C/g%3E%3C/svg%3E")`,
      },
      boxShadow: {
        card: '0 4px 24px rgba(37, 56, 99, 0.08)',
        header: '0 1px 12px rgba(37, 56, 99, 0.06)',
      },
    },
  },
  plugins: [],
} satisfies Config
