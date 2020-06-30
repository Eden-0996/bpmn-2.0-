<template>
  <div id="app">
    <flow-designer ref="FlowDesigner" :is-add="true" />
  </div>
</template>

<script>
import FlowDesigner from './components/FlowDesigner'
export default {
  name: 'App',
  components: {
    FlowDesigner
  },





  
  methods: {

  }
}
</script>

<style>
*{
  padding: 0;
  margin: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  overflow:hidden;
  height: 100vh;
}
</style>
