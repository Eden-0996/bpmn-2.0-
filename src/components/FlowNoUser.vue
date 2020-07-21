<template>
  <div>
      <!-- @selection-change="handleSelectionChange" -->
    <el-table
      ref="multipleTableUser"
      :data="users"
      style="width: 100%"
      @select="onTableSelect"
    
       :show-header = false
      :border = true
>     
      <el-table-column
        type="selection"
        align="center"
        width="55" />
      <el-table-column
        prop="name"
        label="名称"
        align="center" />
     
    </el-table>
    <div slot="footer" class="dialog-footer">
      <!-- <el-button type="primary" size="small" @click="doSubmit">确认</el-button> -->
    </div>
  </div>
</template>



<script>
import { users } from './data/user'
export default {
  name: 'FlowNoUser',
  props: {
    noUserData: {}
  },
  data() {
    return {
      users
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.noUserData.forEach(item => {
        this.$refs.multipleTableUser.toggleRowSelection(this.users.find(elem => elem.code === item.code));
      })
    })
  },
  methods: {
    cancel() {
      this.$refs.multipleTableUser.clearSelection()  
    },
     onTableSelect(rows, row) {
        for(var i = 0; i < rows.length; i++) {
        if(rows[i] == undefined) {
          rows.splice(i,1);
            i = i - 1;
        }
      }
        let selected = rows.length && rows.indexOf(row) !== -1
        if(selected){
          // rows.forEach(element => {
          //   this.$emit('removeNoUser', element)
          // });
          this.$emit('callback', rows,row)
        }else{
          this.$emit('removeNoUser', row)
        }
    }


    
  },
  watch: {
    noUserData () {
      this.$refs.multipleTableUser.clearSelection()
      this.noUserData.forEach(item => {
        this.$refs.multipleTableUser.toggleRowSelection(this.users.find(elem => elem.code === item.code));
      })
    }
  }
}
</script>
<style scoped>

</style>
