import { Table } from "./interface";
import { FormInstance, ElMessage } from "element-plus";
import { reactive, computed, toRefs } from "vue";

type useTableProps = {
  api?: (params: any) => Promise<any>;
  initParam: {};
  isPageable: boolean;
  dataCallBack?: (data: any) => any;
  requestError?: (error: any) => void;
};

/**
 * @description table 页面操作方法封装
 * @param {Function} api 获取表格数据 api 方法 (必传)
 * @param {Object} initParam 获取数据初始化参数 (非必传，默认为{})
 * @param {Boolean} isPageable 是否有分页 (非必传，默认为true)
 * @param {Function} dataCallBack 对后台返回的数据进行处理的方法 (非必传)
 * */
export const useProTable = (options: useTableProps) => {
  const {
    api,
    initParam,
    isPageable = true,
    dataCallBack,
    requestError,
  } = options;

  const state = reactive<Table.StateProps>({
    // 表格数据
    tableData: [],
    // 分页数据
    pageable: {
      // 当前页数
      current: 1,
      // 每页显示条数
      size: 10,
      // 总条数
      total: 0,
    },
    // 查询参数(只包括查询)
    searchParam: {},
    // 初始化默认的查询参数
    searchInitParam: {},
    // 总参数(包含分页和查询参数)
    totalParam: {},
    loadingVisible: false,
    searchRef: {
      submitSearch: () => {},
      formEl: null,
    },
  });

  /**
   * @description 分页查询参数(只包括分页和表格字段排序,其他排序方式可自行配置)
   * */
  const pageParam = computed({
    get: () => {
      return {
        current: state.pageable.current,
        size: state.pageable.size,
      };
    },
    set: (newVal: any) => {
      console.log("我是分页更新之后的值", newVal);
    },
  });

  /**
   * @description 获取表格数据
   * @return void
   * */
  const getTableList = async () => {
    if (!api) {
      console.log("未传递接口api");
      return;
    }
    try {
      // 先把初始化参数和分页参数放到总参数里面
      Object.assign(
        state.totalParam,
        initParam,
        isPageable ? pageParam.value : {},
      );
      state.loadingVisible = true;
      let res = await api({
        ...state.searchInitParam,
        ...state.totalParam,
      });
      console.log("proTable 获取接口返回内容", res);
      let { data, code, msg } = res;

      // NOTE: 根据 pigx 返回R 实例对接
      dataCallBack && (data = dataCallBack(data));
      state.tableData = isPageable ? data.records : data;
      // 解构后台返回的分页数据 (如果有分页更新分页信息)
      if (isPageable) {
        const { current, size, total } = data;
        updatePageable({ current, size, total });
      }
    } catch (error) {
      requestError && requestError(error);
    } finally {
      state.loadingVisible = false;
    }
  };

  /**
   * @description 更新查询参数
   * @return void
   * */
  const updatedTotalParam = () => {
    state.totalParam = {};
    // 处理查询参数，可以给查询参数加自定义前缀操作
    let nowSearchParam: Table.StateProps["searchParam"] = {};
    // 防止手动清空输入框携带参数（这里可以自定义查询参数前缀）
    for (let key in state.searchParam) {
      // * 某些情况下参数为 false/0 也应该携带参数
      if (
        state.searchParam[key] ||
        state.searchParam[key] === false ||
        state.searchParam[key] === 0
      ) {
        nowSearchParam[key] = state.searchParam[key];
      }
    }
    Object.assign(
      state.totalParam,
      nowSearchParam,
      isPageable ? pageParam.value : {},
    );
  };

  /**
   * @description 更新分页信息
   * @param {Object} pageable 后台返回的分页数据
   * @return void
   * */
  const updatePageable = (pageable: Table.Pageable) => {
    if (
      pageable.current === undefined ||
      pageable.size === undefined ||
      pageable.total === undefined
    )
      return;
    Object.assign(state.pageable, pageable);
  };

  /**
   * @description 表格数据查询
   * @return void
   * */
  const search = () => {
    console.log("ProTable formRef", state.searchRef?.formEl);
    if (!state.searchRef?.formEl) return;
    state.searchRef?.formEl?.validate((valid, obj) => {
      if (valid) {
        state.pageable.current = 1;
        updatedTotalParam();
        getTableList();
      } else {
        try {
          const [{ message }] = obj[Object.keys(obj)[0]];
          ElMessage.warning(message);
        } catch (err) {
          ElMessage.warning("表单校验未通过");
        } finally {
          return false;
        }
      }
    });
  };

  /**
   * @description 表格数据重置
   * @return void
   * */
  const reset = () => {
    state.pageable.current = 1;
    state.searchParam = {};
    /**
     * @description  重置搜索表单的时，如果有默认搜索参数，则重置默认的搜索参数
     * @default
     * @title
     */
    Object.keys(state.searchInitParam).forEach((key) => {
      state.searchParam[key] = state.searchInitParam[key];
    });
    updatedTotalParam();
    search();
  };

  /**
   * @description 每页条数改变
   * @param {Number} val 当前条数
   * @return void
   * */
  const handleSizeChange = (val: number) => {
    state.pageable.current = 1;
    state.pageable.size = val;
    getTableList();
  };

  /**
   * @description 当前页改变
   * @param {Number} val 当前页
   * @return void
   * */
  const handleCurrentChange = (val: number) => {
    state.pageable.current = val;
    getTableList();
  };

  return {
    ...toRefs(state),
    getTableList,
    search,
    reset,
    handleSizeChange,
    handleCurrentChange,
    updatedTotalParam,
  };
};
