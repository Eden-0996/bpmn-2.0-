<template>
  <div ref="propertyPanel" class="property-panel">
    <el-collapse v-model="activeName">
      <!-- 流程名称及节点名称 -->
      <div class="maxhead" v-if="!rootElement">
        <h1 v-if="form.name !=null ">{{form.name}}</h1>
      </div>
      <div class="maxhead" v-if="rootElement">
        <h1 v-if="form.name !=null ">{{parentName}}</h1>
      </div>
      <!-- 基本属性 -->
      <el-collapse-item name="1">
        <template slot="title">
          <span class="el_title">
            基本设置
            <i class="header-icon el-icon-info" />
          </span>
        </template>
        <div style="text-align: center;margin-bottom:10px" v-if="isUserTask || isCallActivity">
          <el-button type="text" @click="openFormFieldLayer()">表单属性设置</el-button>
        </div>
        <el-dialog
          title="表单设置"
          :visible.sync="dialogVisible"
          width="615px"
          :before-close="closedDialog"
        >
          <el-tabs v-model="activeNames">
            <!-- 属性 -->
            <el-tab-pane label="属性" name="shuxing">
              <el-table :data="properties" height="250" border style="width: 100%">
                <el-table-column prop="name" label="字段描述" width="158" align="center"></el-table-column>
                <el-table-column prop="model" label="字段名称" width="158" align="center"></el-table-column>

                <el-table-column prop="readonly" label="只读" width="80" align="center">
                  <template slot-scope="item">
                    <el-checkbox
                      @change="changeCheckbox(item)"
                      :checked="item.row.readonly === 'true'"
                    ></el-checkbox>
                  </template>
                </el-table-column>
                <el-table-column prop="required" label="必填" width="80" align="center">
                  <template slot-scope="item">
                    <el-checkbox
                      @change="changeCheckbox(item)"
                      :checked="item.row.required === 'true'"
                    ></el-checkbox>
                  </template>
                </el-table-column>
                <el-table-column prop="processVariable" label="流程变量" width="80" align="center">
                  <template slot-scope="item">
                    <el-checkbox
                      @change="changeCheckbox(item)"
                      :checked="item.row.processVariable === 'true'"
                    ></el-checkbox>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <!-- 布局设置 -->
            <el-tab-pane label="布局设置" name="buju">
              <el-table :data="LayoutSettings" height="250" border style="width: 100%">
                <el-table-column prop="name" label="字段描述" width="238" align="center"></el-table-column>
                <el-table-column prop="model" label="字段名称" width="238" align="center"></el-table-column>
                <el-table-column prop="hide" label="隐藏" width="80" align="center">
                  <template slot-scope="item">
                    <el-checkbox @change="changeCheckbox(item)" :checked="item.row.hide === 'true'"></el-checkbox>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
          <!-- 表单保存设置 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="cancelForm">取 消</el-button>
            <el-button type="primary" @click="confirmFormFieldLayer()">保 存</el-button>
          </span>
        </el-dialog>
        <!-- v-if="(isUserTask || )" -->
        <el-form :model="form" label-width="100px" size="small">
          <el-form-item v-if="rootElement" label="流程key">
            <el-input
              v-model="form.id"
              clearable
              placeholder="请输入key"
              class="el_input"
              @input="updateKey"
              :disabled="true"
            />
          </el-form-item>
          <el-form-item v-if="!rootElement" label="节点key">
            <el-input
              v-model="form.id"
              clearable
              placeholder="请输入key"
              class="el_input"
              @input="updateKey"
              :disabled="true"
            />
          </el-form-item>
          <el-form-item v-if="!rootElement" label="节点名称">
            <el-input
              v-model="form.name"
              clearable
              placeholder="请输入名称"
              class="el_input"
              @input="updateName"
            />
          </el-form-item>

          <el-form-item v-if="rootElement" label="流程名称">
            <el-input
              v-model="parentName"
              clearable
              placeholder="请输入名称"
              class="el_input"
              @input="updateName"
            />
          </el-form-item>
          <div v-if="rootElement">
            <!-- 表单 -->
            <el-form-item label="表单">
              <el-select
                v-model="fkey"
                clearable
                placeholder="请选择表单"
                key="1"
                @change="updateProperties({formKey: form.formKey || undefined}, 'fkey')"
              >
                <el-option
                  v-for="item in fromflow"
                  :key="item.formKey"
                  :label="item.formName"
                  :value="item.formKey"
                ></el-option>
              </el-select>
            </el-form-item>
            <!-- 工单编号 -->
            <el-form-item label="工单编号">
              <el-input
                v-model="codes"
                @input="processCodeChange"
                clearable
                placeholder="请输入工单编号"
                class="el_input"
              />
            </el-form-item>
            <el-form-item label="实例描述 ">
              <el-input
                type="textarea"
                @input="processDesChange"
                v-model="proDes"
                placeholder="请输入流程实例描述"
                clearable
                class="el_input"
              ></el-input>
            </el-form-item>
            <el-form-item label="id" hidden>
              <el-input v-model="form.orderId" clearable></el-input>
            </el-form-item>
            <el-form-item label="processDes" hidden>
              <el-input v-model="form.processDes" clearable></el-input>
            </el-form-item>
            <el-form-item label="property" hidden>
              <el-input v-model="form.property" clearable></el-input>
            </el-form-item>
            <el-form-item label="processGroup" hidden>
              <el-input v-model="form.processGroup" clearable></el-input>
            </el-form-item>
            <!-- <el-form-item label="描述">
              <el-input
                v-model="form.description"
                :rows="3"
                clearable
                placeholder="请输入描述"
                class="el_input"
                @input="updateDocumentation"
              />
            </el-form-item>-->
          </div>
          <!-- 定时器 -->
          <el-form-item
            label="提醒方式"
            v-if="!isCallActivity && !isSequenceFlow && !rootElement && !isUserTask"
          >
            <el-select
              multiple
              clearable
              v-model="remindMsg"
              placeholder="请选择"
              @change="remindMsgs"
            >
              <el-option
                v-for="item in RemindMsgList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- UserTask -->
          <div v-if="isUserTask">
            <el-form-item label="待办提醒">
              <el-select
                multiple
                clearable
                v-model="remindMsg"
                placeholder="请选择"
                @change="remindMsgs"
              >
                <el-option
                  v-for="item in RemindMsgList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="处理类">
              <el-input
                v-model="disposeType"
                @input="disposeTypes"
                placeholder="请输入处理类"
                clearable
                class="el_input"
              ></el-input>
            </el-form-item>
          </div>

          <div v-if="!isUserTask && !isCallActivity && !isSequenceFlow && !rootElement">
            <!-- <el-form-item label="时间类型" v-if="ifTimer === false">
              <el-select v-model="form.timeDefinitionType" placeholder="请选择" @change="updateTime">
                <el-option
                  v-for="item in timeDefinitionTypeList"
                  :key="item"
                  :label="item"
                  :value="item"
                ></el-option>
              </el-select>
            </el-form-item>-->
            <!--<el-form-item label="节点类型">
               <el-select @change="changeEventType()" :value="form.eventType">
                <el-option
                  v-for="option in eventTypes"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                ></el-option>
              </el-select>

              <select @change="changeEventType" :value="form.eventType">
                <option
                  v-for="option in eventTypes"
                  :key="option.value"
                  :value="option.value"
                >{{ option.label }}</option>
              </select>  
            </el-form-item>-->
            <div>
              <el-form-item :rules="[{ required: true, message: '超时告警不能为空'},]" 
              label="超时告警" v-if="ifTimer === false">
                <el-select
                  v-model="FormalExpression.body"
                  @change="timeoutAlarm"
                  placeholder="请选择"
                  clearable
                  key="1"
                >
                  <el-option
                    v-for="item in FormalExList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </div>
          </div>
        </el-form>
        <div class="el_title" v-if="isUserTask || isCallActivity">
          <el-divider style="width:90%">按钮配置</el-divider>
          <flow-button
            style="width: 100%; margin-top: 5px;"
            ref="FlowButton"
            :buttonsList="buttonsList"
            @callback="handleButtonCallback"
            @removeButton="removeButton"
          />
        </div>
      </el-collapse-item>
      <!-- 节点处理人 -->
      <el-collapse-item v-if="isUserTask">
        <template slot="title">
          <span class="el_title">
            处理人
            <i class="header-icon el-icon-info" />
          </span>
        </template>
        <el-form  ref="userTaskForm" :model="form" label-width="100px" size="small">
          <!-- <el-checkbox v-model="item" id="check1" @change="userCheckbox"  label="${applyUser}">发起人处理</el-checkbox> -->
          <div style="margin:5px 40px">
            <!-- <input type="checkbox" v-model="item" @change="userCheckbox" id="check1" value="${applyUser}" /> -->
            <!-- <el-checkbox @change="userCheckbox">发起人处理</el-checkbox> -->

            <el-dropdown @command="command" trigger="click">
              <span class="el-dropdown-link">
                自定义设置
                <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="${applyUser}">发起人处理</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <el-form-item label="自定义" v-if="!checkedUser == false">
            <el-input
              clearable
              v-model="checkedUser"
              class="el_input"
              placeholder="请输入自定义角色"
              @input="updateProperties({assignee: form.assignee || undefined})"
            ></el-input>
          </el-form-item>
          <el-form-item label="自定义" v-else-if="!checkedUser == true">
            <el-input
              v-model="form.assignee"
              clearable
              placeholder="请输入自定义角色"
              class="el_input"
              @input="updateProperties({assignee: form.assignee || undefined})"
            />
          </el-form-item>
          <el-form-item label="处理角色">
            <el-select
              clearable
              v-model="form.candidateGroups"
              placeholder="请选择处理角色"
              @input="updateProperties({candidateGroups: form.candidateGroups || undefined})"
            >
              <el-option
                v-for="item in rolesUser"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div class="el_title" style="margin-bottom:50px">
          <!-- <flow-no-user  style="width: 100%;" ref="FlowNoUser"  @callback="handleUserCallback" 
          @removeNoUser="removeNoUser"   :noUserData="noUserData"/>-->

          <flow-no-user 
            style="width: 100%;"
            ref="FlowNoUser"
            @callback="handleUserCallback"
            :noUserData="noUserData"
            @removeNoUser="removeNoUser"
          />
        </div>
      </el-collapse-item>
      <!-- 调用流程 -->
      <el-collapse-item v-if="isCallActivity">
        <template slot="title">
          <span class="el_title">
            调用流程
            <i class="header-icon el-icon-info" />
          </span>
        </template>
        <el-form :model="form" label-width="100px" size="small">
          <el-form-item label="调用流程">
            <el-select
              clearable
              v-model="form.calledElement"
              placeholder="请选择"
              key="2"
              @input="updateProperties({calledElement: form.calledElement || undefined})"
            >
              <el-option
                v-for="item in proKey"
                :key="item.processKey"
                :label="item.processName"
                :value="item.processKey"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-collapse-item>
      <!-- 按钮配置
      <el-collapse-item v-if="isUserTask || isCallActivity">
        <template slot="title">
          <span class="el_title">
            按钮配置
            <i class="header-icon el-icon-info" />
          </span>
        </template>
        <div class="el_title">
          <el-button type="primary" size="mini" @click="addButton()">选择</el-button>
          <el-table
            v-if="buttonsData.length > 0"
            :data="buttonsData"
            border
            style="width: 90%; margin-top: 5px;"
          >
            <el-table-column prop="name" label="名称" align="center" />
            <el-table-column label="操作" align="center" width="100px">
              <template slot-scope="scope">
                <el-button size="mini" type="text" @click="removeButton(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-collapse-item>-->
      <!-- 多实例配置 -->
      <el-collapse-item v-if="isUserTask || isCallActivity" hidden>
        <template slot="title">
          <span class="el_title">
            多实例配置
            <i class="header-icon el-icon-info" />
          </span>
        </template>
        <el-form
          ref="multiInstanceForm"
          :model="selectedMultiInstance"
          :rules="multiInstanceRules"
          label-width="100px"
          size="small"
        >
          <!-- <el-form-item label="类型">
            <el-select
              v-model="selectedMultiInstance.isSequential"
              clearable
              placeholder="请选择"
              class="el_input"
              @change="handleMultiInstance"
            >
              <el-option
                v-for="item in multiInstanceOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>-->
          <!-- v-if="selectedMultiInstance.isSequential && selectedMultiInstance.isSequential !== ''" -->
          <div>
            <!-- <el-form-item label="循环基数" prop="loopCardinality">
              <el-input
                v-model="selectedMultiInstance.loopCardinality"
                clearable
                placeholder="请输入循环基数"
                class="el_input"
                @input="updateFormalExpression('loopCardinality',selectedMultiInstance.loopCardinality)"
              />
            </el-form-item>-->
            <el-alert
              v-if="!element.businessObject.loopCharacteristics"
              class="alerty"
              title="请选择多实例类型"
              type="warning"
              show-icon
            ></el-alert>
            <el-form-item label="集合">
              <el-input
                v-model="selectedMultiInstance.collection"
                clearable
                placeholder="请输入集合"
                class="el_input"
                @input="updateMultiInstanceProperty('collection', selectedMultiInstance.collection)"
              />
            </el-form-item>
            <el-form-item label="元素变量">
              <el-input
                v-model="selectedMultiInstance.elementVariable"
                clearable
                placeholder="请输入元素变量"
                class="el_input"
                @input="updateMultiInstanceProperty('elementVariable', selectedMultiInstance.elementVariable)"
              />
            </el-form-item>
            <el-form-item label="完成条件">
              <el-input
                v-model="selectedMultiInstance.completionCondition"
                clearable
                placeholder="请输入完成条件"
                class="el_input"
                @input="updateFormalExpression('completionCondition',selectedMultiInstance.completionCondition)"
              />
            </el-form-item>
          </div>
        </el-form>
      </el-collapse-item>
      <!-- 线表达式 -->
      <el-collapse-item v-if="isSequenceFlow">
        <template slot="title">
          <span class="el_title">
            <!-- 流转条件 -->
            表达式
            <i class="header-icon el-icon-info" />
          </span>
        </template>
        <el-form ref="userTaskForm" :model="exclusiveSequence" label-width="100px" size="small">
          <el-form-item label="流程表达式">
            <el-input
              v-model="exclusiveSequence.conditionExpression"
              clearable
              placeholder="请选择流程表达式"
              class="el_input"
              @input="updateConditionExpression"
            ></el-input>
          </el-form-item>
        </el-form>
      </el-collapse-item>
      <!-- 执行监听 -->
      <el-collapse-item v-if="!rootElement && !isSequenceFlow" hidden>
        <template slot="title">
          <span class="el_title">
            监听器
            <i class="header-icon el-icon-info" />
          </span>
        </template>
        <div class="el_title">
          <el-button type="primary" size="mini" @click="addListeners(false)">添加</el-button>
          <el-table
            v-if="listenerData.length > 0"
            :data="listenerData"
            border
            style="width: 98%; margin-top: 5px;"
          >
            <el-table-column prop="eventType" label="事件" align="center" />
            <el-table-column prop="listenerType" label="类型" align="center">
              <template slot-scope="scope">
                <span>{{ listenerType[scope.row.listenerType] }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="value" label="实现" align="center" />
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button size="mini" type="text" @click="updateListener(scope.row, false)">修改</el-button>
                <el-button size="mini" type="text" @click="listenerDel(scope.row, false)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-collapse-item>
    </el-collapse>
    <flow-listener ref="FlowListener" @callback="handleListenerCallback" />
    <flow-task-listener ref="FlowTaskListener" @callback="handleListenerCallback" />
  </div>
</template>
<script>
import cmdHelper from "./CustomPanel/lib/helper/CmdHelper";
import elementHelper from "./CustomPanel/lib/helper/ElementHelper";
import extensionElementsHelper from "./CustomPanel/lib/helper/ExtensionElementsHelper";
import ImplementationTypeHelper from "./CustomPanel/lib/helper/ImplementationTypeHelper";
import FlowListener from "../components/FlowListener";
import FlowTaskListener from "../components/FlowTaskListener";
import FlowButton from "../components/FlowButton";
import FlowNoUser from "../components/FlowNoUser";
import { randomString } from "../utils/index";
import urls from "../api/urls"; //url引入
export default {
  name: "PropertyPanel",
  components: {
    FlowListener,
    FlowTaskListener,
    FlowButton,
    // FlowFormSet,
    FlowNoUser
  },
  props: {
    // 流程工单
    formKey: {},
    code: {},
    processKey: {},
    processDes: {},
    value: {},
    modeler: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      //多选框处理人
      checkedUser: "",
      //  流程工单
      codes: this.code,
      fkey: this.formKey,
      proDes: this.processDes,
      dialogTableVisible: false,
      selectedElements: [],
      element: {},
      rootElement: null,
      activeName: "1",
      sxactiveName: "1",
      activeNames: "shuxing",
      // 人员选择的类型
      selectType: "",
      // 选中的代理人
      selectedAssignee: "",
      // 选中的监听器数组
      listenerData: [],
      // 监听器
      listener: {},
      // 选中的任务监听器数组
      taskListenerData: [],
      // 任务监听器
      taskListener: {},
      isTaskListener: false,
      listenerType: {
        class: "类",
        expression: "表达式",
        delegateExpression: "代理表达式"
      },
      // 按钮
      buttonsData: [],
      buttonsList: [],
      button: [],
      // 无需选人
      noUserData: [],
      noUser: [],
      // 表单
      fromflow: [],
      form: {
        id: "",
        name: "",
        proname: this.parentName,
        formKey: this.fromflow,
        versionTag: "",
        candidateStarterUsersNames: "",
        // 流程发起人
        initiator: "",
        description: "",
        assigneeType: "1",
        assigneeName: "",
        assignee: "",
        candidateUsersName: "",
        candidateUsers: "",
        candidateGroups: "",
        // 子流程调用流程
        calledElement: "",
        // 定时器
        timeDefinitionType: "",
        eventType: ""
      },
      // 提醒方式
      remindMsg: [],
      disposeType: "",
      FormalExpression: {
        body: ""
      },
      eventTypes: [
        { label: "默认", value: "" },
        {
          label: "MessageEventDefinition",
          value: "bpmn:MessageEventDefinition"
        },
        { label: "TimerEventDefinition", value: "bpmn:TimerEventDefinition" },
        {
          label: "ConditionalEventDefinition",
          value: "bpmn:ConditionalEventDefinition"
        }
      ],
      FormalExList: [
        { label: "1小时", value: "R100/PT1H" },
        { label: "30分钟", value: "R100/PT30M" }
      ],
      RemindMsgList: [
        { label: "短信", value: "sms" },
        { label: "邮件", value: "email" },
        { label: "微信", value: "wxsms" }
      ],
      // 判断线-表达式
      exclusiveSequence: {
        conditionExpression: ""
      },
      excl: {},
      userTask: {},
      //保存加载
      fullscreenLoading: false,
      //处理人角色
      rolesUser: [],
      //调用流程
      proKey: [],
      // 表单属性设置
      // 布局设置
      LayoutSettings: [],
      //只读 必填 流程变量
      properties: [],
      //表单弹窗
      dialogVisible: false,
      // 多实例
      multiInstanceOptions: [
        { value: "Parallel", label: "并行多重事件" },
        { value: "Sequential", label: "顺序多重事件" }
      ],
      selectedMultiInstance: {
        isSequential: "",
        loopCardinality: "",
        collection: "",
        elementVariable: "",
        completionCondition: "",
        asyncBefore: false,
        asyncAfter: false,
        failedJobRetryTimeCycle: ""
      },
      // 定时器
      timeDefinitionTypeList: ["Cycle"],
      boundaryEvent: {},
      multiInstance: {},
      multiInstanceRules: {
        loopCardinality: [
          { required: true, message: "循环基数不能为空", trigger: "blur" }
        ]
      },
      token: ""
    };
  },
  computed: {
    ifTimer() {
       if (!this.element) {
        return;
      }
      return this.element.businessObject && this.element.businessObject.cancelActivity;
    },
    isProcess() {
      if (!this.element) {
        return;
      }
      return this.verifyIsProcess(this.element.type);
    },
    isEvent() {
      if (!this.element) {
        return;
      }
      return this.verifyIsEvent(this.element.type);
    },
    isTask() {
      if (!this.element) {
        return;
      }
      return this.verifyIsTask(this.element.type);
    },
    isUserTask() {
      if (!this.element) {
        return;
      }
      return this.element.type === "bpmn:UserTask";
    },

    isCallActivity() {
      if (!this.element) {
        return;
      }
      return this.element.type === "bpmn:CallActivity";
    },
    isSequenceFlow() {
      if (!this.element) {
        return;
      }
      return this.element.type === "bpmn:SequenceFlow";
    },
    isStart() {
      if (!this.element) {
        return;
      }
      return this.verifyIsStart(this.element.type);
    },
    sequenceFlow() {
      if (!this.element) {
        return;
      }
      return this.element.type === "bpmn:SequenceFlow";
    },
    isExclusiveSequenceFlow() {
      if (!this.element) {
        return;
      }
      const { businessObject } = this.element;
      if (
        businessObject &&
        businessObject.sourceRef &&
        businessObject.sourceRef.$type === "bpmn:ExclusiveGateway"
      ) {
        return true;
      }
      return false;
    },
    isGateway() {
      if (!this.element) {
        return;
      }
      return this.verifyIsGateway(this.element.type);
    },
    //定时器
    isBoundaryEvent() {
      if (!this.element) {
        return;
      }
      return this.verifyIsBoundaryEvent(this.element.type);
    },

    parentName: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    }
  },
  created() {
    this.init();
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

    //接口--处理人 获取系统所有角色
    let allList = {};
    allList.method = "post";
    allList.url = urls + "/form/getAllRoleList";
    allList.data = {};
    allList.headers = {
      token: this.token
    };
    this.$axios(allList)
      .then(response => {
        if (response.data.errorCode === 0) {
          this.rolesUser = response.data.responseBody;
        }
      })
      .catch(error => {
        console.log(error);
      });
    //接口--子流程 调用流程
    let pkey = {};
    pkey.method = "post";
    pkey.url = urls + "/app/rest/deploy/query/list";
    pkey.data = {};
    pkey.headers = {
      token: this.token
    };
    this.$axios(pkey)
      .then(response => {
        this.proKey = response.data.responseBody;
      })
      .catch(error => {
        console.log(error);
      });
  },
  methods: {
    // class处理类
    disposeTypes(val) {
      const { element } = this;
      this.disposeType = val;
      if (this.form.$type === "bpmn:UserTask") {
        let typeCla = element.businessObject.extensionElements.values;
        typeCla.forEach((item, index) => {
          if (item.$type === "flowable:ExecutionListener") {
            if(val === ''){
              element.businessObject.extensionElements.values[index].class = 'org.kingsware.flowable.process.base.BaseNodeHandler';
            }else{
              element.businessObject.extensionElements.values[index].class = val;
            }
          }
        });
      }
    },
    remindMsgs(val) {
      const { element } = this
      // this.form.remindMsg = val.toString();
      this.remindMsg = val;
      // this.remindMsg = val.split(',');
      if (this.form.$type === "bpmn:UserTask") {
        let typeCla = element.businessObject.extensionElements.values;
        typeCla.forEach((item, index) => {
          if (item.$type === "flowable:ExecutionListener") {
            let fields =
              element.businessObject.extensionElements.values[index].fields;
            fields.forEach((field, i) => {
              if (field.name === "toDoReminder") {
                element.businessObject.extensionElements.values[index].fields[i].string = val.toString();
              }
            });
          }
        });
      }
      if (this.form.$type === "bpmn:BoundaryEvent") {
        let typeCla = element.businessObject.extensionElements.values;
        typeCla.forEach((item, index) => {
          if (item.$type === "flowable:ExecutionListener") {
            let fields =
              element.businessObject.extensionElements.values[index].fields;
            fields.forEach((field, i) => {
              if (field.name === "timeOutRemind") {
                element.businessObject.extensionElements.values[index].fields[i].string = val.toString();
              }
            });
          }
        });
      }
    },
    //超时告警
    timeoutAlarm(v) {
      this.updateTime("Cycle");
      this.FormalExpression.body = v;
    },
    //时间事件定义类型修改
    updateTime(v) {
      // console.log(this.element);
      if (
        !this.element ||
        !this.element.businessObject ||
        !this.element.businessObject.eventDefinitions ||
        !this.element.businessObject.eventDefinitions[0]
      )
        return false;
      this.element.businessObject.eventDefinitions[0] = this.modeler._moddle.create(
        "bpmn:TimerEventDefinition"
      );
      let name = `time${v}`;
      this.FormalExpression = this.modeler._moddle.create(
        "bpmn:FormalExpression",
        { body: "" }
      );
      // if (name === "timeCycle") {
      //   this.$set(this.FormalExpression, "endDate", "");
      // }
      this.element.businessObject.eventDefinitions[0][name] = this.FormalExpression;
    },
    // 多选框处理人角色
    userCheckbox(v) {
      if (v) {
        this.updateProperties({ assignee: "${applyUser}" });
        this.checkedUser = "${applyUser}";
      } else {
        this.updateProperties({ assignee: "" });
        this.checkedUser = "";
      }
    },
    // 下来菜单处理人角色
    command(command, element) {
      console.log(this.form)
      this.form.assignee = command;
       console.log(this.form.assignee)
      this.updateProperties({ assignee: this.form.assignee });
    },
    randomString,
    // 监听事件
    init() {
      const that = this;
      this.modeler.on("selection.changed", e => {
        const { element } = e;
        this.remindMsg = []
        this.disposeType = ''
        that.selectedElements = e.newSelection;
        that.element = e.newSelection[0];
        that.rootElement = null;
        that.setDefaultProperties(that.element);
        
        //判断监听器的长度 大于0个结束
        if (this.listenerData.length > 0) return;
        if (that.form.$type === "bpmn:UserTask") {
          that.handleListenerCallback({
            eventType: "start",
            listenerType: "class",
            value: "org.kingsware.flowable.process.base.BaseNodeHandler"
          });
          that.handleListenerCallback({
            eventType: "end",
            listenerType: "class",
            value: "org.kingsware.flowable.process.base.BaseNodeHandler"
          });

          // if(this.element.businessObject.assignee === undefined){
          //   this.element.businessObject.assignee = '' 
          // }
        }
        if (that.form.$type === "bpmn:BoundaryEvent") {
          that.handleListenerCallback({
            eventType: "end",
            listenerType: "delegateExpression",
            value: "${timeoutReminder}"
          });
        }
      });
      this.modeler.on("element.changed", e => {
        const { element } = e;
        const { element: currentElement } = this;
        if (!currentElement) {
          return;
        }
        // update panel, if currently selected element changed
        if (element.id === currentElement.id) {
          this.element = element;
        }
      });
      this.modeler.on("element.click", e => {
        if (!that.element) {
          that.rootElement = e.element;
          that.setDefaultProperties(that.rootElement);
        }
      });
      this.modeler.on("root.added", function(e) {
        if (!that.element) {
          that.rootElement = e.element;
          that.setDefaultProperties(that.rootElement);
        }
      });
      this.modeler.on("shape.changed", 0, e => {
        const { element } = e;
        let bo = element.businessObject
        if(bo.loopCharacteristics && bo.loopCharacteristics.$type === 'bpmn:MultiInstanceLoopCharacteristics' ){
          if(!bo.loopCharacteristics.collection ){
            this.updateMultiInstanceProperty('collection','ListAssignee')
            this.updateMultiInstanceProperty('elementVariable', 'assignee')
              this.updateProperties({ assignee: '${assignee}' });
          }
          if(!bo.loopCharacteristics.completionCondition){
            this.updateFormalExpression('completionCondition','${nrOfCompletedInstances/nrOfInstances==1}')
          }
        }
      });
    },
    // 回显
    setDefaultProperties(element) {
      if (element) {
        const { businessObject } = element;
        // this.updateTime();
        console.log(businessObject);
        // 按钮配置回显
        this.buttonsList = [];
        if (businessObject.extensionElements) {
          this.buttonsList = businessObject.extensionElements.values;
          this.noUserData = businessObject.extensionElements.values;
        }
        // 线条表达式回显
        if (businessObject.conditionExpression) {
          this.excl[businessObject.id] = {
            conditionExpression: businessObject.conditionExpression.body
          };
        }
        // 多实例回显
        if (businessObject.loopCharacteristics) {
          this.multiInstance[element.id] = {
            // isSequential:businessObject.loopCharacteristics.isSequential,
            collection: businessObject.loopCharacteristics.collection,
            elementVariable: businessObject.loopCharacteristics.elementVariable,
            completionCondition:
              businessObject.loopCharacteristics.completionCondition &&
              businessObject.loopCharacteristics.completionCondition.body
            // loopCardinality:businessObject.loopCharacteristics.loopCardinality
          };
        }
        // 定时器回显
        if ( businessObject.eventDefinitions && businessObject.eventDefinitions[0]) {
          let timec = ''
            businessObject.eventDefinitions.forEach((item,index)=>{
              // if(item.$type === 'bpmn:BoundaryEvent'){
                 timec = item.timeCycle.body
              // }
          })
          this.FormalExpression.body = timec
        }
        // 提醒方式
        if (
          businessObject.extensionElements &&
          businessObject.extensionElements.values
        ) {
          let reg = "";
          let fielVal = businessObject.extensionElements.values;
          fielVal.forEach((e, i) => {
            e.fields.forEach((item, index) => {
              if (item.name == "toDoReminder") {
                reg = item.string;
              }
              if(item.name == "timeOutRemind"){
                 reg = item.string;
              }
            });
          });
          this.remindMsg = !Array.isArray(reg) && reg.split(",").filter(item => item);
        }

        this.disposeType = ''
        if ( businessObject.extensionElements &&  element.businessObject.extensionElements.values) {
          let fievalclass = element.businessObject.extensionElements.values
          fievalclass.forEach((item,index)=>{
            console.log(item)
            if(item.$type === 'flowable:ExecutionListener') {
               this.disposeType = item.class;
            }
          })
          if(this.disposeType === 'org.kingsware.flowable.process.base.BaseNodeHandler'){
            this.disposeType = ''
          }

          console.log(this.disposeType)
          console.log(element.businessObject)
          console.log( element.businessObject.extensionElements.values[0].class)
          
        }

        if ( ["bpmn:MultiInstanceLoopCharacteristics"].includes( businessObject.$type) ) {
          this.multiInstanceOptions = businessObject.conditionExpression ? "" : "";
        }
        const candidateStarterUsersNames = this.form.candidateStarterUsersNames;
        this.form = {
          ...businessObject,
          ...businessObject.$attrs
          // FormalExpression: {
          //   body: ""
          // }
          // timeDefinitionType: 'Cycle'
        };
        this.setListener(element, businessObject);
        this.setTaskListener(element, businessObject);
        this.selectedMultiInstance = this.multiInstance[element.id] || {};
        this.exclusiveSequence = this.excl[element.id] || {};
      }
    },
    setListener(element, businessObject) {
      // 执行监听器
      this.listenerData = this.listener[element.id] || [];
      if (this.listenerData.length === 0) {
        const listeners =
          extensionElementsHelper.getExtensionElements(
            businessObject,
            "flowable:ExecutionListener"
          ) || [];
        for (let i = 0; i < listeners.length; i++) {
          const listener = listeners[i];
          const listenerType = ImplementationTypeHelper.getImplementationType(
            listener
          );
          this.listenerData.push({
            id: randomString(16),
            eventType: listener.event || "",
            listenerType: listenerType,
            value: listener[listenerType]
          });
        }
        this.listener[element.id] = this.listenerData;
      }
    },
    setTaskListener(element, businessObject) {
      // 任务监听器
      this.taskListenerData = this.taskListener[element.id] || [];
      if (this.taskListenerData.length === 0) {
        const listeners =
          extensionElementsHelper.getExtensionElements(
            businessObject,
            "flowable:TaskListener"
          ) || [];
        for (let i = 0; i < listeners.length; i++) {
          const listener = listeners[i];
          const listenerType = ImplementationTypeHelper.getImplementationType(
            listener
          );
          this.taskListenerData.push({
            id: randomString(16),
            eventType: listener.event || "",
            listenerType: listenerType,
            value: listener[listenerType]
          });
        }
        this.taskListener[element.id] = this.taskListenerData;
      }
    },
    verifyIsEvent(type) {
      if (!type) return;
      return type.includes("Event");
    },
    verifyIsTask(type) {
      if (!type) return;
      return type.includes("Task");
    },
    verifyIsStart(type) {
      return type === "bpmn:StartEvent";
    },
    verifyIsGateway(type) {
      if (!type) return;
      return type.includes("Gateway");
    },
    verifyIsProcess(type) {
      if (!type) return;
      return type.includes("bpmn:Process");
    },
    verifyIsBoundaryEvent(type) {
      return type === "bpmn:BoundaryEvent";
    },
    /**
     * 改变控件触发的事件
     * @param { Object } input的Event
     * @param { String } 要修改的属性的名称
     */
    changeField(event, type) {
      const value = event.target.value;
      this.element[type] = value;
      const properties = {};
      properties[type] = value;
      if (type === "color") {
        this.onChangeColor(value);
      }
      this.updateProperties(properties);
    },
    updateName(name) {
      this.updateProperties({ name: name });
    },
    updateKey(key) {
      this.updateProperties({ id: key });
    },
    //边界事件类型选择
    changeEventType(event) {
      const { modeler, element } = this;
      const value = event.target.value;
      const bpmnReplace = modeler.get("bpmnReplace");
      bpmnReplace.replaceElement(element, {
        type: element.businessObject.$type,
        eventDefinitionType: value
      });
    },
    changeTaskType(event) {
      const { modeler, element } = this;
      const value = event.target.value;
      const bpmnReplace = modeler.get("bpmnReplace");
      bpmnReplace.replaceElement(element, {
        type: value
      });
    },
    /**
     * 更新元素属性
     * @param { Object } 要更新的属性, 例如 { name: '' }
     */
    updateProperties(properties, type) {
      const modeling = this.modeler.get("modeling");
      modeling.updateProperties(
        this.element ? this.element : this.rootElement,
        properties
      );
      console.log(this.element)
      if (type === "fkey") {
        this.$emit("update:formKey", this.fkey);
      }
    },
    // 文档描述设置
    updateDocumentation(value) {
      const bpmnFactory = this.modeler.get("bpmnFactory");
      if (value) {
        const newObjectList = [];
        newObjectList.push(
          bpmnFactory.create("bpmn:Documentation", {
            text: value
          })
        );
        const element = this.rootElement;
        const command = cmdHelper.setList(
          element,
          element.businessObject,
          "documentation",
          newObjectList
        );
        this.executeCommand(command);
      }
    },
    // 箭头类型修改
    updateConditionType(v) {
      alert(v);
      const { businessObject } = this.element;
    },
    // 条件分支设置
    updateConditionExpression() {
      if (!this.element) return;
      const { businessObject } = this.element;
      const bpmnFactory = this.modeler.get("bpmnFactory");
      const conditionOrConditionExpression = elementHelper.createElement(
        "bpmn:FormalExpression",
        {
          body: this.exclusiveSequence.conditionExpression
        },
        businessObject,
        bpmnFactory
      );
      const command = cmdHelper.updateBusinessObject(
        this.element,
        businessObject,
        {
          conditionExpression: conditionOrConditionExpression
        }
      );
      this.executeCommand(command);
      this.excl[this.element.id] = this.exclusiveSequence;
    },
    executeCommand(command) {
      const commandStack = this.modeler.get("commandStack");
      commandStack.execute(command.cmd, command.context);
    },
    // 添加监听器
    addListeners(isTaskListener) {
      this.isTaskListener = isTaskListener;
      let _this = this.$refs.FlowListener;
      if (isTaskListener) {
        _this = this.$refs.FlowTaskListener;
      }
      _this.dialog = true;
    },
    // 添加监听器
    handleListenerCallback(val) {
      const bpmnFactory = this.modeler.get("bpmnFactory");
      const element = this.rootElement ? this.rootElement : this.element;
      if (!element) return false;
      const bo = element.businessObject;
      let type = "flowable:ExecutionListener";
      let extensionElements = bo.extensionElements;
      if (!extensionElements) {
        extensionElements = elementHelper.createElement(
          "bpmn:ExtensionElements",
          { values: [] },
          bo,
          bpmnFactory
        );
        this.executeCommand(
          cmdHelper.updateBusinessObject(element, bo, {
            extensionElements: extensionElements
          })
        );
      }
      if (bo.$type === "bpmn:UserTask") {
        this.executeCommand(
          this.createExtensionElement( element, type, extensionElements, val, bpmnFactory)
        );
        extensionElements.values.forEach((e, i) => {
          let fields = [];
          if (e.event === "start") {
            let field = this.modeler._moddle.create("flowable:Field", {
              string:
                Array.isArray(this.remindMsg) && this.remindMsg.toString(),
              name: "toDoReminder"
            });
            let eventNameField = this.modeler._moddle.create("flowable:Field", {
              string: "start",
              name: "eventName"
            });
            fields[0] = eventNameField;
            fields[1] = field;
          } else if (e.event === "end") {
            let eventNameField = this.modeler._moddle.create("flowable:Field", {
              string: "end",
              name: "eventName"
            });
            fields[0] = eventNameField;
          }

          extensionElements.values[i].fields = fields;

        });
      }
      if (bo.$type === "bpmn:BoundaryEvent") {
        this.executeCommand(
          this.createExtensionElement(
            element,
            type,
            extensionElements,
            val,
            bpmnFactory
          )
        );
        extensionElements.values.forEach((e, i) => {
          let field = this.modeler._moddle.create("flowable:Field", {
            string: Array.isArray(this.remindMsg) && this.remindMsg.toString(),
            name: "timeOutRemind"
          });
          let fields = [];
          fields[0] = field;
          extensionElements.values[i].fields = fields;
        });
      }
    },
    // 创建扩展元素
    createExtensionElement(
      element,
      type,
      extensionElements,
      value,
      bpmnFactory
      ) {
      const props = {
        event: value.eventType
      };
      props[value.listenerType] = value.value;
      const newElem = elementHelper.createElement(
        type,
        props,
        extensionElements,
        bpmnFactory
      );
      return cmdHelper.addElementsTolist(element, extensionElements, "values", [
        newElem
      ]);
    },
    // 删除扩展元素
    removeExtensionElement(element, bo, type, idx) {
      const listeners =
        extensionElementsHelper.getExtensionElements(bo, type) || [];
      const listener = listeners[idx];
      if (listener) {
        return extensionElementsHelper.removeEntry(bo, element, listener);
      }
    },
    // 添加监听器
    updateListener(data, isTaskListener) {
      this.isTaskListener = isTaskListener;
      let _this = this.$refs.FlowListener;
      if (isTaskListener) {
        _this = this.$refs.FlowTaskListener;
      }
      _this.form = {
        ...data
      };
      _this.dialog = true;
    },
    // 删除监听器
    listenerDel(val, isTaskListener) {
      this.isTaskListener = isTaskListener;
      let idx;
      let type;
      const element = this.rootElement ? this.rootElement : this.element;
      const bo = element.businessObject;
      // 执行监听器
      if (!isTaskListener) {
        idx = this.listenerData.indexOf(val);
        this.listenerData.splice(idx, 1);
        type = "flowable:ExecutionListener";
      } else {
        idx = this.taskListenerData.indexOf(val);
        this.taskListenerData.splice(idx, 1);
        type = "flowable:TaskListener";
      }
      this.executeCommand(this.removeExtensionElement(element, bo, type, idx));
    },
    // 按钮配置
    addButton() {
      const _this = this.$refs.FlowButton;
      _this.multipleSelection = this.buttonsList;
      this.buttonsList.forEach(row => {
        _this.$refs.multipleTable.toggleRowSelection(row);
      });
    },
    // 无需选人
    addNoUser() {
      const _this = this.$refs.FlowNoUser;
      _this.multipleSelection = this.noUserData;
      this.noUserData.forEach(row => {
        _this.$refs.multipleTable.toggleRowSelection(row);
      });
      _this.dialog = true;
    },
    // 无需选人
    handleUserCallback(datas, row) {
      this.noUserData = datas;
      const bpmnFactory = this.modeler.get("bpmnFactory");
      const element = this.rootElement ? this.rootElement : this.element;
      const bo = element.businessObject;
      let extensionElements = bo.extensionElements;
      if (!extensionElements) {
        extensionElements = elementHelper.createElement(
          "bpmn:ExtensionElements",
          { values: [] },
          bo,
          bpmnFactory
        );
        this.executeCommand(
          cmdHelper.updateBusinessObject(element, bo, {
            extensionElements: extensionElements
          })
        );
      }
      const newElems = [];
      const props = {
        name: row.name,
        code: row.code
      };
      const newElem = elementHelper.createElement(
        "flowable:Button",
        props,
        extensionElements,
        bpmnFactory
      );
      newElems.push(newElem);
      this.executeCommand(
        cmdHelper.addElementsTolist(
          element,
          extensionElements,
          "values",
          newElems
        )
      );
    },
    //删除无需选人
    removeNoUser(data) {
      const type = "flowable:Button";
      const element = this.rootElement ? this.rootElement : this.element;
      const bo = element.businessObject;
      const va = bo.extensionElements.values;
      for (var i = 0; i < va.length; i++) {
        if (va[i].code == undefined) {
          va.splice(i, 1);
          i = i - 1;
        }
      }
      let idx = 0;
      va.forEach((e, i) => {
        if (e.code === data.code) {
          this.executeCommand(
            this.removeExtensionElement(element, bo, type, i)
          );
        }
      });
    },
    // 删除按钮配置
    removeButton(data) {
      const type = "flowable:Button";
      const element = this.rootElement ? this.rootElement : this.element;
      const bo = element.businessObject;
      const va = bo.extensionElements.values;
      let idx = 0;
      for (var i = 0; i < va.length; i++) {
        if (va[i].code == undefined) {
          va.splice(i, 1);
          i = i - 1;
        }
      }
      va.forEach((e, i) => {
        if (e.code === data.code) {
          this.executeCommand(
            this.removeExtensionElement(element, bo, type, i)
          );
        }
      });
    },
    // 按钮实例
    handleButtonCallback(datas, row) {
      this.buttonsList = datas;
      const bpmnFactory = this.modeler.get("bpmnFactory");
      const element = this.rootElement ? this.rootElement : this.element;
      const bo = element.businessObject;
      let extensionElements = bo.extensionElements;
      if (!extensionElements) {
        extensionElements = elementHelper.createElement(
          "bpmn:ExtensionElements",
          { values: [] },
          bo,
          bpmnFactory
        );
        this.executeCommand(
          cmdHelper.updateBusinessObject(element, bo, {
            extensionElements: extensionElements
          })
        );
      }
      const newElems = [];
      const props = {
        name: row.name,
        code: row.code
      };
      const newElem = elementHelper.createElement(
        "flowable:Button",
        props,
        extensionElements,
        bpmnFactory
      );
      newElems.push(newElem);
      this.executeCommand(
        cmdHelper.addElementsTolist(
          element,
          extensionElements,
          "values",
          newElems
        )
      );
    },
    // 添加多实例
    handleMultiInstance(val) {
      const { businessObject } = this.element;
      this.multiInstance[this.element.id] = this.selectedMultiInstance;
      let loopCharacteristics;
      if (val === "") {
        loopCharacteristics = undefined;
      } else {
        const moddle = this.modeler.get("moddle");
        loopCharacteristics = moddle.create(
          "bpmn:MultiInstanceLoopCharacteristics"
        );
        if (val === "Sequential") {
          loopCharacteristics.isSequential = true;
        }
      }
      this.updateProperties({
        loopCharacteristics: loopCharacteristics
      });
    },
    // 多实例 集合 元素变量
    updateFormalExpression(propertyName, newValue) {
      const bpmnFactory = this.modeler.get("bpmnFactory");
      const bo = this.element.businessObject;
      const loopCharacteristics = bo.loopCharacteristics;
      const expressionProps = {};
      if (!newValue) {
        // remove formal expression
        expressionProps[propertyName] = undefined;
        this.executeCommand(
          cmdHelper.updateBusinessObject(
            this.element,
            loopCharacteristics,
            expressionProps
          )
        );
        return;
      }
      const existingExpression = loopCharacteristics.get(propertyName);
      if (!existingExpression) {
        expressionProps[propertyName] = elementHelper.createElement(
          "bpmn:FormalExpression",
          { body: newValue },
          parent,
          bpmnFactory
        );
        this.executeCommand(
          cmdHelper.updateBusinessObject(
            this.element,
            loopCharacteristics,
            expressionProps
          )
        );
        return;
      }
      this.executeCommand(
        cmdHelper.updateBusinessObject(this.element, existingExpression, {
          body: newValue
        })
      );
    },
     // 多实例 完成条件
    updateMultiInstanceProperty(type, value) {
      const bo = this.element.businessObject;
      const loopCharacteristics = bo.loopCharacteristics;
      const pros = {};
      pros[type] = value || undefined;
      this.executeCommand(
        cmdHelper.updateBusinessObject(this.element, loopCharacteristics, pros)
      );
    },
    // 表单设置 // 打开表单属性设置弹层
    openFormFieldLayer() {
      if (!this.formKey) {
        this.$message({
          message: "请先选择表单",
          type: "warning"
        });
        return;
      }
      var temp = new URLSearchParams(location.search);
      this.token = temp.get("token");
      let params = {};
      params.method = "post";
      params.url = urls + "/process/rest/config/query/list";
      params.data = {
        formKey: this.formKey,
        processKey: this.processKey,
        nodeId: this.form.id
      };
      params.headers = {
        token: this.token
      };
      // 属性
      this.$axios(params)
        .then(response => {
          if (response.data.errorCode === 0) {
            this.properties = response.data.responseBody;
          }
        })
        .catch(error => {
          console.log(error);
        });

      // 布局设置
      let paramss = {};
      paramss.method = "post";
      paramss.url = urls + "/process/rest/hide/query/list";
      paramss.data = {
        formKey: this.formKey,
        processKey: this.processKey,
        nodeId: this.form.id
      };
      paramss.headers = {
        token: this.token
      };

      this.$axios(paramss)
        .then(response => {
          if (response.data.errorCode === 0) {
            this.LayoutSettings = response.data.responseBody;
          }
        })
        .catch(error => {
          console.log(error);
        });
      this.dialogVisible = true;
    },
    // 勾选/取消勾选复选框
    changeCheckbox(item) {
      // 只读
      if (item.column.property === "readonly") {
        if (this.properties[item.$index].readonly !== "true") {
          this.properties[item.$index].readonly = "true";
        } else {
          this.properties[item.$index].readonly = "false";
        }
      }
      // 必填
      if (item.column.property === "required") {
        if (this.properties[item.$index].required !== "true") {
          this.properties[item.$index].required = "true";
        } else {
          this.properties[item.$index].required = "false";
        }
      }
      // 流程变量
      if (item.column.property === "processVariable") {
        if (this.properties[item.$index].processVariable !== "true") {
          this.properties[item.$index].processVariable = "true";
        } else {
          this.properties[item.$index].processVariable = "false";
        }
      }
      // 隐藏
      if (item.column.property === "hide") {
        if (this.LayoutSettings[item.$index].hide !== "true") {
          this.LayoutSettings[item.$index].hide = "true";
        } else {
          this.LayoutSettings[item.$index].hide = "false";
        }
      }
    },
    // 保存表单属性设置
    confirmFormFieldLayer() {
      var temp = new URLSearchParams(location.search);
      this.token = temp.get("token");
      let list = this.properties;
      this.LayoutSettings.forEach(item => {
        let index = list.findIndex(item1 => item1.fieldId === item.fieldId);
        if (list[index]) {
          list[index].hide = item.hide;
        } else {
          list.push(item);
        }
      });
      // 保存属性设置
      let params = {};
      params.method = "post";
      params.url = urls + "/process/rest/form/config/save";
      params.data = {
        formKey: this.formKey,
        processKey: this.processKey,
        nodeId: this.form.id,
        list: list
      };
      params.headers = {
        token: this.token
      };
      this.$axios(params)
        .then(response => {
          if (response.data.errorCode === 0) {
            this.$message({
              message: "保存成功",
              type: "success"
            });
            this.closedDialog();
          } else {
            this.$message.error("保存失败");
          }
        })
        .catch(error => {
          console.log(error);
        });
      this.dialogVisible = false;
    },
    // 取消
    cancelForm() {
      this.closedDialog();
    },
    // 清空表单设置内容
    closedDialog() {
      this.properties = [];
      this.LayoutSettings = [];
      this.dialogVisible = false;
    },
    // 双向v绑定
    processDesChange(val) {
      this.$emit("update:processDes", val);
    },
    processCodeChange(val) {
      this.$emit("update:code", val);
    }
  }
};
</script>
<style lang="scss">
.el-main {
  /*背景网格*/
  background: white;
  background-image: linear-gradient(
      90deg,
      rgba(220, 220, 220, 0.5) 6%,
      transparent 0
    ),
    linear-gradient(rgba(192, 192, 192, 0.5) 6%, transparent 0);
  background-size: 20px 20px;
}
.property-panel {
  width: 398px;
}
.el_title {
  padding-left: 20px;
  padding-right: 20px;
}
.property-panel .el_input,
.property-panel .el-select {
  width: 88%;
}
.alerty {
  width: 96%;
  margin: 10px auto;
}
.maxhead {
  height: 50px;
  line-height: 50px;
  text-align: center;
}
.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.el-icon-arrow-down {
  font-size: 12px;
}

</style>
