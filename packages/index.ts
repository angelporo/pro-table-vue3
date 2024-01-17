/* eslint-disable */
/**
 * !--------- FBI WARNING ----------!
 *
 * 根据 /packages 目录下的组件所生成的模块导出，请勿手动修改
 */
import { App, Plugin } from 'vue';
import {ProTablePlugin} from "packages/ProTable";

// import SearchForm from "./SearchForm/index.vue";
// import Grid from "./Grid/index.vue";

const SdVue3Components: Plugin<any[]> = {
  install(app: App) {
    ProTablePlugin.install?.(app);
  },
};

export default SdVue3Components;
export * from "./ProTable";
export * from "@/hooks/useTable";
export * from "@/hooks/useSelection"
