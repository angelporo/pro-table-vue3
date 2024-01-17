import baseConfig from './base.config';
import { defineConfig } from 'vite';

export default defineConfig({
  ...baseConfig,
  base: '/sd-components-doc',
  build: {
    outDir: 'docs',
  },
});
