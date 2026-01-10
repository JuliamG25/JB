/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/pages/**/*.{astro,js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in',
        slideUp: 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    // Patrones para asegurar que TODAS las clases de gradiente se incluyan
    {
      pattern: /bg-gradient-to-(r|l|t|b|tr|tl|br|bl)/,
    },
    {
      pattern: /(from|via|to)-(purple|pink|blue|indigo|green|emerald|gray|red|yellow)-(50|100|200|300|400|500|600|700|800|900)/,
    },
    // Clases hover específicas (no se pueden usar patrones con hover:)
    'hover:from-purple-700', 'hover:to-pink-700',
    'hover:from-blue-700', 'hover:to-indigo-700',
    'hover:from-green-700', 'hover:to-emerald-700',
    // Clases específicas que usamos
    'bg-clip-text',
    'text-transparent',
    'rounded-xl', 'rounded-2xl',
    'shadow-lg', 'shadow-xl', 'shadow-2xl',
    'px-6', 'py-3',
    'font-semibold', 'font-bold',
    'text-white', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl',
    'transition-all', 'duration-200',
    'transform', 'hover:scale-105', 'scale-105',
    'flex', 'items-center', 'space-x-2',
    // Otras clases comunes
    'hover:bg-white/20',
    'backdrop-blur-sm',
    'sticky', 'top-0', 'z-50',
  ],
};

