<template>
  <div v-if="columns.length" class="no-card table-search">
    <el-form ref="formRef" :model="searchParam">
      <Grid
        ref="gridRef"
        :collapsed="collapsed"
        :gap="[20, 20]"
        :cols="searchCol"
      >
        <GridItem
          v-for="(item, index) in columns"
          :key="item.prop"
          v-bind="getResponsive(item)"
          :index="index"
        >
          <el-form-item
            :rules="item?.rules"
            :label="`${item.label} :`"
            :prop="item.prop"
            label-width="100px"
          >
            <SearchFormItem :column="item" :search-param="searchParam" />
          </el-form-item>
        </GridItem>
        <GridItem suffix>
          <div class="operation">
            <el-button
              :loading="loadingVisible"
              type="primary"
              @click="submitSearch"
            >
              查询
            </el-button>
            <el-button @click="reset"> 重置 </el-button>
            <el-button
              v-if="showCollapse"
              type="primary"
              link
              class="search-isOpen"
              @click="collapsed = !collapsed"
            >
              {{ collapsed ? "展开" : "合并" }}
              <el-icon class="el-icon--right">
                <component :is="collapsed ? ArrowDown : ArrowUp"></component>
              </el-icon>
            </el-button>
          </div>
        </GridItem>
      </Grid>
    </el-form>
  </div>
</template>

<script setup lang="tsx" name="SearchForm">
import { computed, ref, toRef } from "vue";
import { ElMessage } from "element-plus";
import { ColumnProps } from "../ProTable/interface";
import { BreakPoint } from "../Grid/interface";
import { ArrowDown, ArrowUp } from "@element-plus/icons-vue";
import SearchFormItem from "./components/SearchFormItem.vue";
import Grid from "../Grid/index.vue";
import GridItem from "../Grid/components/GridItem.vue";

interface ProTableProps {
  columns?: ColumnProps[]; // 搜索配置列
  loadingVisible: boolean;
  searchParam?: { [key: string]: any }; // 搜索参数
  searchCol: number | Record<BreakPoint, number>;
  search: (params: any) => void; // 搜索方法
  reset: (params: any) => void; // 重置方法
}
// 默认值
const props = withDefaults(defineProps<ProTableProps>(), {
  columns: () => [],
  loadingVisible: false,
  searchParam: () => ({}),
  search: () => {},
});

// 获取响应式设置
const getResponsive = (item: ColumnProps) => {
  return {
    span: item.search?.span,
    offset: item.search?.offset ?? 0,
    xs: item.search?.xs,
    sm: item.search?.sm,
    md: item.search?.md,
    lg: item.search?.lg,
    xl: item.search?.xl,
  };
};

// 是否默认折叠搜索项
const collapsed = ref(true);

// 获取响应式断点
const gridRef = ref();
const breakPoint = computed<BreakPoint>(() => gridRef.value?.breakPoint);
const formRef = ref();

/**
 * @description  发起请求
 * @default
 * @title
 */
const submitSearch = () => {
  /**
   * @description  已经发起请求后无须再次发起, 强制同步执行
   * @default
   * @title
   */
  if (props.loadingVisible) {
    ElMessage.warning("努力加载中, 请稍后再试...");
    return false;
  }

  props.search(formRef.value);
};

defineExpose({
  submitSearch,
  formEl: formRef,
});

// 判断是否显示 展开/合并 按钮
const showCollapse = computed(() => {
  let show = false;
  props.columns.reduce((prev, current) => {
    prev +=
      (current.search![breakPoint.value]?.span ?? current.search?.span ?? 1) +
      (current.search![breakPoint.value]?.offset ??
        current.search?.offset ??
        0);
    if (typeof props.searchCol !== "number") {
      if (prev >= props.searchCol[breakPoint.value]) show = true;
    } else {
      if (prev >= props.searchCol) show = true;
    }
    return prev;
  }, 0);
  return show;
});
</script>
