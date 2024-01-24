import { computed, getCurrentInstance, inject, provide, ref, unref } from 'vue'
import type { InjectionKey, Ref } from 'vue'
import type { ConfigProviderProps,Language } from 'element-plus'

export type ConfigProviderContext = Partial<ConfigProviderProps>

const globalConfig = ref<ConfigProviderContext>()
export const configProviderContextKey: InjectionKey<
  Ref<ConfigProviderContext>
> = Symbol()

export const localeContextKey: InjectionKey<Ref<Language | undefined>> =
  Symbol('localeContextKey')



export function useGlobalConfig<
  K extends keyof ConfigProviderContext,
  D extends ConfigProviderContext[K]
>(
  key: K,
  defaultValue?: D
): Ref<Exclude<ConfigProviderContext[K], undefined> | D>

export function useGlobalConfig(): Ref<ConfigProviderContext>


export function useGlobalConfig(
  key?: keyof ConfigProviderContext,
  defaultValue = undefined
) {
  const config = getCurrentInstance()
    ? inject(configProviderContextKey, globalConfig)
    : globalConfig
  if (key) {
    return computed(() => config.value?.[key] ?? defaultValue)
  } else {
    return config
  }
}

export const provideGlobalConfig = (
  config: MaybeRef<ConfigProviderContext>,
  app?: App,
  global = false
) => {
  const inSetup = !!getCurrentInstance()
  const oldConfig = inSetup ? useGlobalConfig() : undefined

  const provideFn = app?.provide ?? (inSetup ? provide : undefined)
  if (!provideFn) {
    debugWarn(
      'provideGlobalConfig',
      'provideGlobalConfig() can only be used inside setup().'
    )
    return
  }
  console.log("config",config)
  const context = computed(() => {
    const cfg = unref(config)
    if (!oldConfig?.value) return cfg
    return mergeConfig(oldConfig.value, cfg)
  })
  provideFn(configProviderContextKey, context)
  provideFn(
    localeContextKey,
    computed(() => context.value.locale)
  )

  if (global || !globalConfig.value) {
    globalConfig.value = context.value
  }
  return context
}

