import { getHash } from "@/utils/util";

let wrapWidth = 500;
let wrapHeight = 300;
let titleWidth = 50;

let laneCount = 1;
let laneDefalutHeight = 200;
const laneMinHeight = laneDefalutHeight / 2;
const laneMinWidth = 300;

export const wrapType = 'swimwrap';
export const laneType = 'swimlane';

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
    type: laneType,
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
    // extent: 'parent',
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
  const type = wrapType;
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

function deleteLane ({ id, reactflow }) {
  const currentNode = reactflow.getNode(id);
  const parentId = currentNode.parentId;
  const currentNodeHeight = currentNode.height ?? currentNode.measured.height;

  const nodes = reactflow.getNodes();
  const laneNodes = nodes.filter(node => node.id.startsWith(parentId) && node.id !== parentId);
  const currentIndexInLaneNodes = laneNodes.findIndex(node => node.id === id);
  const isFirstNode = id === laneNodes[0].id;
  if (isFirstNode) {
    const needChangeNode = laneNodes[1];
    reactflow.updateNode(needChangeNode.id, node => {
      const height = node.height ?? node.measured.height;

      node.height = height + currentNodeHeight;
      node.position.y = 0;
      return { ...node }
    });
  } else if (id === laneNodes[laneNodes.length - 1].id) {
    const needChangeNode = laneNodes[laneNodes.length - 2];
    reactflow.updateNode(needChangeNode.id, node => {
      const height = node.height ?? node.measured.height;

      node.height = height + currentNodeHeight;
      return { ...node }
    });
  } else {
    const needChangeNode1 = laneNodes[currentIndexInLaneNodes - 1];
    const needChangeNode2 = laneNodes[currentIndexInLaneNodes + 1];

    reactflow.updateNode(needChangeNode1.id, node => {
      const height = node.height ?? node.measured.height;

      node.height = height + (currentNodeHeight / 2);
      return { ...node }
    });

    reactflow.updateNode(needChangeNode2.id, node => {
      const height = node.height ?? node.measured.height;
      node.height = height + (currentNodeHeight / 2);

      const y = node.position.y;
      node.position.y = y - (currentNodeHeight / 2);
      return { ...node }
    });
  }

}

export {
  createSwimLaneNode,
  createLane,
  laneMinWidth,
  laneMinHeight,
  laneDefalutHeight,
  titleWidth,
  deleteLane
}