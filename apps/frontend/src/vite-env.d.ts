/// <reference types="vite/client" />

declare module 'react-dom/client' {
  import { createRoot } from 'react-dom/client';
  export { createRoot };
}

declare module 'uuid' {
  const uuid: unknown;
  export default uuid;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.wav' {
  const src: string;
  export default src;
}

declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_APP_BACKEND_URL: string;
  readonly VITE_APP_WS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
