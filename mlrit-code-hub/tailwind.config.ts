/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "mlrit-purple": "#8B5CF6",
        "mlrit-purple-dark": "#7C3AED",
        "mlrit-purple-light": "#A78BFA",
        "mlrit-pink": "#EC4899",
        "mlrit-blue": "#3B82F6"
      }
    }
  },
  plugins: [],
};
