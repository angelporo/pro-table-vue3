<template>
  <!-- 查询表单 card -->
  <el-config-provider :locale="langlocale">
    <SearchForm
      v-show="isShowSearch"
      :search="search"
      :reset="reset"
      :loadingVisible="loading || loadingVisible"
      ref="searchRef"
      :columns="searchColumns"
      :search-param="searchParam"
      :search-col="searchCol"
    />

    <!-- 表格内容 card -->
    <div class="no-card pro-table">
      <!-- 表格头部 操作按钮 -->
      <div class="table-header">
        <div class="header-button-lf">
          <!-- selectedList（当前选择的数据）、selectedListIds（当前选择的数据id）、isSelected（当前是否选中的数据） -->
          <slot
            name="tableHeader"
            :selected-list-ids="selectedListIds"
            :selected-list="selectedList"
            :is-selected="isSelected"
          />
        </div>
        <div v-if="toolButton" class="header-button-ri">
          <slot name="toolButton">
            <el-button
              :icon="Refresh"
              circle
              @click="searchRef?.submitSearch"
            />
            <el-button
              v-if="columns.length"
              :icon="Operation"
              circle
              @click="openColSetting"
            />
            <el-button
              v-if="searchColumns.length"
              :icon="Search"
              circle
              @click="isShowSearch = !isShowSearch"
            />
          </slot>
        </div>
      </div>
      <!-- 表格主体 -->
      <el-table
        ref="tableRef"
        v-bind="$attrs"
        :data="data || tableData"
        :border="border"
        :row-key="rowKey"
        v-loading="loading || loadingVisible"
        @selection-change="selectionChange"
      >
        <!-- 默认插槽 -->
        <slot></slot>
        <template v-for="item in tableColumns" :key="item">
          <!-- selection || index || expand -->
          <el-table-column
            v-if="
              item.type && ['selection', 'index', 'expand'].includes(item.type)
            "
            v-bind="item"
            :align="item.align ?? 'center'"
            :reserve-selection="item.type == 'selection'"
          >
            <!-- 实现跨页数据勾选保存：设置 rowKey，每一行设置 reserve-selection -->
            <template v-if="item.type == 'expand'" #default="scope">
              <component :is="item.render" v-bind="scope" v-if="item.render">
              </component>
              <slot v-else :name="item.type" v-bind="scope"></slot>
            </template>
          </el-table-column>
          <!-- other -->

          <TableColumn
            v-if="!item.type && item.prop && item.isShow"
            :column="item"
          >
            <template v-for="slot in Object.keys($slots)" #[slot]="scope">
              <slot :name="slot" v-bind="scope"></slot>
            </template>
          </TableColumn>
        </template>
        <!-- 插入表格最后一行之后的插槽 -->
        <template #append>
          <slot name="append"> </slot>
        </template>
        <!-- 无数据 -->
        <template #empty>
          <div class="table-empty">
            <slot name="empty">
              <img src="@/assets/images/notData.png" alt="notData" />
              <div>暂无数据</div>
            </slot>
          </div>
        </template>
      </el-table>
      <!-- 分页组件 -->
      <slot name="pagination">
        <Pagination
          v-if="pagination"
          :pageable="pageable"
          :handle-size-change="handleSizeChange"
          :handle-current-change="handleCurrentChange"
        />
      </slot>
    </div>
    <!-- 列设置：右侧抽屉组件 -->
    <ColSetting
      v-if="toolButton"
      ref="colRef"
      v-model:col-setting="colSetting"
    />
  </el-config-provider>
</template>

<script setup lang="ts" name="ProTable">
import { ref, computed, nextTick, watch, provide, onMounted } from "vue";
import { ElTable } from "element-plus";
import { useProTable } from "@/hooks/useTable";
import { useSelection } from "@/hooks/useSelection";
import { BreakPoint } from "packages/Grid/interface";
import { isFunction } from "lodash";
import { ColumnProps } from "packages/ProTable/interface";
import { Refresh, Operation, Search } from "@element-plus/icons-vue";
import { handleProp } from "@/utils";
import SearchForm from "packages/SearchForm/index.vue";
import Pagination from "./components/Pagination.vue";
import ColSetting from "./components/ColSetting.vue";
import TableColumn from "./components/TableColumn.vue";
import locale from "element-plus/lib/locale/lang/zh-cn"; //引入element-plus中文包

