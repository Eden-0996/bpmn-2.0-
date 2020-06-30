export default class CustomPalette {
    constructor(bpmnFactory, create, elementFactory, palette, translate) {
        this.bpmnFactory = bpmnFactory;
        this.create = create;
        this.elementFactory = elementFactory;
        this.translate = translate;

        palette.registerProvider(this);
    }

    getPaletteEntries(element) {
        const {
            bpmnFactory,
            create,
            elementFactory,
            translate
        } = this;

        function createTask() {
            return function(event) {
                const businessObject = bpmnFactory.create('bpmn:UserTask');
                businessObject['custom'] = 1
                businessObject['name'] = '用户任务'
                businessObject['assignee'] = ''
                const shape = elementFactory.createShape({
                    type: 'bpmn:UserTask',
                    businessObject
                });
//              console.log(shape) // 只在拖动或者点击时触发
//              console.log('只在拖动或者点击时触发') // 只在拖动或者点击时触发
                create.start(event, shape);
            }
        }
		function createSendTask() {
		            return function(event) {
		                const businessObject = bpmnFactory.create('bpmn:CallActivity');
		                businessObject['custom'] = 1
                    businessObject['name'] = '引用子流程'
                    businessObject['inheritVariables'] = true
		                const shape = elementFactory.createShape({
		                    type: 'bpmn:CallActivity',
		                    businessObject
		                });
		                create.start(event, shape);
		            }
		        }
				
				
				
		
        return {
            'create.lindaidai-task': {
                group: 'gateway',
//              className: 'icon-custom lindaidai-task',
                className: 'bpmn-icon-user-task',
                title: translate('用户任务节点'),
                action: {
                    dragstart: createTask(),
                    click: createTask()
                }
            },
			
			'create.lindaidai-callactivity': {
				group: 'message',
			    className: 'bpmn-icon-call-activity',
			    title: translate('子流程'),
			    action: {
					dragstart: createSendTask(),
					click: createSendTask()
				}
			},
			
			
        }
			
		
    }
}

CustomPalette.$inject = [
    'bpmnFactory',
    'create',
    'elementFactory',
    'palette',
    'translate'
]