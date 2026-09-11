/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 后端基地址 */
  readonly VITE_API_BASE: string;
  /** 是否启用 mock：'true' | 'false' */
  readonly VITE_USE_MOCK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
