import {
  SelectToolbarNode,
  ToolbarNode,
  GroupNode,
  SwimNode,
  Parallel,
  Exclusive,
  Inclusive,
  Start,
  End,
  SwimWrapNode,
  SwimLaneNode,
} from "./nodes";

export const nodeTypes = {
  tools: ToolbarNode,
  selecttools: SelectToolbarNode,
  group: GroupNode,
  swimwrap: SwimWrapNode,
  swimlane: SwimLaneNode,
  swimming: SwimNode,
  "parallel-gateway": Parallel,
  "exclusive-gateway": Exclusive,
  "inclusive-gateway": Inclusive,
  "start-event": Start,
  "end-event": End,
};
