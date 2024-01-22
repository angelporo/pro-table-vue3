import { App, Plugin,provide } from 'vue';
import ProTable from  "packages/ProTable/index.vue"

export const ProTablePlugin: Plugin = {
  install(app: App,options) {
    if (options) {
      // provideGlobalConfig(options, app, true)
    }
    app.component("pro-table", ProTable);
  },
};

export {ProTable}
