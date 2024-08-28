import React, { memo } from 'react';
import { NodeResizer } from '@xyflow/react';
import ToolbarNode from './ToolbarNode';
const SelectToolbarNode = (props) => {
  const { selected = false } = props;
  return (
    <>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={100}
        minHeight={30}
      />
      <ToolbarNode {...props} />
    </>
  )
}

export default memo(SelectToolbarNode);