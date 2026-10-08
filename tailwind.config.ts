import type { Config } from 'tailwindcss'

export default {
  content: [],
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      colors: {
        brand: {
          50: '#eef2f8',
          100: '#dce4f0',
          200: '#b9c9e1',
          300: '#8aa3c9',
          400: '#5a7aad',
          500: '#3d5d91',
          600: '#253863',
          700: '#1e2d4f',
          800: '#17233d',
          900: '#101929',
        },
        accent: {
          50: '#fdf2f2',
          100: '#fce4e4',
          200: '#f9caca',
          300: '#f2a0a0',
          400: '#d4282a',
          500: '#b0191b',
          600: '#951416',
          700: '#7a1113',
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
