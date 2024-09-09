import ToolbarNode from "./ToolbarNode";
import SelectToolbarNode from "./SelectToolbarNode";
import GroupNode from "./GroupNode";
import { SwimLaneNode, SwimWrapNode } from './Swim'
import Parallel from "./GateWay/Parallel";
import Exclusive from "./GateWay/Exclusive";
import Inclusive from "./GateWay/Inclusive";
import Start from "./Events/StartEvent";
import End from "./Events/EndEvent";
import { laneType, wrapType } from "./Swim/utils";

const nodeTypesArr = [
  {
    name: 'Toolbar Node',
    type: 'tools',
    component: ToolbarNode
  },
  {
    name: 'SelectToolbarNode Node',
    type: 'selecttools',
    component: SelectToolbarNode
  },
  {
    name: 'Group Node',
    type: 'group',
    component: GroupNode
  },
  {
    name: '泳道',
    type: wrapType,
    component: SwimWrapNode
  },
  {
    name: '子泳道',
    type: laneType,
    component: SwimLaneNode,
    show: false
  },
  {
    name: "并行网关",
    type: 'parallel-gateway',
    component: Parallel
  },
  {
    name: "排他网关",
    type: 'exclusive-gateway',
    component: Exclusive
  },
  {
    name: "相容网关",
    type: 'inclusive-gateway',
    component: Inclusive
  },
  {
    name: "开始事件",
    type: 'start-event',
    component: Start
  },
  {
    name: "结束事件",
    type: 'end-event',
    component: End
  }
]



// export const nodeTypes = {
//   tools: ToolbarNode,
//   selecttools: SelectToolbarNode,
//   group: GroupNode,
//   swimwrap: SwimWrapNode,
//   swimlane: SwimLaneNode,
//   "parallel-gateway": Parallel,
//   "exclusive-gateway": Exclusive,
//   "inclusive-gateway": Inclusive,
//   "start-event": Start,
//   "end-event": End,
// };

const nodeTypes = {};
nodeTypesArr.forEach(nodeType => {
  nodeTypes[nodeType.type] = nodeType.component
})

export {
  nodeTypes,
  nodeTypesArr
}
