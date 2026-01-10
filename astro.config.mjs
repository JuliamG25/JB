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
    },
    ssr: {
      noExternal: ['mongoose'],
    },
  },
});

