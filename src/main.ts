import { createApp } from "vue";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import SdComponentsVue3 from "packages/index";
import locale from "element-plus/dist/locale/zh-cn.mjs"; //引入element-plus中文包

createApp(App).use(ElementPlus, { locale }).use(SdComponentsVue3,{ locale }).mount("#app");
