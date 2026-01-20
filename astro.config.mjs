import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
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
  adapter: vercel({
    // Configuración para serverless functions
    functionPerRoute: false,
  }),
  vite: {
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['mongoose', 'mongodb', 'bson'],
    },
    ssr: {
      // Hacer mongoose y sus dependencias externas para evitar problemas de empaquetado ESM
      // El adaptador de Vercel las incluirá desde node_modules en runtime
      external: ['mongoose', 'mongodb', 'bson'],
    },
  },
});

