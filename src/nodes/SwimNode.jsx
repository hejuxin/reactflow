import React, { memo } from 'react';
import { NodeResizer } from '@xyflow/react';
import GroupNode from './GroupNode';
import ChildNode from './childNode';

const SwimNode = (props) => {
  const { selected = false, data } = props;
  return (
    <>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={100}
        minHeight={30}
      />
      <GroupNode>
        <div>
          <div>{data.label}</div>
          <div style={{ width: 200, height: 100, border: '1px solid blue'}}>
            <GroupNode>children1</GroupNode>

          </div>
          <div style={{ width: 200, height: 100, border: '1px solid green'}}>
            <GroupNode>children2</GroupNode>

          </div>
        </div>
      </GroupNode>
    </>
  )
}

export default memo(SwimNode);