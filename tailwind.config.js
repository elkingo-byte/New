/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nova: {
          black: '#000000',
          dark: '#0a0a0a',
          card: '#111111',
          border: '#1a1a1a',
          accent: '#e50914',
          'accent-hover': '#f40612',
          gold: '#f5c518',
          text: '#e5e5e5',
          muted: '#808080',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        arabic: ['var(--font-cairo)', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to right, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.2) 100%)',
        'card-gradient': 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 60%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        glow: { '0%': { boxShadow: '0 0 5px #e50914' }, '100%': { boxShadow: '0 0 20px #e50914, 0 0 40px #e50914' } },
      },
    },
  },
  plugins: [],
};
