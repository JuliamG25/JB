import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(), 
    tailwind({
      applyBaseStyles: true,
    })
  ],
  output: 'server',
  adapter: vercel(),
  vite: {
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['mongoose'],
    },
    ssr: {
      // Hacer mongoose externo para evitar que esbuild lo procese
      // En Vercel serverless, mongoose estará disponible en node_modules
      external: ['mongoose'],
    },
  },
});

