import baseConfig from "./base.config";
import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  ...baseConfig,
  build: {
    outDir: "dist", //输出文件名称
    cssCodeSplit:true,
    lib: {
      entry: resolve(__dirname, "../packages/index.ts"), // 指定组件编译入口文件
      name: "components",
      fileName: (format) => `components.${format}.js`,
    }, //库编译模式配置
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ["vue"],
      output: {
		// entryFileNames: `assets/[name].[hash].js`,
		// chunkFileNames: `assets/[name].[hash].js`,
		// assetFileNames: `assets/[name].[hash].[ext]`,
		// compact: true,
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: "Vue",
        },
      },
    }, // rollup打包配置
  },
  plugins: [...(baseConfig as any).plugins, dts()],
});
