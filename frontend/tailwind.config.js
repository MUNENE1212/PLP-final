/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // X/Twitter Dark Theme Colors
        background: {
          DEFAULT: '#000000',
          secondary: '#16181c',
          tertiary: '#212121',
          elevated: '#272727',
        },
        text: {
          DEFAULT: '#e7e9ea',
          secondary: '#71767b',
          tertiary: '#9ca3af',
        },

        // Dumu Waks Brand Accent (Orange)
        brand: {
          DEFAULT: '#f97316', // orange-500
          hover: '#ea580c',   // orange-600
          light: '#fed7aa',   // orange-200
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },

        // Semantic Colors
        primary: '#f97316',
        success: '#00ba7c',
        warning: '#f9c74f',
        error: '#f4212e',
        info: '#1d9bf0',

        // Light variants for backgrounds
        'success-light': 'rgba(0, 186, 124, 0.15)',
        'warning-light': 'rgba(249, 199, 79, 0.15)',
        'error-light': 'rgba(244, 33, 46, 0.15)',
        'info-light': 'rgba(29, 155, 240, 0.15)',

        // X/Twitter gray scale
        'dw-black': '#000000',
        'dw-dark': '#16181c',
        'dw-medium': '#2f3336',
        'dw-light': '#71767b',
        'dw-white': '#e7e9ea',

        // Border colors (for dark theme)
        'border-subtle': 'rgba(255, 255, 255, 0.08)',
        'border-default': 'rgba(255, 255, 255, 0.12)',
        'border-strong': 'rgba(255, 255, 255, 0.2)',

        // Overlay colors
        'overlay-subtle': 'rgba(0, 0, 0, 0.5)',
        'overlay-medium': 'rgba(0, 0, 0, 0.7)',
        'overlay-strong': 'rgba(0, 0, 0, 0.85)',
      },

      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'monospace'],
        display: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },

      fontSize: {
        // Display
        'display-xl': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        'display-lg': ['40px', { lineHeight: '1.2', fontWeight: '700' }],
        'display-md': ['32px', { lineHeight: '1.2', fontWeight: '700' }],

        // Headings
        'heading-xl': ['24px', { lineHeight: '1.3', fontWeight: '700' }],
        'heading-lg': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-md': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-sm': ['16px', { lineHeight: '1.4', fontWeight: '600' }],

        // Body
        'body-lg': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-md': ['15px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],

        // Meta
        'meta': ['13px', { lineHeight: '1.4', fontWeight: '500' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
        'tiny': ['11px', { lineHeight: '1.4', fontWeight: '500' }],
      },

      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },

      borderRadius: {
        '4xl': '2rem',
      },

      backdropBlur: {
        xs: '2px',
      },

      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glass-lg': '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'brand': '0 4px 16px rgba(249, 115, 22, 0.3)',
        'brand-lg': '0 6px 24px rgba(249, 115, 22, 0.4)',
      },

      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
      },

      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(16px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
      },

      transitionTimingFunction: {
        'ease-out-back': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [],
}
