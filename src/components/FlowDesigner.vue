<template>
  <div class="flowdesigner">
    <el-tabs
      v-model="activeName"
      type="border-card"
      class="custom-tabs"
      @tab-click="handleTabClick"

    >
      <el-tab-pane label="流程设计器" name="1">
        <el-container id="wrap" class="wrap">
          <el-main id="canvas" ref="canvas" class="canvas" />
          <el-aside class="aside" width="400px">
            <panel
              v-if="bpmnModeler"
              :modeler="bpmnModeler"
              :code.sync="form.code"
              :formKey.sync="form.formKey"
              :processDes.sync="form.processDes"
              v-model="form.processName"
              :processKey="processKey"
            />
          </el-aside>
        </el-container>
      </el-tab-pane>

      <el-tab-pane label="BPMN XML" name="2">
        <codemirror v-model="bpmnXml" :options="cmOptions" class="wrap" />
      </el-tab-pane>
    </el-tabs>
    <!-- 按钮 -->
    <div v-if="activeName === '1'" slot="footer" class="dialog-footers">
      <el-button-group>
      
        <el-button v-tips="'导入本地BPMN'" @click="openFile">
          <i class="icon-folder" title="导入本地BPMN" />
          <input ref="file" type="file" style="display: none" @change="showRealPath" />
        </el-button>
        <el-button v-tips="'撤消'" @click="undo()">
          <i class="icon-undo" title="撤消" />
        </el-button>
        <el-button v-tips="'恢复'" @click="redo()">
          <i class="icon-redo" title="恢复" />
        </el-button>
        <el-button v-tips="'保存'" @click="saveFlow" :loading="fullscreenLoading">
          <i class="icon-floppy-disk" title="保存" />
        </el-button>
        <el-button v-tips="'发布'" @click="releaseFlow" :loading="issueLoading">
          <i class="el-icon-s-promotion" title="发布" />
        </el-button>
      </el-button-group>
    </div>

    <!-- 流程工单 -->
    <div class="basicInfo" hidden="hidden">
      <el-form :model="form" label-width="80px" label-position="top">
        <el-form-item class="inputShow" label="表单" hidden>
          <!-- <el-input v-model="form.formKey"></el-input> -->
          <el-select v-model="form.formKey" clearable placeholder="请选择" key="1">
            <el-option
              v-for="item in fromflow"
              :key="item.formKey"
              :label="item.formName"
              :value="item.formKey"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="inputShow" label="工单编号" hidden>
          <el-input clearable v-model="form.code"></el-input>
          <!-- <i class="el-icon-close" @click="delCode"></i> -->
        </el-form-item>
        <el-form-item class="inputShow" label="流程名称" hidden>
          <el-input clearable v-model="form.processName"></el-input>
        </el-form-item>
        <el-form-item class="inputShow" label="流程实例描述 " hidden>
          <el-input clearable v-model="form.processDes"></el-input>
        </el-form-item>

        <el-form-item label="id" hidden>
          <el-input clearable v-model="form.orderId"></el-input>
        </el-form-item>
        <el-form-item label="processDes" hidden>
          <el-input clearable v-model="form.processDes"></el-input>
        </el-form-item>

        <el-form-item label="property" hidden>
          <el-input clearable v-model="form.property"></el-input>
        </el-form-item>
        <el-form-item label="processGroup" hidden>
          <el-input clearable v-model="form.processGroup"></el-input>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import Modeler from "./CustomModeler";
import customTranslate from "./CustomTranslate";
import propertiesPanelModule from "./CustomPanel";
import propertiesProviderModule from "./CustomPanel/lib/provider/flowable";
// import flowableModdleDescriptor from "./CustomDescriptor/resources/flowable";
import flowableModdleDescriptor from "./CustomDescriptor/resources/activiti";
import FileSaver from "file-saver";
import { codemirror } from "vue-codemirror";

