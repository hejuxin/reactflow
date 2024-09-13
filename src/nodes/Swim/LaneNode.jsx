import React, { memo, useState, useMemo, useRef, useEffect } from 'react';
import { NodeResizer, NodeToolbar, useNodes, useReactFlow } from '@xyflow/react';
import cn from 'classnames';
import { createLane, laneDefalutHeight, laneMinHeight, laneMinWidth, deleteLane, getLaneNodes, handleAddLane } from './utils';
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
  const laneNodes = getLaneNodes({ nodes, parentId });
  const currentIndexInLaneNodes = laneNodes.findIndex(node => node.id === id);
  const isFirstNode = id === laneNodes[0].id;

  const { handleResizeStart, handleResize, handleResizeEnd, shouldResize, maxHeight } = useResize(id, parentId);

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

  const handleAdd = (direction) => handleAddLane({ direction, reactflow, id, parentId });


  const handleDel = () => {
    reactflow.deleteElements({
      nodes: [{ id }]
    });
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