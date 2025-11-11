import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f2f9',
          100: '#c2d9ec',
          200: '#9dbfdf',
          300: '#78a6d2',
          400: '#4f8cc2',
          500: '#00457c',
          600: '#003b68',
          700: '#003056',
          800: '#002543',
          900: '#001b31'
        },
        secondary: {
          50: '#fff2e8',
          100: '#ffd9c2',
          200: '#ffb383',
          300: '#ff8c45',
          400: '#ff751f',
          500: '#f36f21',
          600: '#d8611d',
          700: '#b75019',
          800: '#944015',
          900: '#743210'
        },
        accent: {
          50: '#e6f8fe',
          100: '#c0ecfb',
          200: '#99dff9',
          300: '#73d2f6',
          400: '#4ac4f3',
          500: '#00aeef',
          600: '#0098d1',
          700: '#007fae',
          800: '#00678c',
          900: '#004a63'
        }
      }
    }
  },
  plugins: []
};

export default config;
