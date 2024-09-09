import React, { memo, useRef } from 'react';
import { NodeResizer, NodeToolbar, useNodeId, useNodes, useReactFlow } from '@xyflow/react';
import { Position } from '@xyflow/react';
import { Button } from 'antd';
import { createLane, titleWidth, laneMinWidth, laneDefalutHeight, laneType } from './utils';
import './index.less';
import { useResizeWrap } from './useResize';

const WrapNode = (props) => {
  const { selected = false, data, id } = props;
  const reactflow = useReactFlow();
  const nodes = useNodes();

  const { handleResizeStart, handleResizeEnd } = useResizeWrap(id);
  
  const handleAdd = (pos) => {
    const laneNode = createLane({ parentId: id, parentWidth: props.width });
    const nodeIndex = nodes.findIndex(node => node.id === id);

    if (pos === 'up') {
      const newNodes = [...nodes];
      newNodes.splice(nodeIndex + 1, 0, laneNode);

      const needChangeNodes = nodes.filter(node => node.id.startsWith(id));
      needChangeNodes.forEach(node => {
        reactflow.updateNode(node.id, node => {
          const y = node.position.y;
          if (node.type === laneType) {
            node.position.y = y + laneDefalutHeight;
          } else {
            node.position.y = y - laneDefalutHeight;
          }
          return { ...node }
        });
      });
      reactflow.setNodes(newNodes);
    } else {
      laneNode.position.y = props.height;
      reactflow.addNodes(laneNode);
    }

    reactflow.updateNode(id, (node) => {
      node.width = props.width;
      node.height = props.height + laneDefalutHeight
      return { ...node }
    }, { replace: true })
  }

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
        <div className='title' style={{ width: titleWidth }}>title</div>
      </div>
    </>
  )
}

export default memo(WrapNode);