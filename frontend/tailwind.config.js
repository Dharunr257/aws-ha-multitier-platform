/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aws: {
          orange: '#FF9900',
          navy: '#0f172a',
          darkBlue: '#0b1329',
          lightBlue: '#1c2541',
          accentBlue: '#00B4D8',
          accentGreen: '#10B981',
          accentRed: '#EF4444'
        },
        slate: {
          850: '#152238',
          950: '#0b0f19'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        aws: '0 0 20px rgba(255, 153, 0, 0.2)'
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
