import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        telon: '#FFFFFF',
        'telon-alto': '#EFF6FF',
        marquesina: '#1D4ED8',
        cielo: '#0EA5E9',
        terciopelo: '#DC2626',
        crema: '#1E293B',
        opaco: '#64748B',
      },
      fontFamily: {
        marquesina: ['var(--font-display)', 'sans-serif'],
        cuerpo: ['var(--font-body)', 'sans-serif'],
      },
      keyframes: {
        'pasarela-izq': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pasarela-der': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        parpadeo: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        'pasarela-izq': 'pasarela-izq 45s linear infinite',
        'pasarela-der': 'pasarela-der 55s linear infinite',
        parpadeo: 'parpadeo 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
