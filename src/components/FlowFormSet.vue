<template>
  <el-dialog
    :visible.sync="dialog"
    :close-on-click-modal="false"
    title="表单属性"
    append-to-body
    top="200px"
    width="637px"
  >
    <div class="app-container">
      <!--表格渲染-->
      <el-tabs v-model="activeName" >
        <el-tab-pane label="属性" name="first">
          <el-table :data="properties" height="250" border style="width: 100%">
            <el-table-column prop="name" label="字段描述" width="158" align="center"></el-table-column>
            <el-table-column prop="model" label="字段名称" width="158" align="center"></el-table-column>

            <el-table-column prop="readonly" label="只读" width="80" align="center">
              <template>
                <el-checkbox></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column prop="required" label="必填" width="80" align="center">
              <template >
                <el-checkbox></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column prop="processVariable" label="流程变量" width="80" align="center">
              <template >
                <el-checkbox
                ></el-checkbox>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- slot-scope="item" -->
        <el-tab-pane label="布局设置" name="second">
          <el-table :data="LayoutSettings" height="250" border style="width: 100%">
            <el-table-column prop="name" label="字段描述" width="238" align="center"></el-table-column>
            <el-table-column prop="model" label="字段名称" width="238" align="center"></el-table-column>
            <el-table-column prop="hide" label="隐藏" width="80" align="center">
              <template >
                <el-checkbox></el-checkbox>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" size="small" @click="cancel">取消</el-button>
      <el-button type="primary" size="small" @click="doSubmit">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "FlowFormSet",
  data() {
    return {
    properties: [], // 属性只读
    LayoutSettings: [], // 布局设置
      activeName:"first",
      dialog: false,
      multiple: false,
      selectedUsers: [],
      data: [
        {
          id: "1",
          date: "2016-05-02",
          realName: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄"
        },
        {
          id: "2",
          date: "2016-05-04",
          realName: "王小虎",
          address: "上海市普陀区金沙江路 1517 弄"
        },
        {
          id: "3",
          date: "2016-05-01",
          realName: "王小虎",
          address: "上海市普陀区金沙江路 1519 弄"
        },
        {
          id: "4",
          date: "2016-05-03",
          realName: "王小虎",
          address: "上海市普陀区金沙江路 1516 弄"
        }
      ]
    };
  },
  methods: {
    handleSelectionChange(val) {
      this.selectedUsers = val;
    },
    cancel() {
      this.multipleSelection = [];
      this.$refs.multipleTable.clearSelection();
      this.dialog = false;
    },
    doSubmit() {
      if (!this.multiple && this.selectedUsers.length > 1) {
        this.$message.error("你最多只能选择一个用户");
        return;
      }
      this.$emit("callback", this.selectedUsers);
      this.cancel();
    }
  }
};
</script>

<style scoped>
</style>
