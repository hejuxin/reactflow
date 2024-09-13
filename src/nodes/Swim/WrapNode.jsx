import React, { memo, useRef } from 'react';
import { NodeResizer, NodeToolbar, useNodeId, useNodes, useReactFlow } from '@xyflow/react';
import { Position } from '@xyflow/react';
import { Button } from 'antd';
import { createLane, titleWidth, laneMinWidth, laneDefalutHeight, ParticipantLane, getLaneNodes, handleAddLane } from './utils';
import './index.less';
import { useResizeWrap } from './useResize';

const WrapNode = (props) => {
  const { selected = false, data, id } = props;
  const reactflow = useReactFlow();

  const { handleResizeStart, handleResizeEnd } = useResizeWrap(id);

  const handleAdd = (direction) => handleAddLane({ direction, reactflow, id, isLane: false });

  const handleDel = () => {
    reactflow.deleteElements({
      nodes: [{ id }]
    })
  }

  return (
    <>
      <NodeResizer
        color="#0095ff"
        isVisible={selected}
        minWidth={laneMinWidth + titleWidth}
        // todo
        // minHeight={wrapHeight / 2}
        onResizeStart={handleResizeStart}
        onResizeEnd={handleResizeEnd}
      />
      <NodeToolbar
        position={Position.Right}
        style={{ background: '#fff' }}
      >
        <Button type='link' onClick={() => handleAdd('up')}>向上加一行</Button>
        <Button type='link' onClick={() => handleAdd('down')}>向下加一行</Button>
        <Button type='link' onClick={handleDel}>删除</Button>
      </NodeToolbar>
      <div className='swinWrap'>
        <div className='title' style={{ width: titleWidth }}>
          <div>title</div>
        </div>
      </div>
    </>
  )
}

export default memo(WrapNode);