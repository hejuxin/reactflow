import React, { memo } from 'react';
import { NodeResizer } from '@xyflow/react';

const GroupNode = (props) => {
  const { selected = false } = props;
  return (
    <>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={100}
        minHeight={30}
      />
      {props.children}
    </>
  )
}

export default memo(GroupNode);