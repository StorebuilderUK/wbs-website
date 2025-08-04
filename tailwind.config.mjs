/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'wbs-blue': '#052b5c',
        'wbs-orange': '#f37021',
        'wbs-gray': '#F5F5F5',
        'wbs-dark': '#333333',
        'wbs-light-gray': '#f8f8f8',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}