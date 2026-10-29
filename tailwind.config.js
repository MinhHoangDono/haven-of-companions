/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#fbf9f5',
          100: '#f5f0e6',
          200: '#ede2d1',
          800: '#342c22',
          900: '#1d1711',
        },
        ink: {
          900: '#121418',
          800: '#1e2229',
          700: '#2b313a',
          400: '#6b7687',
        },
        fantasy: {
          gold: '#dfa642',
          ember: '#d9532f',
          druid: '#3e8452',
          paladin: '#396ca8',
          bard: '#964ea4',
          sorcerer: '#c93b3b',
        }
      },
      fontFamily: {
        serif: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
