import { getHash } from "@/utils/util";

let wrapWidth = 500;
let wrapHeight = 300;
let titleWidth = 50;

let laneCount = 1;
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
  parentWidth,
  height,
  positionY = 0,
  id = `${parentId}-${laneCount}`,
}) {
  const laneNode = {
    id,
    type: ParticipantLane,
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
      border: `1px solid red`,
      width: wrapWidth,
      height: wrapHeight
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
  const laneNode = createLane({ parentId: id, parentWidth: wrapWidth, height: wrapHeight });

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

function handleAddLane(params) {
  if (params.isLane ?? true) {
    handleAddLaneOnLaneNode(params);
  } else {
    handleAddLaneOnWrapNode(params);
  }
}

function handleAddLaneOnLaneNode({ direction, reactflow, id, parentId }) {
  const nodes = reactflow.getNodes();
  const laneNodes = getLaneNodes({ nodes, parentId });
  const parentNode = reactflow.getNode(parentId);
  const currentNode = reactflow.getNode(id);
  const positionY = currentNode.position.y;

  const currentNodeIndex = nodes.findIndex(node => node.id === id);

  const currentIndexInLaneNodes = laneNodes.findIndex(node => node.id === id);

  const newNodes = [...nodes];
  if (direction === 'up') {
    const laneNode = createLane({
      parentId: parentId,
      parentWidth: parentNode.width ?? parentNode.measured.width,
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
      parentId: parentId,
      parentWidth: parentNode.width ?? parentNode.measured.width,
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

function handleAddLaneOnWrapNode({ direction, reactflow, id }) {
  const nodes = reactflow.getNodes();
  const parentNode = reactflow.getNode(id);
  const parentWidth = parentNode.width ?? parentNode.measured.width;
  const parentHeight = parentNode.height ?? parentNode.measured.height;
  const nodeIndex = nodes.findIndex(node => node.id === id);
  const laneNodes = getLaneNodes({ nodes, parentId: id });

  const laneNode = createLane({ parentId: id, parentWidth });

  if (direction === 'up') {
    const newNodes = [...nodes];

    if (laneNodes.length === 0) {
      laneNode.style.height = parentHeight;
      const laneNode1 = createLane({
        parentId: id,
        parentWidth,
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
        if (node.type === ParticipantLane) {
          node.position.y = y + laneDefalutHeight;
        } else {
          node.position.y = y - laneDefalutHeight;
        }
        return { ...node }
      });
    });

    reactflow.setNodes(newNodes);
  } else {
    if (laneNodes.length === 0) {
      laneNode.style.height = parentHeight;
      const laneNode1 = createLane({
        parentId: id,
        parentWidth: parentWidth,
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
  handleAddLane
}