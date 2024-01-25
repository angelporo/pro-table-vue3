import { defineComponent, renderSlot, watch } from 'vue'
import { provideGlobalConfig } from 'packages/hooks/useGlobalConfig'

import type { MessageConfigContext } from '@element-plus/components/message'
export const definePropType = <T>(val: any): PropType<T> => val
export const configProviderProps = {

  /**
   * @description Locale Object
   */
  locale: {
    type: definePropType<Language>(Object),
  },
  /**
   * @description global component size
   */
  size: Number,
  /**
   * @description button related configuration, [see the following table](#button-attributes)
   */
  button: {
    type: definePropType<ButtonConfigContext>(Object),
  },
  /**
   * @description message related configuration, [see the following table](#message-attributes)
   */
  message: {
    type: definePropType<MessageConfigContext>(Object),
  },
  /**
   * @description global Initial zIndex
   */
  zIndex: Number,
  /**
   * @description global component className prefix (cooperated with [$namespace](https://github.com/element-plus/element-plus/blob/dev/packages/theme-chalk/src/mixins/config.scss#L1)) | ^[string]
   */
  namespace: {
    type: String,
    default: 'el',
  },
}


export const messageConfig: MessageConfigContext = {}

export const ConfigProvider = defineComponent({
  name: 'ElConfigProvider',
  props: configProviderProps,

  setup(props, { slots }) {
    watch(
      () => props.message,
      (val) => {
        Object.assign(messageConfig, val ?? {})
      },
      { immediate: true, deep: true }
    )
    const config = provideGlobalConfig(props)
    return () => renderSlot(slots, 'default', { config: config?.value })
  },
})
export type ConfigProviderInstance = InstanceType<typeof ConfigProvider>

export default ConfigProvider
