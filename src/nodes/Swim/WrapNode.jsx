import React, { memo, useRef } from 'react';
import { NodeResizer, NodeToolbar, useNodeId, useNodes, useReactFlow } from '@xyflow/react';
import { Position } from '@xyflow/react';
import { Button } from 'antd';
import { createLane, titleWidth, laneMinWidth, laneDefalutHeight } from './utils';
import './index.less';

const WrapNode = (props) => {
  const { selected = false, data, id } = props;
  const nodes = useNodes();
  const nodeIndex = nodes.findIndex(node => node.id === id);
  const reactflow = useReactFlow();
  const posRef = useRef();
  const startSize = useRef();

  const handleAdd = (pos) => {
    const laneNode = createLane({ parentId: id, parentWidth: props.width });

    if (pos === 'up') {
      const newNodes = [...nodes];
      newNodes.splice(nodeIndex + 1, 0, laneNode);

      const needChangeNodes = nodes.filter(node => node.id.startsWith(id));
      needChangeNodes.forEach(node => {
        reactflow.updateNode(node.id, node => {
          const y = node.position.y;
          if (node.type === 'swimlane') {
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

  const handleResizeStart = e => {
    startSize.current = {
      width: props.width,
      height: props.height
    }

    const node = nodes.find(node => node.id === id);
    const laneNodes = nodes.filter(node => node.id.startsWith(id) && node.id !== id);

    // laneNodes.forEach(node => {
    //   reactflow.updateNode(node.id, (node) => {
    //     node.extent = '';
    //     return { ...node }
    //   })
    // })

    console.log(props, 'handleResizeStart', node)
    const className = e.sourceEvent.target.className;
    console.log(className, 'className')
    let pos;
    const keys = Object.keys(Position);
    for (const key of keys) {
      console.log(key, 'key')
      if (className.includes(Position[key])) {
        pos = Position[key];
        break;
      }
    }

    posRef.current = pos;
    // const isTop = e.sourceEvent.target.className.includes('top');
    // isTopRef.current = isTop;
    // const isLeft = e.sourceEvent.target.className.includes('left');
    // isLeftRef.current = isLeft;
  }

  const handleResizeEnd = e => {
    const laneNodes = nodes.filter(node => node.id.startsWith(id) && node.id !== id);

    // laneNodes.forEach(node => {
    //   reactflow.updateNode(node.id, {
    //     width: width - titleWidth,
    //     position: {
    //       x: titleWidth
    //     }
    //   })

    const node = nodes.find(node => node.id === id);
    const width = node.measured.width;
    const height = node.measured.height;
    const { width: startWidth, height: startHeight } = startSize.current;

    console.log(width, laneNodes, 'ddd', startWidth)
    console.log(node.width, node.measured.width)

    if (posRef.current === Position.Left) {
      // if (startWidth !== width) {
      laneNodes.forEach(node => {
        reactflow.updateNode(node.id, (node) => {
          node.width = width - titleWidth;
          node.position.x = titleWidth;

          return { ...node }
        })
      })

      return;
      // }
    } else if (posRef.current === Position.Right) {
      laneNodes.forEach(node => {
        reactflow.updateNode(node.id, (node) => {
          node.width = width - titleWidth;
          return { ...node }
        })
      })

      return;
    }

    const diffH = height - startHeight;

    if (posRef.current === Position.Top) {
      let needChangeNode = laneNodes[0];
      reactflow.updateNode(needChangeNode.id, (node) => {
        node.height = node.measured.height + diffH;
        const y = node.position.y;
        node.position.y = y - diffH;
        return { ...node }
      })
    } else if (posRef.current === Position.Bottom) {
      let needChangeNode = laneNodes[laneNodes.length - 1];
      reactflow.updateNode(needChangeNode.id, (node) => {
        node.height = node.measured.height + diffH;
        return { ...node }
      })
    }

    
  }

  return (
    <>
      <NodeResizer
        color="#ff0071"
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
      </NodeToolbar>
      <div className='swinWrap'>
        <div className='title' style={{ width: titleWidth }}>title</div>
      </div>
    </>
  )
}

export default memo(WrapNode);