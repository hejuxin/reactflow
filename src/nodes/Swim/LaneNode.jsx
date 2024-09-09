import React, { memo, useState, useMemo, useRef, useEffect } from 'react';
import { NodeResizer, NodeToolbar, useNodes, useReactFlow } from '@xyflow/react';
import cn from 'classnames';
import { createLane, laneDefalutHeight, laneMinHeight, laneMinWidth } from './utils';
import { useResize } from './useResize'
import './index.less';
import { Button } from 'antd';
import { Position } from '@xyflow/react';

const LaneNode = (props) => {
  const { selected: pselected = false, id, parentId } = props;
  const [selected, setSelected] = useState(false);

  const reactflow = useReactFlow();
  const nodes = useNodes();
  const currentNode = reactflow.getNode(id);
  const laneNodes = nodes.filter(node => node.id.startsWith(parentId) && node.id !== parentId);
  const currentIndexInLaneNodes = laneNodes.findIndex(node => node.id === id);
  const isFirstNode = id === laneNodes[0].id;

  const { handleResizeStart, handleResize, handleResizeEnd, shouldResize, maxHeight } = useResize(id, parentId);

  useEffect(() => {
    if (selected) {
      reactflow.updateNode(id, (node) => {
        // node.extent = '';
        const _node = { ...node };
        delete _node.extent;
        return _node
      }, { replace: true })
    }
  }, [selected])

  useEffect(() => {
    if (pselected && laneNodes.length !== 1) {
      setSelected(true);
      return;
    }
    setSelected(false);
  }, [pselected, laneNodes])

  const resizerprops = useMemo(() => {
    const newProps = {};

    if (maxHeight) {
      newProps.maxHeight = maxHeight
    } else {
      delete newProps.maxHeight
    }

    return newProps

  }, [maxHeight]);


  const handleAdd = (pos) => {
    const parentNode = reactflow.getNode(parentId);
    const positionY = currentNode.position.y;

    const currentNodeIndex = nodes.findIndex(node => node.id === id);

    const newNodes = [...nodes];
    if (pos === 'up') {
      const laneNode = createLane({
        parentId: parentId,
        parentWidth: parentNode.width ?? parentNode.measured.width,
        positionY
      });

      newNodes.splice(currentNodeIndex, 0, laneNode);
      const needChangeNodes = laneNodes.slice(currentIndexInLaneNodes);

      needChangeNodes.forEach(node => {
        reactflow.updateNode(node.id, node => {
          const y = node.position.y;
          node.position.y = y + laneDefalutHeight;
          return { ...node }
        });
      });

      reactflow.setNodes(newNodes);

      reactflow.updateNode(parentId, (node) => {
        node.width = node.width ?? node.measured.width;
        node.height = (node.height ?? node.measured.height) + laneDefalutHeight;
        const y = node.position.y;
        node.position.y = y - laneDefalutHeight;
        return { ...node }
      }, { replace: true })

    } else {
      const laneNode = createLane({
        parentId: parentId,
        parentWidth: parentNode.width ?? parentNode.measured.width,
        positionY: positionY + (currentNode.height ?? currentNode.measured.height)
      });

      newNodes.splice(currentNodeIndex + 1, 0, laneNode);
      const needChangeNodes = laneNodes.slice(currentIndexInLaneNodes + 1);

      needChangeNodes.forEach(node => {
        reactflow.updateNode(node.id, node => {
          const y = node.position.y;
          node.position.y = y + laneDefalutHeight;
          return { ...node }
        });
      });

      reactflow.setNodes(newNodes);

      reactflow.updateNode(parentId, (node) => {
        node.width = node.width ?? node.measured.width;
        node.height = (node.height ?? node.measured.height) + laneDefalutHeight;
        return { ...node }
      }, { replace: true })
    }

  }


  const handleDel = () => {
    console.log(currentNode, 'currentNode')
    reactflow.deleteElements({
      nodes: [{ id }]
    });

    const currentNodeHeight = currentNode.height ?? currentNode.measured.height;

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

  return (
    <div className={cn('laneWrap', { 'noTopborder': isFirstNode })}>
      <NodeResizer
        color="#0095ff"
        isVisible={selected}
        minWidth={laneMinWidth}
        minHeight={laneMinHeight}
        // maxHeight={100}
        shouldResize={shouldResize}
        onResize={handleResize}
        onResizeStart={handleResizeStart}
        onResizeEnd={handleResizeEnd}
        {...resizerprops}
      />
      <NodeToolbar
        isVisible={selected}
        position={Position.Right}
        style={{ background: '#fff' }}
      >
        <Button type='link' onClick={() => handleAdd('up')}>向上加一行</Button>
        <Button type='link' onClick={() => handleAdd('down')}>向下加一行</Button>
        <Button type='link' onClick={handleDel}>删除</Button>
      </NodeToolbar>
      {props.data?.label}
    </div>
  )
}

export default memo(LaneNode);