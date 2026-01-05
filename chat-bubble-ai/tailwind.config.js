/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#137fec',
          hover: '#0d6edb',
        },
        'background-light': '#f6f7f8',
        'background-dark': '#101922',
        'surface-light': '#ffffff',
        'surface-dark': '#283039',
        'border-light': '#e2e8f0',
        'border-dark': '#283039',
        'text-secondary': '#9dabb9',
        'text-tertiary': '#6b7a8a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce': 'bounce 1.4s infinite',
      },
    },
  },
  plugins: [],
}