//自定义左侧工具栏
import customModule from "./custom";
import panel from "./PropertyPanel";
import "codemirror/mode/xml/xml.js";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/idea.css";
import "codemirror/addon/fold/foldgutter.css";
import "codemirror/addon/fold/foldcode.js";
import "codemirror/addon/fold/foldgutter.js";
import "codemirror/addon/fold/xml-fold.js";
import "codemirror/addon/fold/indent-fold.js";
import "codemirror/addon/fold/brace-fold";
import "codemirror/addon/fold/markdown-fold.js";
import "codemirror/addon/fold/comment-fold.js";
import "codemirror/addon/selection/active-line";
import urls from "../api/urls"; //url引入

export default {
  name: "Bpmn",
  components: {
    codemirror,
    panel
  },
  props: {
    isAdd: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      modelId: null,
      // bpmn建模器
      bpmnModeler: null,
      encodedData: null,
      dialog: false,
      loading: false,
      title: "流程设计",
      bpmnXml: "",
      processKey: "",
      customTranslate: {
        translate: ["value", customTranslate]
      },
      activeName: "1",
      cmOptions: {
        tabSize: 4,
        mode: { name: "xml", json: true },
        theme: "idea",
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        foldgutter: true,
        gutters: [
          "CodeMirror-linenumbers",
          "CodeMirror-foldgutter",
          "CodeMirror-lint-markers"
        ],
        lineWrapping: true, // 代码折叠
        foldGutter: true,
        matchBrackets: true, // 括号匹配
        autoCloseBrackets: true
      },
      fromflow: {},
      form: {
        id: "",
        code: "",
        processName: "",
        description: "",
        processDes: "",
        orderId: "",
        //将http://192.168.2.32:8096/workflow/formDefinition/rest/queryFormDefinitionList里的值赋值给formKey
        formKey: this.fromflow,
        property: "",
        processGroup: "",
        fromflow: []
      },
      token: "",
      fullscreenLoading: false,
      issueLoading: false,
      // 预览流程图
      dialogXmlimg:false
    };
  },
  mounted() {
    // 显示表单接口
    var temps = new URLSearchParams(location.search);
    var id = temps.get("id");
    var temp = new URLSearchParams(location.search);
    this.token = temp.get("token");
    let formList = {};
    formList.method = "post";
    formList.url = urls + "/formDefinition/rest/queryFormDefinitionList";
    formList.data = {
      formTypeId: "0"
    };
    formList.headers = {
      token: this.token
    };
    this.$axios(formList)
      .then(response => {
        this.fromflow = response.data.responseBody;
      })
      .catch(error => {
        console.log(error);
      });

    // 获取搜索栏上的id
    let query = {};
    query.method = "post";
    query.url = urls + "/app/rest/deploy/query";
    query.data = {
      id: id
    };
    query.headers = {
      token: this.token
    };



    this.$axios(query)
      .then(response => {
          console.log(response)
        if (response.data.responseBody.bpmnxml) {
            this.bpmnXml = response.data.responseBody.bpmnxml;
        }
        this.form.id = response.data.responseBody.id;
        this.form.code = response.data.responseBody.code;
        this.form.processName = response.data.responseBody.processName;
        this.form.processDes = response.data.responseBody.processDes;
        this.form.orderId = response.data.responseBody.orderId;
        this.form.formKey = response.data.responseBody.formKey;
        this.form.property = response.data.responseBody.property;
        this.form.processGroup = response.data.responseBody.processGroup;
        this.processKey = response.data.responseBody.processKey;
        // 判断后台xml文件是否为空 如果为空就给个默认的xml
        if(this.bpmnXml == null || this.bpmnXml == ""){
          this.bpmnXml = `
            <?xml version="1.0" encoding="UTF-8"?>
              <definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:flowable="http://flowable.org/bpmn" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" xmlns:xsd="http://www.w3.org/2001/XMLSchema" targetNamespace="http://www.flowable.org/processdef">
                <process id="${this.processKey}" name="${this.form.processName}" isExecutable="true" >
                  <documentation></documentation>
                <startEvent id="StartEvent_1kvyueq" name="开始">
                    <documentation></documentation>
                   <extensionElements />
             <outgoing>SequenceFlow_1t99g2a</outgoing>
            </startEvent>
            <userTask id="UserTask_1p7apma" name="用户任务">
              <documentation></documentation>
              <extensionElements />
              <incoming>SequenceFlow_1t99g2a</incoming>
            </userTask>
            <sequenceFlow id="SequenceFlow_1t99g2a" sourceRef="StartEvent_1kvyueq" targetRef="UserTask_1p7apma" />
          </process>
          <bpmndi:BPMNDiagram id="BPMNDiagram_kfw200318105905138">
            <bpmndi:BPMNPlane id="BPMNPlane_kfw200318105905138" bpmnElement="kfw200318105905138">
              <bpmndi:BPMNShape id="StartEvent_1kvyueq_di" bpmnElement="StartEvent_1kvyueq">
                <omgdc:Bounds x="52" y="102" width="36" height="36" />
              </bpmndi:BPMNShape>
              <bpmndi:BPMNShape id="UserTask_1p7apma_di" bpmnElement="UserTask_1p7apma">
                <omgdc:Bounds x="210" y="80" width="100" height="80" />
              </bpmndi:BPMNShape>
              <bpmndi:BPMNEdge id="SequenceFlow_1t99g2a_di" bpmnElement="SequenceFlow_1t99g2a">
                <omgdi:waypoint x="88" y="120" />
                <omgdi:waypoint x="210" y="120" />
              </bpmndi:BPMNEdge>
            </bpmndi:BPMNPlane>
          </bpmndi:BPMNDiagram> 
        </definitions>`;
        }
        this.$nextTick(() => {
            this.handleOpen();
            this.handleTabClick({ name: 1 });
            this.handleClose();
        });
      
      })
      .catch(error => {
        console.log(error);
      });
  },

  methods: {
    // 预览流程图
     handleCloseXml(done) {
        this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {});
      },
    openDiagram(xml) {
      this.bpmnModeler.importXML(xml, function(err) {
        if (err) {
          console.error("====>>>err", err);
        } else {
          // console.log("====>>>导入成功");
        }
      });
    },
    handleOpen() {
      if (this.bpmnModeler) return    
      this.bpmnModeler = new Modeler({
        container: "#canvas",
        additionalModules: [
          customModule, //自定义工具栏
          propertiesPanelModule,
          propertiesProviderModule,
          this.customTranslate
        ],
        moddleExtensions: {
          flowable: flowableModdleDescriptor
        }
      });
      if (this.isAdd) {
        this.openDiagram(this.bpmnXml);
      } else {
        this.getFlowXml(this.modelId);
      }
    },
    handleClose() {
      this.openDiagram(this.bpmnXml);
      // this.bpmnModeler = null
      this.activeName = "1";
    },
    // bpmn xml显示
    handleTabClick(obj) {
      if (obj.name === "2") {
        const _this = this;
        this.bpmnModeler.saveXML({ format: true }, function(err, xml) {
          if (!err) {
            _this.bpmnXml = xml;
          }
        });
      }
    },
    // 保存最新的xml文件
    handXml(){
       const _this = this;
        this.bpmnModeler.saveXML({ format: true }, function(err, xml) {
          if (!err) {
            _this.bpmnXml = xml;
          }
        });
    },
    // 导入xml或bpmn文件
    showRealPath() {
      const selectedFile = this.$refs.file.files[0];
      // 后缀获取
      let suffix = "";
      try {
        const fileArr = selectedFile.name.split(".");
        suffix = fileArr[fileArr.length - 1];
      } catch (err) {
        suffix = "";
      }
      if (suffix === "" || (suffix !== "xml" && suffix !== "bpmn")) {
        this.$message({
          message: "不是有效的流程文件！",
          type: "warning"
        });
        return;
      }
      // FileReader对象，h5提供的异步api，可以读取文件中的数据。
      const reader = new FileReader();
      // readAsText是个异步操作，只有等到onload时才能显示数据。
      reader.readAsText(selectedFile);
      const _this = this;
      reader.onload = function() {
        // 当读取完成后回调这个函数,然后此时文件的内容存储到了result中,直接操作即可
        _this.openDiagram(this.result);
      };
      // 防止选择同一个文件不执行此方法
      this.$refs.file.value = null;
    },
    openFile() {
      this.$refs.file.dispatchEvent(new MouseEvent("click"));
    },
    //撤销
    undo() {
      this.bpmnModeler.get("commandStack").undo();
    },
    //恢复
    redo() {
      this.bpmnModeler.get("commandStack").redo();
    },
    // 保存
    saveFlow() {
      this.handXml()
      this.fullscreenLoading = true;
      let params = {};
      params.method = "post";
      params.url = urls + "/process/rest/deploy/save";
      params.data = {
        id: this.form.id,
        processName: this.form.processName,
        orderId: this.form.orderId,
        bpmnxml: this.bpmnXml,
        formKey: this.form.formKey,
        property: this.form.property,
        processGroup: this.form.processGroup,
        description: this.form.description,
        code: this.form.code,
        processDes: this.form.processDes
      };
      (params.headers = {
        token: this.token
      }),
        this.$axios(params)
          .then(response => {
            if (response.data.errorCode === 0) {
              this.$message({
                message: "保存成功",
                type: "success"
              });
            } else {
              this.$message.error("保存失败");
            }
          })
          .catch(error => {
            this.$message.error("保存失败");
          })
          .finally(() => {
            this.fullscreenLoading = false;
          });
    },
    // 发布
    releaseFlow() {
      this.handXml()
      // 先保存
      // this.fullscreenLoading = true;
      let params = {};
      params.method = "post";
      params.url = urls + "/process/rest/deploy/save";
      params.data = {
        id: this.form.id,
        processName: this.form.processName,
        orderId: this.form.orderId,
        bpmnxml: this.bpmnXml,
        formKey: this.form.formKey,
        property: this.form.property,
        processGroup: this.form.processGroup,
        description: this.form.description,
        code: this.form.code,
        processDes: this.form.processDes
      };
      (params.headers = {
        token: this.token
      }),
      this.$axios(params)
          .then(response => {
            console.log(response);
            if (response.data.errorCode === 0) {
              // 再发布
              this.issueLoading = true;
              console.log(this.token);
              let paramss = {};
              paramss.method = "post";
              paramss.url = urls + "/process/rest/deploy/publish";
              paramss.data = {
                processKey: this.processKey
              };
              paramss.headers = {
                token: this.token
              };
              this.$axios(paramss)
                .then(response => {
                  console.log(response);
                  if (response.data.errorCode === 0) {
                    this.$message({
                      message: "发布成功",
                      type: "success"
                    });
                  } else {
                    this.$message.error("发布失败");
                  }
                })
                .catch(error => {
                  this.$message.error("发布失败");
                  console.log(error);
                })
                .finally(() => {
                  this.issueLoading = false;
                });
            } else {
              this.$message.error("保存失败");
            }
          })
          .catch(error => {
            console.log(error);
            this.$message.error("保存失败");
          })
          .finally(() => {
            this.fullscreenLoading = false;
          });
    },

  }
};
</script>

