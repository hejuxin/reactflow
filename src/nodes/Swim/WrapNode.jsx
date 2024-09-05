import React, { memo } from 'react';
import { NodeResizer, NodeToolbar, useNodeId, useNodes, useReactFlow } from '@xyflow/react';
import { Position } from '@xyflow/react';
import { Button } from 'antd';
import { laneCount, laneCountIncrease, laneHeight, titleWidth, wrapHeight } from '@/utils/swim';
import './index.less';

const WrapNode = (props) => {
  const { selected = false, data, id } = props;
  const nodes = useNodes();
  const reactflow = useReactFlow();

  const handleAdd = () => {
    console.log(nodes, 'ddd', props)
    const newNode = {
      id: `${id}-${laneCount}`,
      type: 'swimlane',
      position: {
        x: titleWidth,
        y: props.height
      },
      style: {
        width: props.width - titleWidth,
        height: laneHeight
      },
      data: { label: `children node${laneCount}` },
      parentId: id,
      extent: 'parent',
      draggable: false,
      zIndex: 6
    }

    reactflow.addNodes(newNode);
    laneCountIncrease()
    console.log({
      ...props.style,
      height: props.height + laneHeight
    })
    reactflow.updateNode(id, (node) => {
      node.width = props.width;
      node.height = props.height + laneHeight
      return {...node}
    }, { replace: true })

  }

  const handleResizeStart = e => {
    const node = nodes.find(node => node.id === id);
    const laneNodes = nodes.filter(node => node.id.startsWith(id) && node.id !== id);

    // laneNodes.forEach(node => {
    //   reactflow.updateNode(node.id, (node) => {
    //     node.extent = '';
    //     return { ...node }
    //   })
    // })

    console.log(props, 'handleResizeStart', node)
  }

  const handleResizeEnd = e => {
    // console.log(e, e.target.clientWidth, 'clientWidth')
    const node = nodes.find(node => node.id === id);

    console.log(props, 'handleResizeEnd', node)
    const { width } = props;
    const laneNodes = nodes.filter(node => node.id.startsWith(id) && node.id !== id);
    console.log(width, 'ddd')

    laneNodes.forEach(node => {
      reactflow.updateNode(node.id, {
        width: width - titleWidth,
        position: {
          x: titleWidth
        }
      })
    })
  }

  return (
    <>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={100}
        minHeight={wrapHeight / 2}
        onResizeStart={handleResizeStart}
        // onResizeEnd={handleResizeEnd}
      />
      <NodeToolbar
        // isVisible={data.forceToolbarVisible || undefined}
        position={Position.Right}
        style={{ background: '#fff' }}
      >
        <Button type='link' onClick={() => handleAdd('down')}>向上加一行</Button>
        <Button type='link' onClick={() => handleAdd('down')}>向下加一行</Button>
      </NodeToolbar>
      {/* <GroupNode>
        <div>
          <div>{data.label}</div>
          <div style={{ width: 200, height: 100, border: '1px solid blue'}}>
            <GroupNode>children1</GroupNode>

          </div>
          <div style={{ width: 200, height: 100, border: '1px solid green'}}>
            <GroupNode>children2</GroupNode>

          </div>
        </div>
      </GroupNode> */}
      <div className='swinWrap'>
        <div className='title' style={{ width: titleWidth }}>title</div>
      </div>
    </>
  )
}

export default memo(WrapNode);