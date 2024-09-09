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
  const nodeIndex = nodes.findIndex(node => node.id === id);
  const laneNodes = nodes.filter(node => node.id.startsWith(parentId) && node.id !== parentId);
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
    const currentNode = reactflow.getNode(id);

    const positionY = currentNode.position.y;

    const nodeIndexInLaneNodes = laneNodes.findIndex(node => node.id === id);

    const newNodes = [...nodes];
    if (pos === 'up') {
      const laneNode = createLane({
        parentId: parentId,
        parentWidth: parentNode.width ?? parentNode.measured.width,
        positionY
      });

      newNodes.splice(nodeIndex, 0, laneNode);
      const needChangeNodes = laneNodes.slice(nodeIndexInLaneNodes);

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

      newNodes.splice(nodeIndex + 1, 0, laneNode);
      const needChangeNodes = laneNodes.slice(nodeIndexInLaneNodes + 1);

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

  return (
    <div className={cn('laneWrap', { 'noTopborder': isFirstNode })}>
      <NodeResizer
        color="#ff0071"
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
      </NodeToolbar>
      {props.data?.label}
    </div>
  )
}

export default memo(LaneNode);