import { getHash } from "@/utils/util";
import { Position } from "@xyflow/react";

let wrapWidth = 500;
let wrapHeight = 300;
let titleWidth = 50;

let laneCount = 1;
let laneDefalutWidth = 200;
let laneDefalutHeight = 200;
const laneMinHeight = laneDefalutHeight / 2;
const laneMinWidth = 300;

export const ParticipantHorizontal = 'ParticipantHorizontal';
export const ParticipantVertical = 'ParticipantVertical';
export const ParticipantLane = 'ParticipantLane';

function laneCountIncrease() {
  laneCount++
}

function createLane({
  parentId,
  width = laneDefalutWidth,
  height = laneDefalutHeight,
  positionX = 0,
  positionY = 0,
  id = `${parentId}-${laneCount}`,
}) {
  const laneNode = {
    id,
    type: ParticipantLane,
    position: {
      x: positionX,
      y: positionY
    },
    style: {
      width,
      height
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

function createParticipant({
  position,
  id,
  isHorizontal = true
}) {
  let node = {};
  if (isHorizontal) {
    node = createParticipantHorizontal({ position, id });
  } else {
    node = createParticipantVertical({ position, id });
  }

  return node;
}

function createParticipantHorizontal({
  position,
  id
}) {
  const nodeId = id ?? getHash();
  const type = ParticipantHorizontal;
  const node = {
    id: nodeId,
    type,
    position,
    style: {
      width: wrapWidth,
      height: wrapHeight
    },
    // 传入节点 data
    data: { label: `${type} node` },
    zIndex: 5
  };

  return node;
}

function createParticipantVertical({
  position,
  id
}) {
  const nodeId = id ?? getHash();
  const type = ParticipantVertical;
  const node = {
    id: nodeId,
    type,
    position,
    style: {
      width: wrapHeight,
      height: wrapWidth
    },
    // 传入节点 data
    data: { label: `${type} node` },
    zIndex: 5
  };

  return node;
}

function createSwimLaneNode({
  position,
  id = getHash()
}) {
  const wrapNode = createParticipant({ id, position });
  const laneNode = createLane({ parentId: id, width: wrapWidth - titleWidth, height: wrapHeight });

  return [wrapNode, laneNode];
}

function deleteLane({ id, reactflow }) {
  const currentNode = reactflow.getNode(id);
  const parentId = currentNode.parentId;
  const currentNodeHeight = currentNode.height ?? currentNode.measured.height;

  const nodes = reactflow.getNodes();
  const laneNodes = getLaneNodes({ nodes, parentId });
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


function getLaneNodes({ nodes, parentId }) {
  return nodes.filter(n => n.parentId === parentId && n.type === ParticipantLane);
}

function handleAddLaneHorizontal(isLane = true) {
  return isLane ? handleAddLaneOnLaneNodeHorizontal : handleAddLaneOnWrapNodeHorizontal
}

function handleAddLaneOnLaneNodeHorizontal({ direction, reactflow, id, parentId }) {
  const nodes = reactflow.getNodes();
  const laneNodes = getLaneNodes({ nodes, parentId });
  const parentNode = reactflow.getNode(parentId);
  const currentNode = reactflow.getNode(id);
  const positionY = currentNode.position.y;

  const currentNodeIndex = nodes.findIndex(node => node.id === id);

  const currentIndexInLaneNodes = laneNodes.findIndex(node => node.id === id);

  const parentWidth = parentNode.width ?? parentNode.measured.width;
  const laneParams = { parentId, width: parentWidth - titleWidth, positionX: titleWidth };

  const newNodes = [...nodes];
  if (direction === Position.Top) {
    const laneNode = createLane({
      ...laneParams,
      positionY
    });

    newNodes.splice(currentNodeIndex, 0, laneNode);
    reactflow.setNodes(newNodes);
    // reactflow.addNodes(laneNode);

    const needChangeNodes = laneNodes.slice(currentIndexInLaneNodes);

    needChangeNodes.forEach(node => {
      reactflow.updateNode(node.id, node => {
        const y = node.position.y;
        node.position.y = y + laneDefalutHeight;
        return { ...node }
      });
    });



    reactflow.updateNode(parentId, (node) => {
      node.width = node.width ?? node.measured.width;
      node.height = (node.height ?? node.measured.height) + laneDefalutHeight;
      const y = node.position.y;
      node.position.y = y - laneDefalutHeight;
    })

    // onWrapPositionYChangeEffect({ reactflow, parentId })


  } else {
    const laneNode = createLane({
      ...laneParams,
      positionY: positionY + (currentNode.height ?? currentNode.measured.height)
    });

    newNodes.splice(currentNodeIndex + 1, 0, laneNode);
    reactflow.setNodes(newNodes);
    // reactflow.addNodes(laneNode);

    const needChangeNodes = laneNodes.slice(currentIndexInLaneNodes + 1);

    needChangeNodes.forEach(node => {
      reactflow.updateNode(node.id, node => {
        const y = node.position.y;
        node.position.y = y + laneDefalutHeight;
        return { ...node }
      });
    });

    reactflow.updateNode(parentId, (node) => {
      node.width = node.width ?? node.measured.width;
      node.height = (node.height ?? node.measured.height) + laneDefalutHeight;
      return { ...node }
    }, { replace: true })
  }
}

function handleAddLaneOnWrapNodeHorizontal({ direction, reactflow, id }) {
  const nodes = reactflow.getNodes();
  const parentNode = reactflow.getNode(id);
  const parentWidth = parentNode.width ?? parentNode.measured.width;
  const parentHeight = parentNode.height ?? parentNode.measured.height;
  const nodeIndex = nodes.findIndex(node => node.id === id);
  const laneNodes = getLaneNodes({ nodes, parentId: id });

  const laneParams = { parentId: id, width: parentWidth - titleWidth, positionX: titleWidth };
  const laneNode = createLane(laneParams);

  if (direction === Position.Top) {
    const newNodes = [...nodes];

    if (laneNodes.length === 0) {
      laneNode.style.height = parentHeight;
      const laneNode1 = createLane({
        ...laneParams,
        positionY: parentHeight
      });

      newNodes.splice(nodeIndex + 1, 0, laneNode, laneNode1);
    } else {
      newNodes.splice(nodeIndex + 1, 0, laneNode);
    }

    reactflow.updateNode(id, node => {
      const y = node.position.y;
      node.position.y = y - laneDefalutHeight;
    })

    laneNodes.forEach(node => {
      reactflow.updateNode(node.id, node => {
        const y = node.position.y;
        node.position.y = y + laneDefalutHeight;
        return { ...node }
      });
    });

    reactflow.setNodes(newNodes);
  } else {
    if (laneNodes.length === 0) {
      laneNode.style.height = parentHeight;
      const laneNode1 = createLane({
        ...laneParams,
        positionY: parentHeight
      });

      reactflow.addNodes([laneNode, laneNode1]);
    } else {
      laneNode.position.y = parentHeight;
      reactflow.addNodes(laneNode);
    }
  }

  reactflow.updateNode(id, (node) => {
    node.width = parentWidth;
    node.height = parentHeight + laneDefalutHeight
    return { ...node }
  }, { replace: true })
}


function handleAddLaneVertical(isLane = true) {
  return isLane ? handleAddLaneOnLaneNodeVertical : handleAddLaneOnWrapNodeVertical
}

function handleAddLaneOnLaneNodeVertical({ direction, reactflow, id, parentId }) {
  console.log('handleAddLaneOnLaneNodeVertical')
  const nodes = reactflow.getNodes();
  const laneNodes = getLaneNodes({ nodes, parentId });
  const parentNode = reactflow.getNode(parentId);
  const currentNode = reactflow.getNode(id);
  const positionY = currentNode.position.y;
  const positionX = currentNode.position.x;

  const currentNodeIndex = nodes.findIndex(node => node.id === id);

  const currentIndexInLaneNodes = laneNodes.findIndex(node => node.id === id);

  const parentWidth = parentNode.width ?? parentNode.measured.width;
  const parentHeight = parentNode.height ?? parentNode.measured.height;
  const laneParams = { parentId, height: parentHeight - titleWidth, positionY: titleWidth };

  const newNodes = [...nodes];
  if (direction === Position.Left) {
    const laneNode = createLane({
      ...laneParams,
      positionX
    });

    
    newNodes.splice(currentNodeIndex, 0, laneNode);
    console.log(newNodes);
    reactflow.setNodes(newNodes);
    // reactflow.addNodes(laneNode);

    const needChangeNodes = laneNodes.slice(currentIndexInLaneNodes);
    console.log(needChangeNodes, 'needChangeNodes')

    needChangeNodes.forEach(node => {
      reactflow.updateNode(node.id, node => {
        const x = node.position.x;
        node.position.x = x + laneDefalutWidth;
        return { ...node }
      });
    });



    reactflow.updateNode(parentId, (node) => {
      node.width = (node.width ?? node.measured.width) + laneDefalutWidth;
      node.height = (node.height ?? node.measured.height);
      const x = node.position.x;
      node.position.x = x - laneDefalutWidth;
    })

    // onWrapPositionYChangeEffect({ reactflow, parentId })


  } else {
    const laneNode = createLane({
      ...laneParams,
      positionX: positionX + (currentNode.width ?? currentNode.measured.width)
    });

    newNodes.splice(currentNodeIndex + 1, 0, laneNode);
    reactflow.setNodes(newNodes);
    // reactflow.addNodes(laneNode);

    const needChangeNodes = laneNodes.slice(currentIndexInLaneNodes + 1);

    needChangeNodes.forEach(node => {
      reactflow.updateNode(node.id, node => {
        const x = node.position.x;
        node.position.x = x + laneDefalutHeight;
        return { ...node }
      });
    });

    reactflow.updateNode(parentId, (node) => {
      node.width = (node.width ?? node.measured.width) + laneDefalutWidth;
      node.height = (node.height ?? node.measured.height);
      return { ...node }
    }, { replace: true })
  }
}
function handleAddLaneOnWrapNodeVertical({ direction, reactflow, id }) {
  const nodes = reactflow.getNodes();
  const parentNode = reactflow.getNode(id);
  const parentWidth = parentNode.width ?? parentNode.measured.width;
  const parentHeight = parentNode.height ?? parentNode.measured.height;
  const nodeIndex = nodes.findIndex(node => node.id === id);
  const laneNodes = getLaneNodes({ nodes, parentId: id });

  const laneParams = { parentId: id, height: parentHeight - titleWidth, positionY: titleWidth };
  const laneNode = createLane(laneParams);

  if (direction === Position.Left) {
    const newNodes = [...nodes];

    if (laneNodes.length === 0) {
      laneNode.style.width = parentWidth;
      const laneNode1 = createLane({
        ...laneParams,
        positionX: parentWidth
      });

      newNodes.splice(nodeIndex + 1, 0, laneNode, laneNode1);
    } else {
      newNodes.splice(nodeIndex + 1, 0, laneNode);
    }

    reactflow.updateNode(id, node => {
      const x = node.position.x;
      node.position.x = x - laneDefalutWidth;
    })

    laneNodes.forEach(node => {
      reactflow.updateNode(node.id, node => {
        const x = node.position.x;
        node.position.x = x + laneDefalutWidth;
        return { ...node }
      });
    });

    reactflow.setNodes(newNodes);
  } else {
    if (laneNodes.length === 0) {
      laneNode.style.width = parentWidth;
      const laneNode1 = createLane({
        ...laneParams,
        positionX: parentWidth
      });

      reactflow.addNodes([laneNode, laneNode1]);
    } else {
      laneNode.position.x = parentWidth;
      reactflow.addNodes(laneNode);
    }
  }

  reactflow.updateNode(id, (node) => {
    node.width = parentWidth + laneDefalutWidth;
    node.height = parentHeight;
    return { ...node }
  }, { replace: true })
}

// todo
let preNodeEndY = 0;
function onWrapPositionYChangeEffect({ reactflow, parentId }) {
  const nodes = reactflow.getNodes();
  const laneNodes = getLaneNodes({ nodes, parentId });

  console.log(laneNodes, 'onWrapPositionYChangeEffect')

  laneNodes.forEach(node => {
    reactflow.updateNode(node.id, node => {
      // const y = node.position.y;
      node.position.y = preNodeEndY;
      preNodeEndY = preNodeEndY + (node.height ?? node.measured.height);
    });
  });
}

export {
  createSwimLaneNode,
  createParticipant,
  createLane,
  laneMinWidth,
  laneMinHeight,
  laneDefalutHeight,
  titleWidth,
  deleteLane,
  getLaneNodes,
  handleAddLaneHorizontal,
  handleAddLaneVertical
}