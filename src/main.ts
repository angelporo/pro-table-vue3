import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import SdComponentsVue3 from 'packages/index';
import locale from 'element-plus/lib/locale/lang/zh-cn' //引入element-plus中文包

createApp(App).use(ElementPlus).use(SdComponentsVue3).use(locale).mount('#app')
