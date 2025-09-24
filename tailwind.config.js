/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        'glow-card': '0 24px 60px rgba(15, 23, 42, 0.45)',
      },
      colors: {
        midnight: '#030712',
      },
    },
  },
  plugins: [],
};
