import React, { memo } from 'react';
import { NodeResizer, NodeToolbar, useNodes, useReactFlow } from '@xyflow/react';
import GroupNode from './GroupNode';
import ChildNode from './childNode';
import { Position } from '@xyflow/react';
import { Button } from 'antd';

let swimCount = 2;
let swinHeight = 200;

const SwimNode = (props) => {
  const { selected = false, data, id } = props;
  const nodes = useNodes();
  const reactflow = useReactFlow();

  const handleAdd = () => {
    console.log(nodes, 'ddd', props)
    const newNode = {
      id: `${id}-${swimCount}`,
      type: 'swimlane',
      position: {
        x: 0,
        y: props.height
      },
      style: {
        width: 450,
        height: swinHeight
      },
      data: { label: `children node${swimCount}` },
      parentId: id,
      extent: 'parent',
      draggable: false,
      zIndex: 6,
      expandParent: true
    }

    reactflow.addNodes(newNode);
    swimCount += 1;
    console.log({
      ...props.style,
      height: props.height + swinHeight
    })
    reactflow.updateNode(id, {
      style: {
        width: props.width,
        height: props.height + swinHeight
      }
    })

  }

  return (
    <>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={100}
        minHeight={30}
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
      <div>
        <div>title</div>
      </div>
    </>
  )
}

export default memo(SwimNode);