export interface ProTableProps {
  columns: ColumnProps[]; // 列配置项  ==> 必传
  data?: any[]; // 静态 table data 数据，若存在则不会使用 requestApi 返回的 data ==> 非必传
  requestApi?: (params: any) => Promise<any>; // 请求表格数据的 api ==> 非必传
  requestAuto?: boolean; // 是否自动执行请求 api ==> 非必传（默认为true）
  requestError?: (params: any) => void; // 表格 api 请求错误监听 ==> 非必传
  shouldUpdate?: (newParams, oldParams) => boolean; // 判断搜索表单需要更新逻辑, 返回 true更新 , 使用于更新导致性能卡顿问题
  dataCallback?: (data: any) => any; // 返回数据的回调函数，可以对数据进行处理 ==> 非必传
  title?: string; // 表格标题，目前只在打印的时候用到 ==> 非必传
  pagination?: boolean; // 是否需要分页组件 ==> 非必传（默认为true）
  initParam?: any; // 初始化请求参数 ==> 非必传（默认为{}）
  border?: boolean; // 是否带有纵向边框 ==> 非必传（默认为true）
  loading?: boolean; // 如果外部请求, 传入loading 状态
  toolButton?: boolean; // 是否显示表格功能按钮 ==> 非必传（默认为true）
  rowKey?: string; // 行数据的 Key，用来优化 Table 的渲染，当表格数据多选时，所指定的 id ==> 非必传（默认为 id）
  searchCol?: number | Record<BreakPoint, number>; // 表格搜索项 每列占比配置 ==> 非必传 { xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }
}

// 接受父组件参数，配置默认值
const props = withDefaults(defineProps<ProTableProps>(), {
  columns: () => [],
  requestAuto: true,
  pagination: true,
  initParam: {},
  border: true,
  loading: false,
  toolButton: true,
  rowKey: "id",
  searchCol: () => ({ xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }),
});

// 是否显示搜索模块
const isShowSearch = ref(true);

// 表格 DOM 元素: ProTable 组件内部暴露了 el-table DOM，可通过 proTable.value.element.方法名 调用其方法
const tableRef = ref<InstanceType<typeof ElTable>>();

const langlocale = ref(locale);

// 表格多选 Hooks
const { selectionChange, selectedList, selectedListIds, isSelected } =
  useSelection(props.rowKey);
const searchRef = ref();

// 表格操作 Hooks
const tableProps = useProTable({
  api: props.requestApi,
  initParam: props.initParam,
  isPageable: props.pagination,
  dataCallBack: props.dataCallback,
  requestError: props.requestError,
});
const {
  tableData,
  pageable,
  searchParam,
  searchInitParam,
  getTableList,
  loadingVisible,
  search,
  reset,
  handleSizeChange,
  handleCurrentChange,
} = tableProps;
// 清空选中数据列表
const clearSelection = () => tableRef.value!.clearSelection();
// 初始化请求
onMounted(() => {
  props.requestAuto && getTableList();
});

// 监听页面 initParam 改化，重新获取表格数据
watch(() => props.initParam, getTableList, { deep: true });

// 接收 columns 并设置为响应式
const tableColumns = ref<ColumnProps[]>(props.columns);
console.log(tableColumns.value);

// 定义 enumMap 存储 enum 值（避免异步请求无法格式化单元格内容 || 无法填充搜索下拉选择）
const enumMap = ref(new Map<string, { [key: string]: any }[]>());

provide("enumMap", enumMap);

const setEnumMap = async (col: ColumnProps) => {
  if (!col.enum) return;
  // 如果当前 enum 为后台数据需要请求数据，则调用该请求接口，并存储到 enumMap
  if (typeof col.enum !== "function")
    return enumMap.value.set(col.prop!, col.enum!);
  const { data } = await col.enum();
  enumMap.value.set(col.prop!, data);
};

// 扁平化 columns
const flatColumnsFunc = (
  columns: ColumnProps[],
  flatArr: ColumnProps[] = [],
) => {
  columns.forEach((col, index) => {
    if (col._children?.length) flatArr.push(...flatColumnsFunc(col._children));
    flatArr.push(col);

    //NOTE: 给每一项 column 添加 isShow && isFilterEnum 默认属性
    col.isShow = col.isShow ?? true;
    col.isFilterEnum = col.isFilterEnum ?? true;
    col.isTableSort = col.isTableSort ?? true;
    col.fixed = col.fixed ?? false;
    col.sortIndex = index ?? col.fixed;
    // 设置 enumMap
    setEnumMap(col);
  });
  return flatArr.filter((item) => !item._children?.length);
};

// flatColumns
const flatColumns = ref<ColumnProps[]>();
flatColumns.value = flatColumnsFunc(tableColumns.value);

