/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070C18',
          900: '#0B1120', // Background
          850: '#0F172A',
          800: '#111827', // Sidebar
          700: '#172033', // Cards
          600: '#1E293B',
          500: '#334155',
        },
        brand: {
          primary: '#6366F1',   // Indigo
          secondary: '#22D3EE', // Cyan
          success: '#10B981',   // Emerald
          warning: '#F59E0B',   // Amber
          danger: '#EF4444',    // Rose
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
