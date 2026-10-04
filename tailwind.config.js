/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0A0A0A',
          surface: '#121212',
          card: '#181818',
          cardHover: '#202020',
          red: '#F80404',
          orange: '#FF3D00',
          swiss: '#D52B1E',
          primary: '#0B6B4F',
          muted: '#9CA3AF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Unbounded', 'Roboto Condensed', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
      }
    },
  },
  plugins: [],
}