// 过滤需要搜索的配置项
const searchColumns = ref(
  flatColumns.value.filter?.((item) => item.search?.el || item.search?.render),
);
const initSearchCol = flatColumns.value.filter?.(
  (item) => item.search?.el || item.search?.render,
);

const searchParamsObj = computed(() =>
  JSON.parse(JSON.stringify(searchParam.value)),
);

watch(
  searchParamsObj,
  (searchParam, oldsearchParams) => {
    if (props?.shouldUpdate?.(searchParam, oldsearchParams)) {
      return false;
    }
    let arr = [];
    initSearchCol?.forEach((item) => {
      if (isFunction(item?.columns)) {
        const resultArr = item?.columns({ searchParam: searchParam });
        resultArr?.forEach((n) => {
          arr.push(n);
        });
      }
      arr.push(item);
    });
    searchColumns.value = arr;
  },
  {
    deep: true,
    immediate: true,
  },
);

// 设置搜索表单排序默认值 && 设置搜索表单项的默认值
searchColumns.value.forEach((column, index) => {
  column.search!.order = column.search!.order ?? index + 2;
  if (
    column.search?.defaultValue !== undefined &&
    column.search?.defaultValue !== null
  ) {
    searchInitParam.value[column.search.key ?? handleProp(column.prop!)] =
      column.search?.defaultValue;
    searchParam.value[column.search.key ?? handleProp(column.prop!)] =
      column.search?.defaultValue;
  }
});

// 排序搜索表单项
searchColumns.value.sort((a, b) => a.search!.order! - b.search!.order!);

// 列设置 ==> 过滤掉不需要设置的列
const colRef = ref();
const colSetting = tableColumns.value!.filter(
  (item) =>
    !["selection", "index", "expand"].includes(item.type!) &&
    item.prop !== "operation" &&
    item.isShow,
);

watch(tableColumns, (tableColumns) => {
  console.log("old", tableColumns);
});

const openColSetting = () => colRef.value.openColSetting();

// 暴露给父组件的参数和方法(外部需要什么，都可以从这里暴露出去)
defineExpose({
  element: tableRef,
  tableData,
  pageable,
  searchParam,
  searchInitParam,
  getTableList,
  search,
  reset,
  handleSizeChange,
  handleCurrentChange,
  loadingVisible,
  clearSelection,
  enumMap,
  isSelected,
  selectedList,
  selectedListIds,
});
</script>

<style lang="less">
/* 表格 pagination 样式 */
.el-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* el-table 表格样式 */
.el-table {
  flex: 1;
  /* 修复 safari 浏览器表格错位 https://github.com/HalseySpicy/Geeker-Admin/issues/83 */
  table {
    width: 100%;
  }
  .el-table__header th {
    height: 45px;
    font-size: 15px;
    font-weight: bold;
    color: var(--el-text-color-primary);
    background: var(--el-fill-color-light);
  }
  .el-table__row {
    height: 45px;
    font-size: 14px;
    .el-table__placeholder {
      display: inline;
    }
  }

  /* 设置 el-table 中 header 文字不换行，并省略 */
  .el-table__header .el-table__cell > .cell {
    white-space: nowrap;
  }

  /* 解决表格数据为空时样式不居中问题(仅在element-plus中) */
  .el-table__empty-block {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .table-empty {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      line-height: 30px;
      img {
        width: 60px;
      }
    }
  }

  /* table 中 image 图片样式 */
  .table-image {
    width: 50px;
    height: 50px;
    border-radius: 50%;
  }
}

/* table-search 表格搜索样式 */
.table-search {
  padding: 18px 18px 0;
  margin-bottom: 10px;
  .el-form {
    .el-form-item__content > * {
      width: 100%;
    }

    /* 去除时间选择器上下 padding */
    /* .el-range-editor.el-input__wrapper {
       padding: 0 10px;
       } */
  }
  .operation {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 10px;
  }
}

/* 表格 header 样式 */
.table-header {
  .header-button-lf {
    float: left;
  }
  .header-button-ri {
    float: right;
  }
  .el-button {
    margin-bottom: 15px;
  }
}

/* custom card */
.card {
  box-sizing: border-box;
  padding: 20px;
  overflow-x: hidden;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  box-shadow: 0 0 12px rgb(0 0 0 / 5%);
}

/* ProTable 不需要 card 样式（在组件内使用 ProTable 会使用到） */
.no-card {
  .card {
    padding: 0;
    background-color: transparent;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }
  .table-search {
    padding: 18px 0 0 !important;
    margin-bottom: 0 !important;
  }
}

.pro-table {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
