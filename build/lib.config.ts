import baseConfig from './base.config';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  ...baseConfig,
  plugins: [
    ...(baseConfig as any).plugins,
    dts(),
  ],
  build: {
    outDir: "dist", //输出文件名称
    lib: {
      entry: resolve(__dirname, "../packages/index.ts"), // 指定组件编译入口文件
      name: 'components',
      fileName: (format) => `components.${format}.js`,
    }, //库编译模式配置
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ["vue"],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: "Vue",
        },
      },
    }, // rollup打包配置
  },

});
