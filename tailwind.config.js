/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#FAF8F5',
          dark: '#1A1A1A',
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#303030',
        },
        border: {
          DEFAULT: '#E7E5E4',
          dark: '#404040',
        },
        header: '#292524',
        subdued: {
          DEFAULT: '#616161',
          dark: '#8C8C8C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
