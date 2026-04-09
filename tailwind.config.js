/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        btc: {
          DEFAULT: '#F7931A',
          50: '#FFF8EE',
          100: '#FEECD3',
          200: '#FDD5A0',
          500: '#F7931A',
          600: '#E07A05',
          900: '#7A3D00',
        },
        surface: {
          DEFAULT: '#0F0F0F',
          50: '#FAFAFA',
          100: '#F5F5F5',
          800: '#1A1A1A',
          900: '#0F0F0F',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
