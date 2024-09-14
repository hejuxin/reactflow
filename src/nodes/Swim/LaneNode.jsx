import React, { memo, useState, useMemo, useRef, useEffect } from 'react';
import { NodeResizer, NodeToolbar, useNodes, useReactFlow } from '@xyflow/react';
import cn from 'classnames';
import { createLane, laneDefalutHeight, laneMinHeight, laneMinWidth, deleteLane, getLaneNodes, handleAddLaneHorizontal, ParticipantHorizontal, handleAddLaneVertical } from './utils';
import { useResize } from './useResize'
import Toolbar from './components/Toolbar';
import './index.less';

const LaneNode = (props) => {
  const { selected = false, id, parentId } = props;

  const reactflow = useReactFlow();
  const parentNode = reactflow.getNode(parentId);
  const isHorizontal = parentNode.type === ParticipantHorizontal;

  const { handleResizeStart, handleResize, handleResizeEnd, shouldResize, maxHeight } = useResize(id, parentId);


  const resizerprops = useMemo(() => {
    const newProps = {};

    if (maxHeight) {
      newProps.maxHeight = maxHeight
    } else {
      delete newProps.maxHeight
    }

    return newProps

  }, [maxHeight]);

  return (
    <div className='laneWrap'>
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
      <Toolbar id={id} parentId={parentId} isHorizontal={isHorizontal} />
      {props.data?.label}
    </div>
  )
}

export default memo(LaneNode);