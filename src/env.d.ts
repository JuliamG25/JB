/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly MONGODB_URI?: string;
  readonly PUBLIC_MONGODB_URI?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Extender NodeJS.ProcessEnv para compatibilidad con Vercel
declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB_URI?: string;
  }
}

