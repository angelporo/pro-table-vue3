<template>
  <!-- 列设置 -->
  <el-drawer v-model="drawerVisible" title="列设置" size="600px">
    <div class="table-main">
      <el-table
        :data="colSetting"
        :border="true"
        row-key="prop"
        default-expand-all
        row-class-name="pro-table-cursor-move"
        :tree-props="{ children: '_children' }"
        ref="TableRef"
      >
        <!-- <el-table-column
             width="80"
             class-name="drag-icon"
             prop="sort"
             align="center"
             label="排序"
             >
             <el-icon :size="14">
             <Grid></Grid>
             </el-icon>
             </el-table-column> -->
        <el-table-column prop="label" align="center" label="列名" />
        <el-table-column
          v-slot="scope"
          prop="isShow"
          align="center"
          label="显示"
        >
          <el-switch v-model="scope.row.isShow"></el-switch>
        </el-table-column>

        <el-table-column
          v-slot="scope"
          prop="sortable"
          align="center"
          label="排序"
        >
          <el-switch
            :disabled="!scope.row.isTableSort"
            v-model="scope.row.sortable"
          ></el-switch>
        </el-table-column>

        <el-table-column
          v-slot="scope"
          prop="sortable"
          align="center"
          width="220"
          label="冻结列"
        >
          <el-radio-group v-model="scope.row.fixed">
            <el-radio label="left">左</el-radio>
            <el-radio label="rights">右</el-radio>
            <el-radio :label="false">取消</el-radio>
          </el-radio-group>
        </el-table-column>

        <template #empty>
          <div class="table-empty">
            <img src="@/assets/images/notData.png" alt="notData" />
            <div>暂无可配置列</div>
          </div>
        </template>
      </el-table>
    </div>
  </el-drawer>
</template>

<script setup lang="ts" name="ColSetting">
 import { ref,  nextTick,  watchEffect } from "vue";
import Sortablejs from "sortablejs";
import { Grid } from "@element-plus/icons-vue";
import { ColumnProps } from "packages/ProTable/interface";
const emit = defineEmits(["changeColIndex"]);
const TableRef = ref();

const props = withDefaults(defineProps<{ colSetting: ColumnProps[] }>(), {
  colSetting: [],
});
const drawerVisible = ref<boolean>(false);

let sortablehandle;
const initDropTable = () => {
  if (!TableRef.value) return;

  const el = TableRef.value.$el.querySelector(".el-table__body tbody");
  sortablehandle?.destroy();
  sortablehandle = Sortablejs.create(el, {
    handle: ".el-table__row", // 设置指定列作为拖拽
    onEnd(evt: any) {
      const { newIndex, oldIndex } = evt;

      console.log(newIndex);
      console.log(oldIndex);
      const currRow = props.colSetting?.splice(oldIndex, 1)[0];
      props.colSetting?.splice(newIndex, 0, currRow);
      emit("changeColIndex", props.colSetting);
    },
  });
};
watchEffect(() => {
  if (drawerVisible.value) {
    nextTick(() => {
      if (props.colSetting?.length) {
        initDropTable();
      }
    });
  }
});

const openColSetting = () => {
  drawerVisible.value = true;
};

defineExpose({
  openColSetting,
});
</script>

<style>
.pro-table-cursor-move {
  cursor: move;
}
</style>
