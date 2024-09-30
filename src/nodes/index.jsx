import ToolbarNode from "./ToolbarNode";
import SelectToolbarNode from "./SelectToolbarNode";
import GroupNode from "./GroupNode";
import { ParticipantHorizontalNode, ParticipantVerticalNode, ParticipantLaneNode, ParticipantLaneSetNode } from "./Swim"
import Parallel from "./GateWay/Parallel";
import Exclusive from "./GateWay/Exclusive";
import Inclusive from "./GateWay/Inclusive";
import Start from "./Events/StartEvent";
import End from "./Events/EndEvent";
import { ParticipantLane, ParticipantHorizontal, ParticipantVertical, ParticipantLaneSet } from "./Swim/utils";
import SubProcess from "./SubProcess";

const nodeTypesArr = [
  {
    name: "Toolbar Node",
    type: "tools",
    component: ToolbarNode
  },
  {
    name: "SelectToolbarNode Node",
    type: "selecttools",
    component: SelectToolbarNode
  },
  {
    name: "Group Node",
    type: "group",
    component: GroupNode
  },
  {
    name: "水平泳道",
    type: ParticipantHorizontal,
    BPMNtype: "participant",
    component: ParticipantHorizontalNode
  },
  {
    name: "垂直泳道",
    type: ParticipantVertical,
    BPMNtype: "participant",
    component: ParticipantVerticalNode
  },
  {
    name: "泳道set",
    type: ParticipantLaneSet,
    BPMNtype: "laneSet",
    component: ParticipantLaneSetNode,
    show: false
  },
  {
    name: "子泳道",
    type: ParticipantLane,
    BPMNtype: "lane",
    component: ParticipantLaneNode,
    show: false
  },
  {
    name: "并行网关",
    type: "parallel-gateway",
    BPMNtype: "parallelGateway",
    component: Parallel
  },
  {
    name: "排他网关",
    type: "exclusive-gateway",
    BPMNtype: "exclusiveGateway",
    component: Exclusive
  },
  {
    name: "相容网关",
    type: "inclusive-gateway",
    BPMNtype: "inclusiveGateway",
    component: Inclusive
  },
  {
    name: "开始事件",
    type: "start-event",
    BPMNtype: "startEvent",
    component: Start
  },
  {
    name: "结束事件",
    type: "end-event",
    BPMNtype: "endEvent",
    component: End
  },
  {
    name: "子流程",
    type: "subProcess",
    BPMNtype: "subProcess",
    component: SubProcess
  }
]



// export const nodeTypes = {
//   tools: ToolbarNode,
//   selecttools: SelectToolbarNode,
//   group: GroupNode,
//   swimwrap: SwimWrapNode,
//   swimlane: ParticipantLaneNode,
//   "parallel-gateway": Parallel,
//   "exclusive-gateway": Exclusive,
//   "inclusive-gateway": Inclusive,
//   "start-event": Start,
//   "end-event": End,
// };

const nodeTypes = {};

const graphNodeInBPMNMap = new Map([]);
const BPMNNodeInGraphMap = new Map([]);

nodeTypesArr.forEach(nodeType => {
  nodeTypes[nodeType.type] = nodeType.component;

  graphNodeInBPMNMap.set(nodeType.type, nodeType.BPMNtype);
  BPMNNodeInGraphMap.set(nodeType.BPMNtype, nodeType.type);
})

export {
  nodeTypes,
  nodeTypesArr,
  graphNodeInBPMNMap,
  BPMNNodeInGraphMap
}