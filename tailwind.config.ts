import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50:  '#FFF8F0',
          100: '#FFE8C8',
          200: '#FFD09A',
          300: '#FFAD5C',
          400: '#F27830',
          500: '#D95C00',
          600: '#A84400',
          700: '#7A3000',
          800: '#501F00',
          900: '#2C1100',
        },
        gold: {
          50:  '#FFFBEB',
          100: '#FDF3DC',
          200: '#F9E5A0',
          300: '#F0C040',
          400: '#E8A820',
          500: '#C9880D',
          600: '#A06A06',
          700: '#7A4F03',
          800: '#543601',
          900: '#332100',
        },
        maroon: {
          50:  '#FFF1F1',
          100: '#FFD6D6',
          200: '#FF9999',
          300: '#FF5555',
          400: '#CC2222',
          500: '#8B1A1A',
          600: '#6B1212',
          700: '#4E0C0C',
          800: '#340808',
          900: '#1E0404',
        },
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
