<template>
  <div>
    <el-table
      ref="multipleTable"
      :data="buttons"
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
import { buttons } from './data/buttons'
export default {
  name: 'FlowButton',
  props: {
    buttonsList: {}
  },
  data() {
    return {
      buttons
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.buttonsList.forEach(item => {
        this.$refs.multipleTable.toggleRowSelection(this.buttons.find(elem => elem.code === item.code));
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
            this.$emit('removeButton', element)
          });
          this.$emit('callback', rows)
        }else{
          this.$emit('removeButton', row)
        }
    }

    
  },
  watch: {
    buttonsList () {
      this.$refs.multipleTable.clearSelection()
      this.buttonsList.forEach(item => {
        this.$refs.multipleTable.toggleRowSelection(this.buttons.find(elem => elem.code === item.code));
      })
    }
  }
}
</script>
<style scoped>

</style>
