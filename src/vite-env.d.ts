/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEMO_MODE?: string
  readonly VITE_JIKAN_BASE?: string
  readonly VITE_CORS_PROXY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export {}
