import { getHash } from "@/utils/util";

let wrapWidth = 500;
let wrapHeight = 300;
let titleWidth = 50;

let laneCount = 1;
let laneDefalutHeight = 200;
const laneMinHeight = laneDefalutHeight / 2;
const laneMinWidth = 300;

function laneCountIncrease() {
  laneCount++
}

function createLane ({
  parentId,
  parentWidth,
  height,
  positionY = 0
}) {
  const laneNode = {
    id: `${parentId}-${laneCount}`,
    type: 'swimlane',
    position: {
      x: titleWidth,
      y: positionY
    },
    style: {
      width: parentWidth - titleWidth,
      height: height ?? laneDefalutHeight
    },
    data: { label: `children node${laneCount}` },
    parentId: parentId,
    extent: 'parent',
    draggable: false,
    zIndex: 6
  }

  laneCountIncrease();

  return laneNode;
}

function createWrap ({
  position,
  id
}) {
  const nodeId = id ?? getHash();
  const type = 'swimwrap';
  const wrapNode = {
    id: nodeId,
    type,
    position,
    style: {
      border: `1px solid red`,
      width: wrapWidth,
      height: wrapHeight
    },
    // 传入节点 data
    data: { label: `${type} node` },
    zIndex: 5
  };

  return wrapNode;
}

function createSwimLaneNode({
  position
}) {
  const id = getHash();
  const wrapNode = createWrap({ id, position });
  const laneNode = createLane({ parentId: id, parentWidth: wrapWidth, height: wrapHeight });

  return [wrapNode, laneNode];
}

export {
  createSwimLaneNode,
  createLane,
  laneMinWidth,
  laneMinHeight,
  laneDefalutHeight,
  titleWidth
}