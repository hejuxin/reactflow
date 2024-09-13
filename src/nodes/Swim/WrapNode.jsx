import React, { memo, useRef } from 'react';
import { NodeResizer, NodeToolbar, useNodeId, useNodes, useReactFlow } from '@xyflow/react';
import { Position } from '@xyflow/react';
import { Button } from 'antd';
import { createLane, titleWidth, laneMinWidth, laneDefalutHeight, ParticipantLane, getLaneNodes } from './utils';
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
    const laneNodes = getLaneNodes({ nodes, parentId: id });

    if (pos === 'up') {
      const newNodes = [...nodes];

      if (laneNodes.length === 0) {
        laneNode.style.height = props.height;
        const laneNode1 = createLane({
          parentId: id,
          parentWidth: props.width,
          positionY: props.height
        });

        newNodes.splice(nodeIndex + 1, 0, laneNode, laneNode1);
      } else {
        newNodes.splice(nodeIndex + 1, 0, laneNode);
      }

      const needChangeNodes = nodes.filter(node => node.id.startsWith(id));
      needChangeNodes.forEach(node => {
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
        laneNode.style.height = props.height;
        const laneNode1 = createLane({
          parentId: id,
          parentWidth: props.width,
          positionY: props.height
        });

        reactflow.addNodes([laneNode, laneNode1]);
      } else {
        laneNode.position.y = props.height;
        reactflow.addNodes(laneNode);
      }
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
        <div className='title' style={{ width: titleWidth }}>
          <div>title</div>
        </div>
      </div>
    </>
  )
}

export default memo(WrapNode);