/** Design tokens read off the Figma prototype. */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#EAEAEA',
        ink: '#1E1E1E',
        muted: '#6B6B6B',
        ribbon: {
          green: '#0E8A62',
          dark: '#4A4A4A',
          grey: '#9A9A9A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        pad: 'cubic-bezier(.22,1,.36,1)',
      },
    },
  },
  plugins: [],
}
