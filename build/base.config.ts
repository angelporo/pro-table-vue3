import { resolve } from 'path';
import { defineConfig } from 'vite';
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx'
import Markdown from 'vite-plugin-md';

// 文档: https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      "packages": resolve(__dirname, '../packages'),
    },
  },
  // test: {
  //   environment: "happy-dom",
  //   deps: {
  //     inline: ['element-plus']
  //   }
  // },
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    vueJsx(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    Markdown(),
  ],
});
