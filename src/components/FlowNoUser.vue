<template>
  <div>
      <!-- @selection-change="handleSelectionChange" -->
    <el-table
      ref="multipleTable"
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
        this.$refs.multipleTable.toggleRowSelection(this.users.find(elem => elem.code === item.code));
      })
    })
  },
  methods: {
    cancel() {
      this.$refs.multipleTable.clearSelection()  
    },


     onTableSelect(rows, row) {
       console.log('--------++++-------')
       console.log(rows)
       console.log(row)
        let selected = rows.length && rows.indexOf(row) !== -1
        if(selected){
          rows.forEach(element => {
            this.$emit('removeNoUser', element)
          });
          this.$emit('callback', rows)
        }else{
          this.$emit('removeNoUser', row)
        }
    }


    
  },
  watch: {
    noUserData () {
      this.$refs.multipleTable.clearSelection()
      this.noUserData.forEach(item => {
        this.$refs.multipleTable.toggleRowSelection(this.users.find(elem => elem.code === item.code));
      })
    }
  }
}
</script>
<style scoped>

</style>
