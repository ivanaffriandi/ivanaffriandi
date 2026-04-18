/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          black: '#000000',
          white: '#FFFFFF',
          blood: '#FF0000',
        }
      },
      fontFamily: {
        brutal: ['Anton', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      animation: {
        'glitch': 'glitch 0.2s cubic-bezier(.25, .46, .45, .94) both infinite',
        'flicker': 'flicker 3s linear infinite',
      },
      keyframes: {
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 1px)' },
          '40%': { transform: 'translate(-1px, -1px)' },
          '60%': { transform: 'translate(2px, 1px)' },
          '80%': { transform: 'translate(1px, -1px)' },
          '100%': { transform: 'translate(0)' },
        },
        flicker: {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': {
            opacity: 1,
            color: '#FFFFFF'
          },
          '20%, 24%, 55%': {
            opacity: 0.8,
            color: '#FF0000'
          }
        }
      }
    },
  },
  plugins: [],
}
