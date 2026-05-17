/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: '#fbfaf7',
          line: '#ececec',
          hairline: '#f1f1ef',
        },
        ink: {
          DEFAULT: '#0f172a',
          muted: '#64748b',
          subtle: '#94a3b8',
          faint: '#cbd5e1',
        },
        accent: {
          DEFAULT: '#2563eb',
          soft: '#dbeafe',
          ring: 'rgba(37, 99, 235, 0.18)',
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
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 1px rgba(15, 23, 42, 0.02)',
        card: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
        pop: '0 8px 28px rgba(15, 23, 42, 0.10), 0 2px 6px rgba(15, 23, 42, 0.05)',
        ring: '0 0 0 3px rgba(37, 99, 235, 0.18)',
      },
      transitionTimingFunction: {
        snappy: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
