/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        custo: {
          primary: 'var(--primary, #005A63)',
          secondary: 'var(--secondary, #D1ECF1)',
          accent: 'var(--accent, #EA1B23)',
          dark: '#111827',
          light: '#F8FBFC',
          card: '#FFFFFF',
          text: '#1F2937',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 90, 99, 0.12)',
        card: '0 10px 30px rgba(0, 0, 0, 0.08)',
        hover: '0 15px 35px rgba(0, 90, 99, 0.18)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
};
