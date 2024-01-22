import { App, Plugin } from 'vue';
import ProTable from  "packages/ProTable/index.vue"


export const ProTablePlugin: Plugin = {
  install(app: App) {
    app.component("pro-table", ProTable);
  },
};

export {ProTable}
