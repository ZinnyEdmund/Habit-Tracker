import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './tests/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        mist: '#e2e8f0',
        sea: '#0f766e',
        foam: '#f8fafc',
        sun: '#f59e0b',
      },
    },
  },
  plugins: [],
};

export default config;
