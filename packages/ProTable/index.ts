import { App, Plugin } from 'vue';
import ProTable from  "./index.vue"


export const ProTablePlugin: Plugin = {
  install(app: App) {
    app.component('sd-protable', ProTable);
  },
};

export {ProTable}