<style lang="scss" >
/*左边工具栏以及编辑节点的样式*/
@import "../../node_modules/bpmn-js/dist/assets/diagram-js.css";
@import "../../node_modules/bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
@import "../../node_modules/bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css";
@import "../../node_modules/bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
.el-tabs__content {
  padding: 0 0 15px 0 !important;
}
.bjs-powered-by {
  display: none;
}
.canvas {
  overflow: hidden;
  height: 100%;
}
.wrap {
  height: calc(100vh - 140px);
  margin-bottom: 10px;
}
.CodeMirror {
  height: calc(100vh - 140px);
}
.el-container {
  height: 100vh;
}
.aside {
  width: 400px;
  background: #f8f8f8;
  height: 100%;
  border-left: 1px solid #e0e0e0;
}
.djs-palette.two-column.open {
  width: 48px;
}
.flowdesigner .dialog-footers {
  position: fixed;
  top: 60px;
  right: 450px;
  z-index: 1;
}
.flowdesigner .basicInfo {
  z-index: 1;
  position: absolute;
  display: flex;
  bottom: 0;
  right: 500px;
  .el-input__inner {
    width: 200px;
    height: 30px;
  }
//   .inputShow {
//     // display: flex;
//     // justify-content: space-between;
//     // padding-left: 20px;
//   }
}
</style>
