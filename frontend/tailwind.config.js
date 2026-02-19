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
        // ============================================
        // RICH DARK DESIGN SYSTEM - DUMU WAKS
        // ============================================

        // Primary Background Colors (Mahogany-based)
        mahogany: {
          50: '#f5e6e6',
          100: '#e6cccc',
          200: '#c29999',
          300: '#9e6666',
          400: '#7a3333',
          DEFAULT: '#261212',  // Deep Mahogany - main page sections
          600: '#1d0e0e',
          700: '#140a0a',
          800: '#0b0505',
          900: '#030000',
        },

        // Secondary Background Colors (Iron Charcoal)
        charcoal: {
          50: '#f5f5f5',
          100: '#e0e0e0',
          200: '#b3b3b3',
          300: '#858585',
          400: '#585858',
          DEFAULT: '#1C1C1C',  // Iron Charcoal - cards, nav, footers
          600: '#141414',
          700: '#0d0d0d',
          800: '#060606',
          900: '#000000',
        },

        // Accent 1 - Circuit Blue (Primary)
        circuit: {
          50: '#e6f7fc',
          100: '#cceff9',
          200: '#99dff3',
          300: '#66cfed',
          400: '#33bfe7',
          DEFAULT: '#0090C5',  // Circuit Blue - buttons, links, active states
          600: '#00739e',
          700: '#005677',
          800: '#003950',
          900: '#001c28',
        },

        // Accent 2 - Wrench Purple (Secondary)
        wrench: {
          50: '#f3edf8',
          100: '#e7dbf1',
          200: '#cfb7e3',
          300: '#b793d5',
          400: '#9f6fc7',
          DEFAULT: '#7D4E9F',  // Wrench Purple - hover effects, secondary icons
          600: '#643f7f',
          700: '#4a305f',
          800: '#31203f',
          900: '#18101f',
        },

        // Text Colors
        'bone': {
          DEFAULT: '#E0E0E0',  // Soft Bone - primary text
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e0e0e0',
          300: '#cccccc',
          400: '#b2b2b2',
          500: '#999999',
          600: '#808080',
          700: '#666666',
          800: '#4d4d4d',
          900: '#262626',
        },

        'steel': {
          DEFAULT: '#9BA4B0',  // Steel Grey - meta text, borders
          50: '#f5f6f7',
          100: '#ebedef',
          200: '#d7dade',
          300: '#c3c7cc',
          400: '#aeb3b9',
          500: '#9ba4b0',
          600: '#7d858f',
          700: '#5f666e',
          800: '#41474d',
          900: '#23282c',
        },

        // Semantic Colors (updated with rich dark theme)
        primary: '#0090C5',      // Circuit Blue
        secondary: '#7D4E9F',    // Wrench Purple
        success: '#00ba7c',
        warning: '#f9c74f',
        error: '#f4212e',
        info: '#0090C5',

        // Background hierarchy
        background: {
          DEFAULT: '#261212',  // Deep Mahogany
          primary: '#261212',
          secondary: '#1C1C1C',  // Iron Charcoal
          tertiary: '#161616',
          elevated: '#2a2a2a',
        },

        // Text hierarchy
        text: {
          DEFAULT: '#E0E0E0',  // Soft Bone
          primary: '#E0E0E0',
          secondary: '#9BA4B0',  // Steel Grey
          tertiary: '#7a7a7a',
          muted: '#666666',
        },

        // Border colors
        border: {
          DEFAULT: '#9BA4B0',  // Steel Grey
          subtle: 'rgba(155, 164, 176, 0.3)',
          medium: 'rgba(155, 164, 176, 0.5)',
          strong: '#9BA4B0',
        },

        // Gradient center color
        'mahogany-light': '#3D1E1E',  // For radial gradient centers

        // Legacy colors (for backward compatibility during transition)
        brand: {
          DEFAULT: '#0090C5',  // Changed to Circuit Blue
          hover: '#00739e',
          light: '#66cfed',
        },

        // X/Twitter gray scale (legacy)
        'dw-black': '#261212',
        'dw-dark': '#1C1C1C',
        'dw-medium': '#2f3336',
        'dw-light': '#9BA4B0',
        'dw-white': '#E0E0E0',
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

      // WCAG 2.1 AA Accessibility - Minimum touch targets
      minHeight: {
        'touch': '44px',     // WCAG AA minimum
        'touch-lg': '48px',  // Enhanced touch target
      },
      minWidth: {
        'touch': '44px',     // WCAG AA minimum
        'touch-lg': '48px',  // Enhanced touch target
      },

      borderRadius: {
        '4xl': '2rem',
      },

      backdropBlur: {
        xs: '2px',
      },

      boxShadow: {
        // Glassmorphism shadows
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glass-lg': '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',

        // LED Glow effects (Circuit Blue)
        'led': '0 0 10px rgba(0, 144, 197, 0.5), 0 0 20px rgba(0, 144, 197, 0.3)',
        'led-lg': '0 0 15px rgba(0, 144, 197, 0.6), 0 0 30px rgba(0, 144, 197, 0.4)',
        'led-purple': '0 0 10px rgba(125, 78, 159, 0.5), 0 0 20px rgba(125, 78, 159, 0.3)',

        // Brand shadows (Circuit Blue)
        'brand': '0 4px 16px rgba(0, 144, 197, 0.3)',
        'brand-lg': '0 6px 24px rgba(0, 144, 197, 0.4)',

        // Mahogany-tinted shadows
        'mahogany': '0 4px 16px rgba(38, 18, 18, 0.5)',
        'mahogany-lg': '0 8px 32px rgba(38, 18, 18, 0.6)',
      },

      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'led-flicker': 'ledFlicker 3s ease-in-out infinite',
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
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 144, 197, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 144, 197, 0.8), 0 0 30px rgba(0, 144, 197, 0.4)' },
        },
        ledFlicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },

      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at center, #3D1E1E 0%, #261212 70%)',
        'mahogany-gradient': 'linear-gradient(135deg, #261212 0%, #1C1C1C 100%)',
        'circuit-gradient': 'linear-gradient(90deg, #0090C5 0%, #7D4E9F 100%)',
      },

      transitionTimingFunction: {
        'ease-out-back': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [],
}
