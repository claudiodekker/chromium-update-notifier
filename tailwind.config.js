const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./popup.html",
    "./options.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        chromiumPrimaryDark: '#202124',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
