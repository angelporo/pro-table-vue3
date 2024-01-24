import { App, Plugin,provide } from 'vue';
import ProTable from  "packages/ProTable/index.vue"
import { withInstall } from '@/utils/install'

export const ProTablePlugin: Plugin = withInstall(ProTable)
// {
//   install(app: App,options) {
//     app.component("pro-table", ProTable);
//   },
// }


export {ProTable}
