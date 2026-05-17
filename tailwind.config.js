/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blueprint: {
          bg: '#f7f5ef',
          line: '#d8d2c2',
          ink: '#2a2a2a',
          accent: '#3b82f6',
        },
        cat: {
          plumbing: '#3b82f6',
          electrical: '#f59e0b',
          paint: '#ec4899',
          structural: '#6b7280',
          decor: '#8b5cf6',
          furniture: '#10b981',
          general: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(20, 20, 20, 0.08), 0 1px 2px rgba(20, 20, 20, 0.04)',
        pop: '0 8px 24px rgba(20, 20, 20, 0.12), 0 2px 6px rgba(20, 20, 20, 0.06)',
      },
    },
  },
  plugins: [],
}
